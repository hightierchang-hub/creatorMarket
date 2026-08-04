import {useState, useEffect, useMemo} from 'react'
import { MessageCircle, Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'
import { format, isToday, isYesterday } from 'date-fns'
import { useDispatch } from 'react-redux'
import { setChat } from '../app/features/chatSlice'
import { useAuth, useUser } from '@clerk/clerk-react'
import api from '../configs/axios'
import { toast } from 'react-hot-toast'

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
}

const Messages = () => {

  const dispatch = useDispatch()

  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()

  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const formatTime = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return '';

    if (isToday(date)) {
      return `Today • ${format(date, 'h:mm a')}`;
    }

    if (isYesterday(date)) {
      return `Yesterday • ${format(date, 'h:mm a')}`;
    }

    return format(date, 'MMM d');
  }

  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      const aTime = new Date(a.updatedAt || 0).getTime();
      const bTime = new Date(b.updatedAt || 0).getTime();
      return bTime - aTime;
    });
  }, [chats]);

  const filteredChats = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return sortedChats.filter((chat)=>{
      const chatUser = chat.chatUserId === user?.id ? chat?.ownerUser : chat?.chatUser;

      return chat.listing?.title?.toLowerCase().includes(query) || chatUser?.name?.toLowerCase().includes(query);
    })
  },[sortedChats, searchQuery, user?.id])

  const unreadCount = useMemo(
    () => chats.filter((chat) => !chat.isLastMessageRead && chat.lastMessageSenderId !== user?.id).length,
    [chats, user?.id]
  )

  const handleOpenChat = (chat) => {
    dispatch(setChat({listing: chat.listing, chatId: chat.id}))
  }



    const fetchUserChats = async () => {
      try{
        const token = await getToken();
        const { data } = await api.get('/api/chat/user', { headers: { Authorization: `Bearer ${token}` } });
        setChats(data?.chats || []);
        setLoading(false);
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message);
        console.log(error);
        setLoading(false);
      }
    };

    useEffect(() => {

      if(user && isLoaded){
        fetchUserChats();

    const interval = window.setInterval(() => {
      fetchUserChats();
    }, 10 * 1000);

    return () => {
      window.clearInterval(interval);
      }
    };
  }, [user, isLoaded]);

  return (
    <div className='mx-auto min-h-screen px-6 md:px-16 lg:px-24 xl:px-32'>
        <div className='py-10'>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className='mb-8 flex items-center justify-between flex-wrap gap-3'
          >
            <div>
              <h1 className='text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2'>Messages</h1>
              <p className='text-gray-600 dark:text-gray-400'>Chat with buyers and sellers</p>
            </div>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-sm font-medium border border-indigo-100 dark:border-indigo-500/30'
              >
                <span className='w-2 h-2 rounded-full bg-indigo-500 animate-pulse' />
                {unreadCount} unread
              </motion.span>
            )}
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className='relative max-w-xl mb-8'
          >
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5'/>
            <input type="text" placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
            className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg focus:outline-indigo-500 transition-colors' />
          </motion.div>

          {/* Chat List */}
          {loading ? (
            <div className='bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800 overflow-hidden'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='w-full p-4 flex items-start gap-4'>
                  <div className='skeleton w-12 h-12 rounded-lg shrink-0' />
                  <div className='flex-1 space-y-2'>
                    <div className='skeleton h-4 w-1/3 rounded' />
                    <div className='skeleton h-3 w-1/4 rounded' />
                    <div className='skeleton h-3 w-1/2 rounded' />
                  </div>
                </div>
              ))}
            </div>
          ): filteredChats.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className='bg-white dark:bg-gray-900 rounded-lg shadow-xs border border-gray-200 dark:border-gray-800 p-16 text-center'
            >
              <div className='w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4'>
                <MessageCircle className='w-8 h-8 text-gray-400 dark:text-gray-500'/>
              </div>
              <h3 className='text-xl font-medium text-gray-800 dark:text-gray-100 mb-2'>{searchQuery ? "No chats found" : "No messages yet"}</h3>
              <p className='text-gray-600 dark:text-gray-400'>
                {searchQuery ? "Try a different search term" : 'Start a conversation by viewing a listing and clicking "Chat with seller"'}
              </p>
            </motion.div>
          ): (
            <motion.div
              variants={listVariants}
              initial='hidden'
              animate='visible'
              className='bg-white dark:bg-gray-900 rounded-lg shadow-xs border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800 overflow-hidden'
            >
              <AnimatePresence initial={false}>
              {filteredChats.map((chat) => {
                const chatUser = chat.chatUserId === user?.id ? chat.ownerUser : chat.chatUser
                const isUnread = !chat.isLastMessageRead && chat.lastMessageSenderId !== user?.id
                return (
                  <motion.button
                    variants={itemVariants}
                    layout
                    whileHover={{ backgroundColor: 'transparent' }}
                    onClick={()=> handleOpenChat(chat)}
                    key={chat.id}
                    className='group w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors text-left'
                  >
                    <div className='flex items-start gap-4'>
                      <div className='relative shrink-0'>
                        {chatUser?.image ? (
                          <img src={chatUser.image} alt={chatUser?.name} className='w-12 h-12 rounded-lg object-cover'/>
                        ) : (
                          <div className='w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-semibold'>
                            {chatUser?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        {isUnread && (
                          <span className='absolute -top-1 -right-1 w-3 h-3 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-gray-900' />
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between gap-3'>
                          <div className='min-w-0'>
                            <h3 className='font-semibold text-gray-800 dark:text-gray-100 truncate'>{chat.listing?.title}</h3>
                            <p className='text-sm text-gray-600 dark:text-gray-400 truncate mb-1'>{chatUser?.name}</p>
                            <p className={`text-sm truncate ${isUnread ? 
                              'text-indigo-600 dark:text-indigo-400 font-medium' : "text-gray-500 dark:text-gray-400"}`}>{chat.lastMessage || 'No messages yet'}</p>
                          </div>
                          <div className='flex items-center gap-2 shrink-0'>
                            <span className='text-xs text-gray-500 dark:text-gray-400'>{formatTime(chat.updatedAt)}</span>
                            <ChevronRight className='w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all' />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
    </div>
  )
}

export default Messages
