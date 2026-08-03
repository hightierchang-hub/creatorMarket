import React, { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Loader2Icon, Send, X } from 'lucide-react'
import { clearChat } from '../app/features/chatSlice'
import { motion } from 'framer-motion'
import {format} from 'date-fns'
import { useAuth, useUser } from '@clerk/clerk-react'
import api from '../configs/axios'
import { toast } from 'react-hot-toast'

const ChatBox = () => {

  const { listing, isOpen, chatId } = useSelector((state) => state.chat)
  const dispatch = useDispatch()
  const { getToken } = useAuth()
  const { user } = useUser()
  
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const fetchChat = async () => {
   try {
      const token = await getToken()
      const {data} =await api.post('/api/chat', {listingId: listing.id, chatId}, {headers: { Authorization: `Bearer ${token}` }})
      setChat(data?.chat)
      setMessages(data?.chat?.messages || [])
      setIsLoading(false)
   } catch  (error) {
    toast.error(error?.response?.data?.message || error.message);
    console.log(error);
   }
  }
    useEffect(()=>{
        if(listing){
          fetchChat()
          const interval = setInterval(()=>{
            fetchChat();
          },3000)
          return ()=> clearInterval(interval)
        }
    }, [listing])

    useEffect(()=>{
      if(!isOpen){
      setChat(null)
      setMessages([])
      setIsLoading(true)
      setNewMessage("")
      setIsSending(false)
      }
    }, [isOpen])

    // --- For Aut Scroll --- 
    const messageEndRef = useRef(null)
    useEffect(()=>{
      messageEndRef.current?.scrollIntoView({behavior: "smooth"})
    },[messages.length])

    const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!newMessage.trim() || isSending) return;

      try {
         setIsSending(true);
         const token = await getToken();
         const {data} =await api.post('/api/chat/send-message', { chatId: chat.id, message: newMessage}, {headers: { Authorization: `Bearer ${token}` }})
         setMessages([...messages,data.newMessage])
         setNewMessage("")
         setIsSending(false)
      } catch (error) {
        toast.error(error?.response?.data?.message || error?.message);
        console.log(error);
        setIsSending(false);
      }
    }


    if (!isOpen || !listing) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-100 flex items-center justify-center'
    >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className='bg-white dark:bg-gray-900 sm:rounded-lg shadow-2xl w-full max-w-2xl h-screen sm:h-150 flex flex-col'
        >
            
            {/*Header*/}
          <div className='bg-linear-to-r from-indigo-600 to-indigo-400 text-white p-4 sm:rounded-t-lg flex items-center justify-between'>
            <div className='flex-1 min-w-0'>
              <h3 className='font-semibold text-lg tracking-tight '>{listing?.title}</h3>
               <p className='text-sm text-indigo-100 truncate'>{user.id === listing?.ownerId ? `Chatting with buyer 
               (${chat?.chatUser?.name || 'Loading...'})` : `Chatting with seller 
               (${chat?.chatUser?.name || 'Loading...'})`}</p>
            </div>

             <motion.div whileHover={{scale: 1.2}}
            whileTap={{scale: 1.02 }}>
            <button onClick={()=> dispatch(clearChat())}>
              <X className='w-5 h-5'/>
            </button>
            </motion.div>

          </div>

          {/*Message Area*/}
          <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100 dark:bg-gray-800'>
            {
              isLoading ? (
                <div className='flex items-center justify-center h-full'>
                    <Loader2Icon className='size-6 animate-spin text-indigo-600'/>
                </div>
            ) :messages.length === 0 ? (
              <div className='flex items-center justify-center h-full'>
                <div className='text-center'>
                  <p className='text-gray-500 dark:text-gray-400 mb-2'>No messages yet</p>
                  <p className='text-sm text-gray-400 dark:text-gray-500'>Start the conversation!</p>
                  </div> 

              </div>
             ) : (
              messages.map((message, index) => {
                const isOwnMessage = (message.senderId || message.sender_id) === user.id
                const messageKey = message.id || `${message.createdAt || 'temp'}-${index}`

                return (
                  <div key={messageKey} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg p-3 pb-1 ${isOwnMessage ? "bg-indigo-600 text-white"
                       : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100"}`}>
                      <p className='text-sm wrap-break-word whitespace-pre-wrap'>{message.message}</p>
                      <p className={`text-[10px] mt-1 ${isOwnMessage ? "text-indigo-200" : "text-gray-400 dark:text-gray-500"}`}>
                        {format(new Date(message.createdAt), "MMM dd, 'at' h:mm a")}</p>
                    </div>
                  </div>
                )
              })
             )}
             <div ref={messageEndRef}/>
          </div>

          {/*Input Area*/}
          {chat?.listing?.status === "active" ? 
          (
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 rounded-b-lg">
              <div className="flex items-end space-x-2">

                <textarea
                value={newMessage}
                onChange={(e)=> setNewMessage(e.target.value)}
                onKeyDown={(e)=> {
                  if(e.key === "Enter" && !e.shiftKey){
                    e.preventDefault();
                    handleSendMessage(e)
                  }
                }}
                placeholder="Type your message..." className="flex-1 resize-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg px-4 py-2
                focus:outline-indigo-500 max-h-32" rows={1}/>

                <button disabled={!newMessage.trim() || isSending} type="submit" className='bg-indigo-500 hover:bg-indigo-700
                 text-white p-2.5 rounded-lg disabled:opacity-50 transition-colors'>
                  {isSending ? <Loader2Icon className='w-5 h-5 animate-spin'/> 
                  : <Send className='w-5 h-5' />}
                  
                </button>
              </div>
            </form>
          )
          :
          (
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 rounded-b-lg">
              <p className='text-sm text-gray-600 dark:text-gray-400 text-center'>{chat ? `Listing is ${chat?.listing?.status}` : "Loading chat..."}</p>
            </div>
          )
        }
        </motion.div>
    </motion.div>
  )
}

export default ChatBox