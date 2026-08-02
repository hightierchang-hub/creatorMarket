import React from 'react'
import Title from './Title'
import {useSelector} from 'react-redux'
import ListingCard from './ListingCard'

const LatestListings = () => {
    const listing = useSelector((state) => state.listing.listing)
  return (
    <div className='mt-20 mb-8'>
            <Title title='Latest Listings' description='Discover the hottest Social Profile available right now.' />

            <div className='flex flex-col gap-6 px-6'>
                {[...listing].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).slice(0,4).map((singleListing, index) =>(
                    <div key={index} className='mx-auto w-full max-w-3xl rounded-xl'>
                       <ListingCard listing={singleListing} />
                    </div>
                ))}
            </div>       
    </div>
  )
}

export default LatestListings