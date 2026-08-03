import { verifyWebhook } from "@clerk/express/webhooks";
import { inngest } from "../inngest/index.js";

// Mounted with express.raw() in server.js, before the global express.json() -
// verifyWebhook (Svix under the hood) needs the untouched raw request body
// to check the signature, same reason the Stripe webhook route is raw too.
//
// This replaces relying on Clerk's dashboard-side "native Inngest
// integration" - we own the delivery path end-to-end here, so ANY user
// signing up / editing their profile / being deleted (not just a specific
// account) reliably reaches sync-user-creation / -updation / -deletion,
// regardless of what's toggled on in Clerk's dashboard.
export const clerkWebhook = async (req, res) => {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.log("Clerk webhook signature verification failed:", err.message);
    return res.status(400).json({ message: "Webhook verification failed" });
  }

  const eventMap = {
    "user.created": "clerk/user.created",
    "user.updated": "clerk/user.updated",
    "user.deleted": "clerk/user.deleted",
  };

  const inngestEventName = eventMap[evt.type];

  // Not a user event (e.g. session.*, organization.*) - ack and ignore.
  if (!inngestEventName) {
    return res.status(200).json({ received: true });
  }

  try {
    await inngest.send({ name: inngestEventName, data: evt.data });
    return res.status(200).json({ received: true });
  } catch (error) {
    console.log("Failed to forward Clerk webhook to Inngest:", error);
    // Non-2xx so Clerk retries with its own backoff. Safe to retry -
    // sync-user-creation/-updation are upserts and sync-user-deletion is a
    // straight lookup-then-delete, so replaying the same event again won't
    // double-apply anything.
    return res.status(500).json({ received: false });
  }
};
