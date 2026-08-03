import React from 'react'
import Title from './Title'
import {useSelector} from 'react-redux'
import ListingCard from './ListingCard'
import { motion } from 'framer-motion'

const LatestListings = () => {
    const listing = useSelector((state) => state.listing.listing)
  return (
    <div className='mt-20 mb-8'>
            <Title title='Latest Listings' description='Discover the hottest Social Profile available right now.' />

            <div className='flex flex-col gap-6 px-6'>
                {[...listing].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).slice(0,4).map((singleListing, index) =>(
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      className='mx-auto w-full max-w-3xl rounded-xl'
                    >
                       <ListingCard listing={singleListing} />
                    </motion.div>
                ))}
            </div>       
    </div>
  )
}

export default LatestListings