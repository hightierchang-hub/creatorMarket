import "dotenv/config"; // MUST be first — loads .env before anything else

import express from "express";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import listingRouter from "./routes/listingRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import { stripeWebhook } from "./controllers/paymentController.js";
import { clerkWebhook } from "./controllers/clerkWebhookController.js";
import { connectWithRetry, isDbAvailable } from "./configs/prisma.js";

const app = express();

const allowedOrigins = [
  process.env.VITE_CLIENT_URL,
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'https://creator-market-one.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  return allowedOrigins.includes(origin) || /https:\/\/.*\.vercel\.app$/i.test(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
};

app.use(clerkMiddleware({ clockSkewInMs: 15000 }))

// IMPORTANT: Stripe webhook signature verification needs the raw request
// body, so this route MUST be registered before the global express.json()
// below. Do not move this line down.
app.post("/api/payment/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// Same deal as the Stripe webhook above - Clerk's Svix-based signature check
// (via verifyWebhook in clerkWebhookController.js) needs the raw, untouched
// body, so this must also be registered before express.json(). This is what
// reliably fans clerk/user.created|updated|deleted out to Inngest for EVERY
// account, not just whichever one happens to be configured in Clerk's
// dashboard-side integration.
app.post("/api/clerk/webhook", express.raw({ type: "application/json" }), clerkWebhook);

app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}));

app.get("/", (req, res) => res.send("Server is live"));
app.get("/health", (req, res) => {
  if (isDbAvailable()) {
    return res.status(200).json({ status: "ok", database: "connected" });
  }

  return res.status(503).json({ status: "degraded", database: "disconnected" });
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/listing", listingRouter);
app.use("/api/chat", chatRouter);
app.use("/api/admin", adminRouter);
app.use("/api/payment", paymentRouter);

app.use((err, req, res, next) => {
  const status = err?.statusCode || err?.status || 500;
  const message = err?.message || "Internal server error";

  if (err?.name === "NeonDbError" || err?.code?.startsWith?.("P") || err?.code === "ECONNRESET") {
    console.error("[server] Database error:", err);
    return res.status(503).json({ error: "Database temporarily unavailable", details: message });
  }

  console.error("[server] Unhandled error:", err);
  return res.status(status).json({ error: message });
});

const startServer = async () => {
  const dbReady = await connectWithRetry();
  if (!dbReady) {
    console.warn("[server] Continuing to start without a live database connection.");
  }

  if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }
};

startServer();

export default app;