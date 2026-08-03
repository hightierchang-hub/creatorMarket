import { useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import { getProfileLink, platformIcons } from "../assets/assets"
import { useDispatch, useSelector } from "react-redux"
import { ArrowLeftIcon, ArrowUpRightFromSquareIcon, Calendar, CheckCircle2, ChevronLeftIcon, ChevronRightIcon, DollarSign, Eye,
LineChart, Loader2Icon, MapPin, MessageSquareMoreIcon, ShoppingBagIcon, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from "motion/react"
import { setChat } from "../app/features/chatSlice"
import { useUser } from "@clerk/clerk-react"
import { toast } from "react-hot-toast"
import PaymentModal from "../components/PaymentModal"

const ListingDetails = () => {

  const {user, isLoaded} = useUser()

  const dispatch = useDispatch()

  const navigate = useNavigate()
  const currency = import.meta.env.VITE_CURRENCY || '$';
  const {listingId} = useParams()
  const {listing: listings = []} = useSelector((state)=>state.listing)
  const listing = listings.find((listing)=>listing.id === listingId)
  const profileLink = listing && getProfileLink(listing.platform, listing.username)

  const [current,setCurrent] = useState(0)
  const images = listing?.images || []

  const prevSlide = ()=> setCurrent((prev)=> (prev ===0 ? images.length - 1 : prev - 1))

   const nextSlide = ()=> setCurrent((prev)=> (prev === images.length - 1 ? 0 : prev + 1))

   const [showPaymentModal, setShowPaymentModal] = useState(false)
   const purchaseAccount = () => {
    if (!isLoaded) return toast("Please wait while we load your account");
    if (!user) return toast("Please login to purchase this listing");
    if (user.id === listing?.ownerId) return toast("You can't purchase your own listing");
    setShowPaymentModal(true)
   }
   const loadChatbox = () =>{
    if (!isLoaded) return toast("Please wait while we load your account");
    if (!user) return toast("Please login to chat with seller");
    if (user.id === listing?.ownerId) return toast("You can't chat with your own listing");
    dispatch(setChat({ listing }));
   }

  return (
    <div className='mx-auto min-h-screen px-6 md:px-16 lg:px-24 xl:px-32'>
      <button onClick={()=> navigate(-1)} className='flex items-center gap-2 font-semibold text-slate-600 hover:text-gray-900 py-5'> 
        <ArrowLeftIcon className='size-4 hover:text-gray-700  transition-colors' />Go to Previous Page
      </button>
    {listing ? (
      <>
        <div className='flex items-start max-md:flex-col gap-10'>
          <div className='flex-1 max-md:w-full'>
              {/*Top Section*/}
              <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-5'>

                <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-4'>



                <div className='flex items-start gap-3'>
                  <div className='p-2 rounded-xl'>{platformIcons[listing.platform]}</div>
                   <div>
                    <h2 className='flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-100'>{listing.title}
                      <Link target='_blank' to={profileLink}>
                      <ArrowUpRightFromSquareIcon className='size-4 hover:text-indigo-500'/>
                      </Link></h2>
                      <p className='txt-gray-500 text-sm'>
                        @{listing.username} • {listing.platform?.charAt(0).toUpperCase() + listing.platform?.slice(1)}
                      </p>
                      <div className='flex gap-2 mt-2'>
                        {listing.monetized && (
                          <span className="flex items-center text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 px-2 py-1 rounded-md">
                            <CheckCircle2 className="w-3 h-3 mr-1"/>
                            Verified
                          </span>
                        )}

                        {listing.verified && (
                          <span className="flex items-center text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md">
                            <DollarSign className="w-3 h-3 mr-1"/>
                            Monetized
                          </span>
                        )}
                      </div>
                   </div>
                </div>

                <div className='text-right'>
                      <h3 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>
                      {currency}
                      {listing.price?.toLocaleString()}
                     </h3>
                     <p className='text-sm text-gray-500 dark:text-gray-400'>USD</p>
                </div>

              </div>
          </div>
                
          {/*Screenshot Section*/}
            {images?.length > 0 && (
             <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-5 overflow-hidden'>
             <div className='p-4'>
              <h4 className='font-semibold text-gray-800 dark:text-gray-100'>Screenshots & Proof</h4>
              </div>
              {/*Slider container*/}
              <div className='relative w-full aspect-video overflow-hidden'>
                <div className='flex transition-transform duration-300 ease-in-out' style={{transform:`translateX(-${current * 100}%)`}}>
                    {images.map((img, index)=>(
                      <img key={index} src={img} alt="Listing Proof" className='w-full shrink-0'/>
                    ))}
                </div>

                {/*Navigations Butttons*/}
                <button onClick={prevSlide}className='absolute left-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-900/70 hover:bg-white p-2 rounded-full shadow'>
                  <ChevronLeftIcon className='w-5 h-5 text-gray-700 dark:text-gray-300'/>
                </button>

                <button onClick={nextSlide} className='absolute right-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-900/70 hover:bg-white p-2 rounded-full shadow'>
                  <ChevronRightIcon className='w-5 h-5 text-gray-700 dark:text-gray-300'/>
                </button>

                {/*Dots Indicator*/}
                <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2'>
                  {images.map((_, index)=>(
                    <button onClick={()=> setCurrent(index)} key={index}
                    className={`w-2.5 h-2.5 rounded-full ${current === index ? "bg-indigo-600" : "bg-gray-300"}`} />
                  ))}
                </div>
              </div>
             </div>
            )} 

            {/* Account Metrics */}  
            <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-5'>
              <div className='p-4 border-b border-gray-100'>
                <h4 className='font-semibold text-gray-800 dark:text-gray-100'>Account Metrics</h4>
              </div>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 p-4 text-center'>
                <div>
                  <Users className='mx-auto text-gray-400 dark:text-gray-500 w-5 h-5 mb-1'/>
                  <p className='font-semibold text-gray-800 dark:text-gray-100'>
                    {listing.followers_count?.toLocaleString()}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>Followers</p>
                </div>   
                <div>
                  <LineChart className='mx-auto text-gray-400 dark:text-gray-500 w-5 h-5 mb-1'/>
                  <p className='font-semibold text-gray-800 dark:text-gray-100'>
                    {listing.engagement_rate}%
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>Engagement</p>
                </div>
                 <div>
                  <Eye className='mx-auto text-gray-400 dark:text-gray-500 w-5 h-5 mb-1'/>
                  <p className='font-semibold text-gray-800 dark:text-gray-100'>
                    {listing.monthly_views?.toLocaleString()}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>Monthly Views</p>
                </div>
                 <div>
                  <Calendar className='mx-auto text-gray-400 dark:text-gray-500 w-5 h-5 mb-1'/>
                  <p className='font-semibold text-gray-800 dark:text-gray-100'>
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>Listed</p>
                </div>
              </div>
              </div>   

              {/* Description */}  
              <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-5'>
                <div className='p-4 border-b border-gray-100'>
                  <h4 className='font-semibold text-gray-800 dark:text-gray-100'>Description
                  </h4>
                  </div>
                   <div className='p-4 text-sm text-gray-600 dark:text-gray-400'>{listing.description}</div>
              </div>
                      
                  {/*Additional Details*/}
                    <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-5'>
                <div className='p-4 border-b border-gray-100'>
                  <h4 className='font-semibold text-gray-800 dark:text-gray-100'>Additional Details
                  </h4>
                  </div>
                   <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-4 text-sm'>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Niche</p>
                      <p className="font-medium capitalize">{listing.niche}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Primary Country</p>
                      <p className="flex items-center font-medium"><MapPin className="size-4 mr-1 text-gray-400 dark:text-gray-500"/>{listing.country}</p>
                    </div>
                     <div>
                      <p className="text-gray-500 dark:text-gray-400">Audience Age</p>
                      <p className="font-medium">{listing.age_range}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Platform Verified</p>
                      <p className="font-medium">{listing.platformAssured ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Monetization</p>
                      <p className="font-medium">{listing.monetized ? "Enabled" : "Disabled"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Status</p>
                      <p className="font-medium capitalize">{listing.status}</p>
                    </div>
                    
                   </div>
              </div>

        </div>                
          {/*Seller Info & Purchase Options*/}
          <div className="bg-white dark:bg-gray-900 min-w-full md:min-w-92.5 rounded-xl border border-gray-200 dark:border-gray-800 p-5 max-md:mb-10">
            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Seller Information</h4>
            <div className="flex items-center gap-3 mb-2">
              <img src={listing.owner?.image} alt="seller image" className="size-10 rounded-full"/>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{listing.owner?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{listing.owner?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
              <p>Member Since <span className="font-medium">{new Date(listing.owner?.createdAt).toLocaleString()}</span></p>
            </div>
            <motion.div whileHover={{scale: 1.07}}
            whileTap={{scale: 0.97 }}>
            <button onClick={loadChatbox} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:ng-indigo-700 transition text-sm font-medium flex
             items-center justify-center gap-2">
              <MessageSquareMoreIcon className="size-4"/>Chat
            </button>
            </motion.div>
                <motion.div whileHover={{scale: 1.07}}
            whileTap={{scale: 0.97 }}>
              {listing.isCredentialVerified ? (
                <button onClick={purchaseAccount} className="w-full mt-2 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 text-sm
               font-medium flex items-center justify-center gap-2">
              <ShoppingBagIcon className="size-4"/>Purchase
              </button>
              ) : (
                <button disabled className="w-full mt-2 bg-gray-400 text-white py-2 rounded-lg text-sm
               font-medium flex items-center justify-center gap-2 cursor-not-allowed">
              <ShoppingBagIcon className="size-4"/>Waiting for Verification
              </button>
              )}
                </motion.div>
          </div>
            </div>

            {showPaymentModal && (
              <PaymentModal listing={listing} onClose={() => setShowPaymentModal(false)} />
            )}

            {/* Footer */}
          <div className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 text-center mt-10">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  © 2026 <span className="text-indigo-600">Hiten</span>. All rights Reserved.
                </p>
          </div>
        </>
        
      ) : (
        <div className='h-screen flex justify-center items-center'>
          <Loader2Icon className='size-7 animate-spin text-indigo-600' />
        </div>
      )}
    </div>
  )
}
export default ListingDetails