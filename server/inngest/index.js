import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";
import { sendEmail } from "../configs/resend.js";
import { paymentPendingEmail, paymentSuccessfulEmail, listingSoldEmail, adminSaleNotificationEmail } from "./emailTemplates.js";

// Same comma-separated parsing used in middlewares/authmiddleware.js
const getAdminEmails = () =>
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

const inngest = new Inngest({ id: "profile-marketplace" });

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-creation", triggers: [{ event: "clerk/user.created" }] },
  async ({ event }) => {
    const { data } = event;

    const user = await prisma.user.findFirst({
      where: { id: data.id }
    });

    if (user) {
      await prisma.user.update({
        where: { id: data.id },
        data: {
          email: data?.email_addresses[0]?.email_address,
          name: data?.first_name + " " + data?.last_name,
          image: data?.image_url,
        }
      });
      return;
    }

    await prisma.user.create({
      data: {
        id: data.id,
        email: data?.email_addresses[0]?.email_address,
        name: data?.first_name + " " + data?.last_name,
        image: data?.image_url,
      }
    });
  }
);

const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-deletion", triggers: [{ event: "clerk/user.deleted" }] },
  async ({ event }) => {
    const { data } = event;

    const listings = await prisma.listing.findMany({
      where: { ownerId: data.id }
    });

    const chats = await prisma.chat.findMany({
      where: { OR: [{ ownerUser: data.id }, { chatUserId: data.id }] }
    });

    const transactions = await prisma.transaction.findMany({
      where: { userId: data.id }
    });

    if (listings.length === 0 && chats.length === 0 && transactions.length === 0) {
      await prisma.user.delete({ where: { id: data.id } });
    } else {
      await prisma.listing.updateMany({
        where: { ownerId: data.id },
        data: { status: "inactive" }
      });
    }
  }
);

const syncUserUpdation = inngest.createFunction(
  { id: "sync-user-updation", triggers: [{ event: "clerk/user.updated" }] },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.update({
      where: { id: data.id },
      data: {
        email: data?.email_addresses[0]?.email_address,
        name: data?.first_name + " " + data?.last_name,
        image: data?.image_url,
      }
    });
  }
);

// ---------------------------------------------------------------------------
// Payment notification emails
// ---------------------------------------------------------------------------
// These are triggered by inngest.send(...) calls from paymentController.js -
// checkout/initiate emits "payment/pending", and finalizeTransaction (the
// one place that ever marks a transaction paid) emits "payment/paid", which
// fans out to both the buyer (receipt) and the seller (sold notice).
//
// NOTE: Transaction.ownerId is the seller (copied from listing.ownerId at
// checkout time in paymentController.js), so seller lookups use
// transaction.ownerId directly.

// ---------------------------------------------------------------------------
// Payment notification emails
// ---------------------------------------------------------------------------

const notifyPaymentPending = inngest.createFunction(
  { id: "notify-payment-pending", triggers: [{ event: "payment/pending" }] },
  async ({ event }) => {
    console.log("payment/pending event:", JSON.stringify(event, null, 2));

    const { transactionId } = event.data;

    if (!transactionId) {
      throw new Error(
        `payment/pending event missing transactionId.\nEvent: ${JSON.stringify(
          event.data,
          null,
          2
        )}`
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { listing: true },
    });

    if (!transaction) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    const buyer = await prisma.user.findUnique({
      where: { id: transaction.userId },
    });

    if (!buyer) {
      throw new Error(`Buyer not found: ${transaction.userId}`);
    }

    const { subject, html } = paymentPendingEmail({
      buyerName: buyer.name,
      listingTitle: transaction.listing.title,
      amount: transaction.amount,
      currency: transaction.currency,
    });

    await sendEmail({
      to: buyer.email,
      subject,
      html,
    });
  }
);

const notifyPaymentSuccessful = inngest.createFunction(
  { id: "notify-payment-successful", triggers: [{ event: "payment/paid" }] },
  async ({ event }) => {
    console.log("payment/paid event:", JSON.stringify(event, null, 2));

    const { transactionId } = event.data;

    if (!transactionId) {
      throw new Error(
        `payment/paid event missing transactionId.\nEvent: ${JSON.stringify(
          event.data,
          null,
          2
        )}`
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { listing: true },
    });

    if (!transaction) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    const buyer = await prisma.user.findUnique({
      where: { id: transaction.userId },
    });

    if (!buyer) {
      throw new Error(`Buyer not found: ${transaction.userId}`);
    }

    const { subject, html } = paymentSuccessfulEmail({
      buyerName: buyer.name,
      listingTitle: transaction.listing.title,
      amount: transaction.amount,
      currency: transaction.currency,
    });

    await sendEmail({
      to: buyer.email,
      subject,
      html,
    });
  }
);

const notifyListingSold = inngest.createFunction(
  { id: "notify-listing-sold", triggers: [{ event: "payment/paid" }] },
  async ({ event }) => {
    console.log("payment/paid event:", JSON.stringify(event, null, 2));

    const { transactionId } = event.data;

    if (!transactionId) {
      throw new Error(
        `payment/paid event missing transactionId.\nEvent: ${JSON.stringify(
          event.data,
          null,
          2
        )}`
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { listing: true },
    });

    if (!transaction) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    const seller = await prisma.user.findUnique({
      where: { id: transaction.ownerId },
    });

    if (!seller) {
      throw new Error(`Seller not found: ${transaction.ownerId}`);
    }

    const { subject, html } = listingSoldEmail({
      sellerName: seller.name,
      listingTitle: transaction.listing.title,
      amount: transaction.amount,
      currency: transaction.currency,
    });

    await sendEmail({
      to: seller.email,
      subject,
      html,
    });
  }
);

const notifyAdminOnSale = inngest.createFunction(
  { id: "notify-admin-on-sale", triggers: [{ event: "payment/paid" }] },
  async ({ event }) => {
    console.log("payment/paid event:", JSON.stringify(event, null, 2));

    const adminEmails = getAdminEmails();
    if (adminEmails.length === 0) return;

    const { transactionId } = event.data;

    if (!transactionId) {
      throw new Error(
        `payment/paid event missing transactionId.\nEvent: ${JSON.stringify(
          event.data,
          null,
          2
        )}`
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { listing: true },
    });

    if (!transaction) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    const [buyer, seller] = await Promise.all([
      prisma.user.findUnique({
        where: { id: transaction.userId },
      }),
      prisma.user.findUnique({
        where: { id: transaction.ownerId },
      }),
    ]);

    const { subject, html } = adminSaleNotificationEmail({
      listingTitle: transaction.listing.title,
      amount: transaction.amount,
      currency: transaction.currency,
      paymentMethod: transaction.paymentMethod,
      buyerName: buyer?.name,
      buyerEmail: buyer?.email,
      sellerName: seller?.name,
      sellerEmail: seller?.email,
    });

    await sendEmail({
      to: adminEmails,
      subject,
      html,
    });
  }
);
const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  notifyPaymentPending,
  notifyPaymentSuccessful,
  notifyListingSold,
  notifyAdminOnSale,
];

export { inngest, functions };