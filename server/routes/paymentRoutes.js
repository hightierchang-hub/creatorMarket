import express from "express";
import { protect } from "../middlewares/authmiddleware.js";
import {
  createStripeCheckout,
  initiateEsewaPayment,
  esewaSuccessCallback,
  esewaFailureCallback,
  getTransactionStatus,
} from "../controllers/paymentController.js";

const paymentRouter = express.Router();

// Generic - used by the frontend to poll a transaction's confirmed status
// regardless of which gateway was used.
paymentRouter.get("/status/:transactionId", protect, getTransactionStatus);

// Stripe (webhook route is mounted separately in server.js, before express.json())
paymentRouter.post("/stripe/checkout/:listingId", protect, createStripeCheckout);

// eSewa - callback routes are public since eSewa itself redirects the
// user's browser here (no auth header available on that request)
paymentRouter.post("/esewa/checkout/:listingId", protect, initiateEsewaPayment);
paymentRouter.get("/esewa/callback/success", esewaSuccessCallback);
paymentRouter.get("/esewa/callback/failure", esewaFailureCallback);

export default paymentRouter;
