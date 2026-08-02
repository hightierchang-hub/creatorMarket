import express from "express";
import { protect, protectAdmin } from "../middlewares/authmiddleware.js";
import { isAdmin, getDashboard, getAllListings, changeStatus, getAllUnverifiedListings, getCredential, markCredentialVerified, getAllUnchangedListings,
 changeCredential, getAllTransactions, getAllWithdrawRequests, markWithdrawalAsPaid } from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.get("/admin", protect, protectAdmin, isAdmin);
adminRouter.get("/dashboard", protect, protectAdmin, getDashboard);
adminRouter.get("/all-listings", protect, protectAdmin, getAllListings);
adminRouter.put("/change-status/:listingId", protect, protectAdmin, changeStatus);
adminRouter.get("/unverified-listings", protect, protectAdmin, getAllUnverifiedListings);
adminRouter.get("/credential/:listingId", protect, protectAdmin, getCredential);
adminRouter.put("/verify-credentials/:listingId", protect, protectAdmin, markCredentialVerified);
adminRouter.get("/unchanged-listings", protect, protectAdmin, getAllUnchangedListings);
adminRouter.put("/change-credentials/:listingId", protect, protectAdmin, changeCredential);
adminRouter.get("/transactions", protect, protectAdmin, getAllTransactions);
adminRouter.get("/withdraw-requests", protect, protectAdmin, getAllWithdrawRequests);
adminRouter.put("/withdrawal-mark/:id", protect, protectAdmin, markWithdrawalAsPaid);

export default adminRouter;