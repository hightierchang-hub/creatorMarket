import { ArrowLeftIcon, FilterIcon } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useState } from "react"
import { useSelector } from "react-redux"
import ListingCard from "../components/ListingCard"
import FilterSidebar from "../components/FilterSidebar"

const Marketplace = () => {

const [serachParams] = useSearchParams()
const search = serachParams.get("search")

  const navigate = useNavigate()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
   platform: null,
   maxPrice: 100000,
   minFollowers: 0,
   niche: null,
   verified: false,
   monetized: false,

  })

  const listing = useSelector((state) => state.listing?.listing ?? [])
  const filteredlisting = listing.filter((listing) => {

 if(filters.platform && filters.platform.length > 0){
      if(!filters.platform.includes(listing.platform))return false
     }
if(filters.maxPrice){
      if(listing.price > filters.maxPrice)return false
     }
if(filters.minFollowers){
      if(listing.followers_count < filters.minFollowers)return false
     }
     if(filters.niche && filters.niche.length){
      if(!filters.niche.includes(listing.niche))return false
     }
     if(filters.verified && listing.verified !== filters.verified) return false
     
      if(filters.monetized && listing.monetized !== filters.monetized) return false

      if(search){
        const trimed = search.trim();
        if(
          !listing.title.toLowerCase().includes(trimed.toLowerCase()) &&
          !listing.username.toLowerCase().includes(trimed.toLowerCase()) &&
          !listing.description.toLowerCase().includes(trimed.toLowerCase()) &&
          !listing.platform.toLowerCase().includes(trimed.toLowerCase()) &&
          !listing.niche.toLowerCase().includes(trimed.toLowerCase())
        ) return false
      }
    
     return true })
     return(
    
    <div className='px-6 md:px-16 lg:px-24 xl:px-32'>

       <div className='flex items-center justify-between text-slate-500'>
      <button onClick={()=>{navigate('/'); scrollTo(0,0)}} className='flex items-center gap-2 font-semibold hover:text-gray-700 py-5 transition-colors'>
        <ArrowLeftIcon className='size-4' />Back To Home
        </button>
      <button onClick={() => setShowFilters((prev) => !prev)} className='flex sm:hidden items-center gap-2 py-5 hover:text-gray-700 transition-colors'>
        <FilterIcon className='size-4' />
        Filter
        </button>
       </div>
       <div className='relative flex items-start justify-between gap-8 pb-8'>
       
        <FilterSidebar showFilters={showFilters} setShowFilters={setShowFilters} filters={filters} setFilters={setFilters}/>

        <div className={`sm:hidden ${showFilters ? 'block' : 'hidden'}`}>Filter</div>
        <div className='flex-1 grid xl:grid-cols-2 gap-4'>
          {filteredlisting.sort((a,b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).map((singleListing,index)=>(
            <ListingCard  listing={singleListing} key={index}/>
          ))}
        </div>
       </div>
    </div>
  )
}


export default Marketplace