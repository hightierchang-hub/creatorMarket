import imagekit from "../configs/imageKit.js";
import prisma from "../configs/prisma.js";
import fs from "fs";

// Controller for Adding Listing to database
export const addListing = async (req, res) =>{
    try{
        const {userId} = await req.auth();
        if(req.plan !== "premium"){
            const listingCount = await prisma.listing.count({
                where: {ownerId: userId}
            })
            if(listingCount >= 5){
                return res.status(400).json({ message: "you have reached the free listing limit" });
            }
        }
        const accountDetails = JSON.parse(req.body.accountDetails)

        accountDetails.followers_count = parseFloat(accountDetails.followers_count)
        accountDetails.engagement_rate = parseFloat(accountDetails.engagement_rate)
        accountDetails.monthly_views = parseFloat(accountDetails.monthly_views)
        accountDetails.price = parseFloat(accountDetails.price)
        accountDetails.platform = accountDetails.platform.toLowerCase();
        accountDetails.niche = accountDetails.niche.toLowerCase();

        accountDetails.username.startsWith("@") ? accountDetails.username = accountDetails.username.slice(1) : null;

        let images = [];
       if (req.files?.length > 0 && imagekit) {
            const uploadImages = req.files.map(async (file)=>{
                const response = await imagekit.files.upload({
                    file: fs.createReadStream(file.path),
                    fileName: `${Date.now()}.png`,
                    folder: "flip-earn",
                    transformation: {pre: "w-1280,h-auto"}
                });
                return response.url
            })

            images = await Promise.all(uploadImages);
       }

       const listing = await prisma.listing.create({
        data: {
        ownerId: userId,
        images,
        ...accountDetails
        }
       })

       return res.status(201).json({ message: "Account Listed successfully", listing});
    } catch (error) {
        console.log(error);
        res,status(500).json({ message: error.code || error.message });
    }
}

// Controller For Getting all Public Listing
export const getAllPublicListing = async (req, res) =>{
    try {
        const listings = await prisma.listing.findMany({
            where: { status: "active" },
            orderBy: { createdAt: "desc" },
            include: { owner: true }
        })

        if(!listings || listings.length === 0){
            return res.json({ listings: [] });
        }

        return res.json({ listings })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message })
    }
}

//Controller for Getting All User Listing
export const getAllUserListings = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const listings = await prisma.listing.findMany({
            where: { ownerId: userId, status: { not: "deleted" } },
            orderBy: { createdAt: "desc" },
            include: { owner: true }
        })

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        const balance = {
            earned: user?.earned ?? 0,
            withdrawn: user?.withdrawn ?? 0,
            available: (user?.earned ?? 0) - (user?.withdrawn ?? 0),
        }

        if(!listings || listings.length === 0){
            return res.json({ listings: [], balance });
        }
        return res.json({ listings, balance })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message });
    }
}

// Controller For Updating Listing in Database
export const updateListing = async (req, res) =>{
    try{
        const { userId } = await req.auth();
        const accountDetails = JSON.parse(req.body.accountDetails)

        if((req.files?.length || 0) + (accountDetails.images?.length || 0) > 5){
            return res.status(400).json({ message:"You can only upload up to 5 images" });
        }

        accountDetails.followers_count = parseFloat(accountDetails.followers_count)
        accountDetails.engagement_rate = parseFloat(accountDetails.engagement_rate)
        accountDetails.monthly_views = parseFloat(accountDetails.monthly_views)
        accountDetails.price = parseFloat(accountDetails.price)
        accountDetails.platform = accountDetails.platform.toLowerCase();
        accountDetails.niche = accountDetails.niche.toLowerCase();

        if (typeof accountDetails.username === 'string' && accountDetails.username.startsWith("@")) {
            accountDetails.username = accountDetails.username.slice(1)
        }

        const listing = await prisma.listing.findUnique({
            where: { id: accountDetails.id, ownerId: userId }
        })

        if(!listing){
            return res.status(400).json({message: "Listing not found"});
        }

        if(listing.status === "sold"){
            return res.status(400).json({message: "you can't update sold listing"});
        }

        const updateData = {
            title: accountDetails.title,
            platform: accountDetails.platform,
            username: accountDetails.username,
            followers_count: accountDetails.followers_count,
            engagement_rate: accountDetails.engagement_rate,
            monthly_views: accountDetails.monthly_views,
            niche: accountDetails.niche,
            price: accountDetails.price,
            description: accountDetails.description,
            verified: accountDetails.verified,
            monetized: accountDetails.monetized,
            country: accountDetails.country,
            age_range: accountDetails.age_range,
            images: accountDetails.images || []
        }

        if((req.files?.length || 0) > 0){
            if (imagekit) {
                const uploadImages = (req.files || []).map(async (file)=>{
                    const response = await imagekit.files.upload({
                    file: fs.createReadStream(file.path),
                    fileName: `${Date.now()}.png`,
                    folder: "flip-earn",
                    transformation: {pre: "w-1280,h-auto"}
                    });
                    return response.url
                })

                const images = await Promise.all(uploadImages);
                updateData.images = [...(accountDetails.images || []), ...images];
            } else {
                console.warn('ImageKit is not configured, listing updated without new images');
                updateData.images = accountDetails.images || [];
            }
        }

        const updatedListing = await prisma.listing.update({
            where: { id: accountDetails.id, ownerId: userId },
            data: updateData
        })

        return res.json({ message: "Account Updated Successfully", listing: updatedListing });

    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.code || error.message});
    }
}

export const toggleStatus = async (req, res) =>{
    try{
        const {id} = req.params;
        const { userId } = await req.auth();

        const listing = await prisma.listing.findUnique({
            where: {id, ownerId: userId},
        })

        if(!listing){
         return res.status(400).json({message: "Listing not found"});
        }

        if(listing.status === "active" || listing.status === "inactive"){
            await prisma.listing.update({
                where: {id, ownerId: userId},
                data: {status: listing.status === "active" ? "inactive" : "active"}
            })
        }else if(listing.status === "ban"){
            return res.status(400).json({ message: "Your listing is banned"})
        }else if(listing.status === "sold"){
            return res.status(400).json({ message: "Your listing is sold"})
        }

        return res.json({ message: "Listing status updated successfully", listing});
    } catch(error){
        console.log(error);
        res.status(500).json({message: error.code || error.message});
    }
}

export const deleteUserListing = async (req, res) =>{
    try{
        const {userId} = await req.auth();
        const {listingId} = req.params;

        const listing = await prisma.listing.findFirst({
            where: {id: listingId, ownerId: userId},
            include: {owner: true},
        })
        if(!listing){
            return res.status(404).json({ message:"Listing not found"})
        }

        if(listing.status === "sold"){
            return res.status(400).json({ messages: "sold listing can't be deleted"})
        }

        // If password has been changed, send the new password to the owner
        if(listing.isCredentialChanged){
            // send email to owner
        }
        await prisma.listing.update({
            where: { id: listingId },
            data: { status: "deleted" }
        })

        return res.json({ message: "Listing deleted successfully" })
    } catch (error){
        console.log(error);
        res.status(500).json({ message: error.code || error.message});
    }
}

export const addCredential = async (req, res) =>{
    try{
        const { userId } = await req.auth();
        const { listingId, credential } = req.body;

        if(!listingId || !Array.isArray(credential) || credential.length === 0){
            return res.status(400).json({message: "Missing Fields"});
        }

        const listing = await prisma.listing.findFirst({
            where: { id: listingId, ownerId: userId },
        })

        if (!listing){
            return res.status(404).json({ message: "Listing not found or you are not the owner"});
        }

        await prisma.credential.create({
            data: {
                listingId,
                originalCredential: credential
            }
        })

        await prisma.listing.update({
            where: { id:listingId },
            data: { isCredentialSubmitted: true, isCredentialVerified: false, isCredentialChanged: false }
        })

        return res.json({ message: "Credential added successfully"})

    } catch (error) {
         console.log(error);
        res.status(500).json({ message: error.code || error.message});
    }
}
export const markFeatured = async (req, res) => {
    try{
        const { id } = req.params;
        const { userId } = await req.auth();

        if (req.plan !== "premium"){
            return res.status(400).json({ message: "Premium plan required"})
        }

        // Get current featured status
        const listing = await prisma.listing.findUnique({
            where: { id }
        })

        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        // Toggle featured status
        if (listing.featured) {
            // Unfeature the listing
            await prisma.listing.update({
                where: { id },
                data: { featured: false }
            })
            return res.json({ message: "Listing removed from featured" });
        } else {
            // Unset all other featured listings
            await prisma.listing.updateMany({
                where: { ownerId: userId },
                data: { featured: false }
            })

            // Mark the listings as featured
            await prisma.listing.update({
                where: { id },
                data: { featured: true }
            })
            return res.json({ message: "Listing marked as featured" });
        }

    } catch (error){
        console.log(error);
        res.status(500).json({ message: error.code || error.message });
    }
}

export const getAllUserOrders = async (req, res) =>{
    try {
        const { userId } = await req.auth();
        let orders = await prisma.transaction.findMany({
            where: {userId, isPaid: true},
            include: { listing: true },
        })
        if(!orders || orders.length === 0){
            return res.json({ orders: [] });
        }

        //Attach the credentils to each other
        const credentials = await prisma.credential.findMany({
            where: {listingId: {in: orders.map((order)=>order.listingId)}}
        })

        const ordersWithCredentials = orders.map((order)=>{
            const credential = credentials.find((cred)=>cred.listingId === order.listingId)
            return {...order, credential}
        })

        return res.json({ orders: ordersWithCredentials});
    } catch (error){
        console.log(error);
        res.status(500).json({ message: error.code || error.message });
    }
}

export const withdrawAmount = async (req,res) =>{
    try{
        const { userId } = await req.auth();
        const {amount, account} = req.body;

        const user = await prisma.user.findUnique({where: {id: userId}})

        const balance = user.earned - user.withdrawn

        if(amount > balance){
            return res.status(400).json({message: "Insufficient balance"});
        }

        const withdrawal = await prisma.withdrawal.create({
            data: {
                userId, amount, account
            }
        })

        await prisma.user.update({
            where: {id: userId},
            data: {withdrawn: {increment: amount}}
        })

        return res.json({ message: "Applied for wihdrawal", withdrawal});

    } catch(error){
        console.log(error);
        res.status(500).json({ message: error.code || error.message });
    }
}

// Purchasing is now handled by the payment gateway routes:
// POST /api/payment/stripe/checkout/:listingId
// POST /api/payment/esewa/checkout/:listingId
// See server/contollers/paymentController.js