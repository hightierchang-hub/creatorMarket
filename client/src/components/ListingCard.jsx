import React from 'react'
import { platformIcons } from '../assets/assets'
import { LineChart,  User, BadgeCheck,  MapPin} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const ListingCard = ({listing}) => {
const currency = import.meta.env.VITE_CURRENCY || '$';
const navigate = useNavigate();
  return (
    <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md dark:hover:shadow-black/30 transition'>
        {/*Featured banner*/}
        {listing.featured && (
            <>
            <p className='py-1' />
            <div className='absolute top-0 left-0 w-full bg-linear-to-r from-pink-500 to-purple-500
             text-white text-center text-xs font-semibold py-1 tracking-wide uppercase'>Featured</div>
            </>
            )}
            <div className='p-5 pt-8'>
            {/*Header*/}
            <div className='flex items-center gap-3 mb-3'>
            {platformIcons[listing.platform]}
                <div className='flex flex-col'>
                    <h2 className='text-gray-900 dark:text-gray-100 font-medium'>{listing.title}</h2>
                    <p className='text-gray-500 dark:text-gray-400 text-sm'>@{listing.username} - <span className='capitalize'>{listing.platform}</span></p>
                </div>
                {listing.verified && <BadgeCheck className='text-green-500 ml-auto w-5 h-5' />} 
            </div>
            {/*Stats*/}
            <div className='flex flex-wrap justify-between max-w-lg items-center gap-3 my-5'>
                <div className='flex items-center text-sm text-gray-600 dark:text-gray-400'>
                    <User className='size-6 mr-1 text-gray-500 dark:text-gray-400' />
                    <span className='text-lg font-medium text-slate-800 dark:text-slate-100 mr-1.5'>
                        {listing.followers_count}</span>followers
                </div>
                {
                    listing.engagement_rate && (
                        <div className='flex items-center text-sm text-gray-600 dark:text-gray-400'>
                            <LineChart className='size-6 mr-1 text-gray-400 dark:text-gray-500'/>
                            <span className='text-lg font-medium text-slate-800 dark:text-slate-100 mr-1.5'>{listing.engagement_rate}</span>%engagement
                        </div>
                    )
                }
            </div>
             {/*Tags and Location*/}
            <div className='flex items-center gap-3 mb-3'>
              <span className='text-xs font-medium bg-pink-100 dark:bg-pink-500/15 text-pink-600 dark:text-pink-300 px-3 py-1 rounded-full capitalize'>{listing.niche}</span>
              {listing.country && (
                <div  className='flex items-center text-sm text-gray-600 dark:text-gray-400 mt-2'>
                  <MapPin className='size-6 mr-1 text-gray-400 dark:text-gray-500' />
                  {listing.country}
                </div>
              )}
            </div>
            {/*Description*/}
          <p className='text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2'>{listing.description}</p>

          <hr className='my-5 border-gray-200 dark:border-gray-800' />
          
          {/*Footer*/}
                <div className='flex items-center justify-between '>
                  <div className='flex items-baseline'>
                    <span className='text-2xl font-medium text-slate-800 dark:text-slate-100'>
                       {currency}
                       {listing.price.toLocaleString()}
                    </span>
                  </div>
                  <motion.div whileHover={{scale: 1.07}}
            whileTap={{scale: 0.97 }}>
                  <button onClick={() => {navigate(`/listing/${listing.id}`); scrollTo(0, 0)}} 
                  className='px-7 py-3 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition'>
                    More Details
                  </button>
                  </motion.div>
                </div>
            </div>
    </div>
  )
}

export default ListingCard