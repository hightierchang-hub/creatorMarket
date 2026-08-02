import express from "express";
import { addCredential, addListing, deleteUserListing, getAllPublicListing, getAllUserListings, getAllUserOrders, markFeatured, toggleStatus, updateListing, withdrawAmount } from "../controllers/listingController.js";
import { protect } from "../middlewares/authmiddleware.js";
import upload from "../configs/multer.js";

const listingRouter = express.Router();

listingRouter.post('/',upload.array("images", 5),protect, addListing)
listingRouter.put('/',upload.array("images", 5),protect, updateListing)
listingRouter.get('/public', getAllPublicListing)
listingRouter.get('/user',protect ,getAllUserListings)
listingRouter.put('/:id/status',protect ,toggleStatus)
listingRouter.delete('/:listingId',protect ,deleteUserListing)
listingRouter.post('/add-credential',protect ,addCredential)
listingRouter.put('/featured/:id',protect ,markFeatured)
listingRouter.get('/user-orders',protect ,getAllUserOrders)
listingRouter.post('/withdraw',protect ,withdrawAmount)

export default listingRouter