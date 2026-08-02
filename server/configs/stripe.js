import Stripe from "stripe";

// STRIPE_SECRET_KEY must be set in server/.env (test key while developing,
// live key in production). Never expose this key to the client.
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2022-11-15",
      maxNetworkRetries: 2,
    })
  : null;

export default stripe;
