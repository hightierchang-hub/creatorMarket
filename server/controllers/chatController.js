import prisma from "../configs/prisma.js";
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

// Controller for getting chat ( creating if not exist )
export const getChat = async (req, res) =>{
    try{
        const { userId } = await req.auth();
        
        // Ensure user exists in database
        await ensureUserExists(userId);
        const { listingId, chatId } = req.body;

        const listing = await prisma.listing.findUnique({
            where: {id: listingId}
        })

        if(!listing){
            return res.status(404).json({ message: "Listing not found" });
        }

        // Find Existing Chat
        let existingChat= null;
        if(chatId){
            existingChat = await prisma.chat.findFirst({
                where: {id: chatId, OR: [{ chatUserId: userId }, { ownerUserId:userId }]}, 
                include: { listing: true, ownerUser: true, chatUser: true, messages: true }
            })
        }else{
            existingChat = await prisma.chat.findFirst({
                where: {listingId, chatUserId: userId, ownerUserId: listing.ownerId},
                include: { listing: true, ownerUser: true, chatUser: true, messages: true }
            })
        }

        if(existingChat){
            res.json({ chat: existingChat });
            if(existingChat.isLastMessageRead === false){
                const lastMessage = existingChat.messages[existingChat.messages.length - 1]
                const isLastMessageSendByMe = lastMessage.sender_id === userId; 

                if(!isLastMessageSendByMe){
                    await prisma.chat.update({
                        where: { id: existingChat.id },
                        data: { isLastMessageRead: true }
                    })
                }
            }
            return null
        }

        const newChat = await prisma.chat.create({
            data: {
                listingId,
                chatUserId: userId,
                ownerUserId: listing.ownerId,
            }
        })

        const chatWithData = await prisma.chat.findUnique({
            where: {id: newChat.id},
            include: { listing:true, ownerUser: true, chatUser: true }
        })
        return res.json({ chat: chatWithData });

    } catch(error){
        console.log(error);
        res.status(500).json({ message: error.code || error.message })
    }
}

// Controller For Getting ALL Chats for user
export const getAllUserChats = async (req, res) =>{
    try{
        const { userId } = await req.auth();
        const chats = await prisma.chat.findMany({
            where: {OR: [{ chatUserId: userId }, { ownerUserId: userId }]},
            include: { listing: true, ownerUser: true, chatUser: true },
            orderBy: {
                updatedAt: 'desc'
            },
        })

        return res.json({ chats });

    } catch (error){
        console.log(error);
        res.status(500).json({ message: error.code || error.message });
    }
}

// Controller for adding Message to Chat
export const sendChatMessage = async (req, res) =>{
    try {
        const { userId } = await req.auth();
        const { chatId, message } = req.body;
        const chat = await prisma.chat.findFirst({
            where: {
                AND: [{ id: chatId }, { OR: [{ chatUserId: userId }, { ownerUserId: userId }] }]
            },
            include: { listing: true, ownerUser: true, chatUser: true }
        })

        if (!chat){
            return res.status(400).json({ message: "Chat not found" });
        }else if(chat.listing.status !== "active"){
            return res.status(400).json({ message: `Listing is ${chat.listing.status}` });
        }
        const newMessage = {
            message,
            sender_id: userId,
            chatId,
            createdAt: new Date()
        }

        const createdMessage = await prisma.message.create({
            data: newMessage
        })
        res.json({ message: "Message Sent", newMessage: createdMessage })

        await prisma.chat.update({
            where: { id: chatId },
            data: {lastMessage: newMessage.message, isLastMessageRead: false, lastMessageSenderId: userId}
        })

    } catch (error) {
       console.log(error);
       res.status(500).json({ message: error.code || error.message }) 
    }
}