import prisma from "../configs/prisma.js";
import stripe from "../configs/stripe.js";
import { buildEsewaFormFields, verifyEsewaSignature, checkEsewaStatus, convertUsdToNpr } from "../configs/esewa.js";
import { inngest } from "../inngest/index.js";
import { clerkClient } from '@clerk/express';

// Helper to ensure user exists in DB
const ensureUserExists = async (userId) => {
  let user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    try {
      const clerkUser = await clerkClient.users.getUser(userId);
      user = await prisma.user.create({
        data: {
          id: userId,
          email: clerkUser?.emailAddresses?.[0]?.emailAddress || '',
          name: `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim(),
          image: clerkUser?.imageUrl || '',
        }
      });
    } catch (err) {
      console.error('Failed to create user record:', err);
      throw { status: 500, message: 'Failed to create user account' };
    }
  }
  
  return user;
};

const CLIENT_URL = process.env.VITE_CLIENT_URL || "http://localhost:5173";
const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const getPurchasableListing = async (listingId, userId) => {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, status: "active" },
  });

  if (!listing) throw { status: 400, message: "Listing not found or not active" };
  if (!listing.isCredentialVerified) {
    throw { status: 400, message: "This listing isn't ready for purchase yet" };
  }
  if (listing.ownerId === userId) {
    throw { status: 400, message: "You can't purchase your own listing" };
  }
  return listing;
};

// The single place that ever marks a transaction "paid" and moves money.
// Every gateway path funnels through here, and it's only ever called after
// server-side verification (webhook signature, direct capture call, or
// signed+status-checked callback) - never from a bare client redirect.
const finalizeTransaction = async (transactionId) => {
  const { transaction, justPaid } = await prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findUnique({ where: { id: transactionId } });
    if (!existing) return { transaction: null, justPaid: false };
    if (existing.isPaid) return { transaction: existing, justPaid: false }; // idempotent - webhooks can fire more than once

    const updated = await tx.transaction.update({
      where: { id: transactionId },
      data: { isPaid: true },
    });

    await tx.user.update({
      where: { id: existing.ownerId },
      data: { earned: { increment: existing.amount } },
    });

    await tx.listing.update({
      where: { id: existing.listingId },
      data: { status: "sold" },
    });

    return { transaction: updated, justPaid: true };
  });

  // Fire only on the transition into "paid" so webhook retries never send
  // duplicate emails. Fans out to both the buyer receipt and seller "sold"
  // notification (see server/inngest/index.js).
  if (transaction && justPaid) {
    await inngest.send({ name: "payment/paid", data: { transactionId: transaction.id } });
  }

  return transaction;
};

// Generic status check used by the frontend to poll after redirect, no
// matter which gateway was used.
export const getTransactionStatus = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { transactionId } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    return res.json({ isPaid: transaction.isPaid, transaction });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// Stripe
// ---------------------------------------------------------------------------

export const createStripeCheckout = async (req, res) => {
  try {
    if (!stripe) {
      throw { status: 503, message: "Stripe is not configured on the server" };
    }

    const { userId } = await req.auth();
    
    // Ensure both buyer and seller exist in database
    await ensureUserExists(userId);
    
    const { listingId } = req.params;

    if (!listingId) {
      throw { status: 400, message: "Missing listing ID" };
    }

    const listing = await getPurchasableListing(listingId, userId);

    if (typeof listing.price !== 'number' || Number.isNaN(listing.price) || listing.price <= 0) {
      throw { status: 400, message: "Listing price is invalid" };
    }
    
    // Ensure seller exists in database
    await ensureUserExists(listing.ownerId);

    const transaction = await prisma.transaction.create({
      data: {
        listingId,
        ownerId: listing.ownerId,
        userId,
        amount: listing.price,
        currency: "USD",
        paymentMethod: "stripe",
      },
    });

    await inngest.send({ name: "payment/pending", data: { transactionId: transaction.id } });

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: listing.title },
              unit_amount: Math.round(listing.price * 100),
            },
            quantity: 1,
          },
        ],
        metadata: { transactionId: transaction.id, listingId, userId },
        success_url: `${CLIENT_URL}/payment/success?transactionId=${transaction.id}`,
        cancel_url: `${CLIENT_URL}/payment/cancel?transactionId=${transaction.id}`,
      });
    } catch (stripeError) {
      console.error("Stripe session creation failed:", stripeError);
      await prisma.transaction.delete({ where: { id: transaction.id } });
      throw stripeError;
    }

    if (!session || !session.url) {
      throw { status: 500, message: "Stripe checkout session could not be created" };
    }

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { gatewayTxnId: session.id },
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    res.status(error.status || 500).json({ message: error.message || "Stripe checkout failed" });
  }
};

// Mounted with express.raw() in server.js - do NOT put express.json() before it.
export const stripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log("Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.payment_status === "paid" && session.metadata?.transactionId) {
        await finalizeTransaction(session.metadata.transactionId);
      }
    }
    return res.json({ received: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// eSewa
// ---------------------------------------------------------------------------

export const initiateEsewaPayment = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { listingId } = req.params;
    const listing = await getPurchasableListing(listingId, userId);

    // Ensure both buyer and seller exist in database
    await ensureUserExists(userId);
    await ensureUserExists(listing.ownerId);

    // eSewa only settles in NPR - the canonical `amount` stays in USD for
    // consistent accounting; the converted NPR figure is recorded alongside it.
    const amountNpr = convertUsdToNpr(listing.price);

    const transaction = await prisma.transaction.create({
      data: {
        listingId,
        ownerId: listing.ownerId,
        userId,
        amount: listing.price,
        currency: "USD",
        paymentMethod: "esewa",
        convertedAmount: amountNpr,
        convertedCurrency: "NPR",
      },
    });

    await inngest.send({ name: "payment/pending", data: { transactionId: transaction.id } });

    const { gatewayUrl, fields } = buildEsewaFormFields({
      amount: amountNpr,
      transactionUuid: transaction.id,
      successUrl: `${SERVER_URL}/api/payment/esewa/callback/success`,
      failureUrl: `${SERVER_URL}/api/payment/esewa/callback/failure`,
    });

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { gatewayTxnId: transaction.id },
    });

    return res.json({ gatewayUrl, fields });
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({ message: error.message || "eSewa checkout failed" });
  }
};

// eSewa redirects the browser here with ?data=<base64 JSON> - this is a
// public, unauthenticated GET endpoint, so we never trust its contents
// without (1) verifying the HMAC signature and (2) independently asking
// eSewa's status API to confirm the transaction is COMPLETE.
export const esewaSuccessCallback = async (req, res) => {
  try {
    const encoded = req.query.data;
    if (!encoded) return res.redirect(`${CLIENT_URL}/payment/cancel?reason=missing_data`);

    const decoded = JSON.parse(Buffer.from(encoded, "base64").toString("utf-8"));

    if (!verifyEsewaSignature(decoded)) {
      console.log("eSewa callback signature mismatch", decoded);
      return res.redirect(`${CLIENT_URL}/payment/cancel?reason=signature`);
    }

    const transaction = await prisma.transaction.findFirst({
      where: { id: decoded.transaction_uuid, paymentMethod: "esewa" },
    });
    if (!transaction) return res.redirect(`${CLIENT_URL}/payment/cancel?reason=not_found`);

    const statusCheck = await checkEsewaStatus({
      productCode: decoded.product_code,
      transactionUuid: decoded.transaction_uuid,
      totalAmount: decoded.total_amount,
    });

    if (decoded.status === "COMPLETE" && statusCheck.status === "COMPLETE") {
      await finalizeTransaction(transaction.id);
      return res.redirect(`${CLIENT_URL}/payment/success?transactionId=${transaction.id}`);
    }

    return res.redirect(`${CLIENT_URL}/payment/cancel?reason=not_completed`);
  } catch (error) {
    console.log(error);
    return res.redirect(`${CLIENT_URL}/payment/cancel?reason=error`);
  }
};

export const esewaFailureCallback = async (_req, res) => {
  return res.redirect(`${CLIENT_URL}/payment/cancel`);
};
