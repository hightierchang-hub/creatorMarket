
import { useState, useEffect } from 'react'
import logo from '../assets/logo.svg'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { MenuIcon, MessageCircleMoreIcon, XIcon, GripIcon, ListIcon, BoxIcon, ShieldCheckIcon } from 'lucide-react'
import { useUser, useClerk, useAuth, UserButton } from '@clerk/clerk-react'
import api from '../configs/axios'

const Navbar = () => {

  const { isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  const { getToken } = useAuth()

  const [menuOpen, setMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
    const navigate = useNavigate()

  // Admin-only visibility: the server is the source of truth (ADMIN_EMAILS
  // env var, checked in protectAdmin/isAdmin) - this just decides whether to
  // show the link at all. A non-admin hitting /admin directly is still
  // blocked server-side and by the admin Layout guard.
  useEffect(() => {
    let cancelled = false

    const checkAdmin = async () => {
      try {
        const token = await getToken()
        const { data } = await api.get('/api/admin/admin', { headers: { Authorization: `Bearer ${token}` } })
        if (!cancelled) setIsAdmin(!!data.isAdmin)
      } catch {
        if (!cancelled) setIsAdmin(false)
      }
    }

    if (isSignedIn) {
      checkAdmin()
    } else {
      setIsAdmin(false)
    }

    return () => { cancelled = true }
  }, [isSignedIn, getToken])

  return (
   <nav className='h-[88px]'>
                <div className='fixed left-0 right-0 top-0 z-100 relative flex items-center px-6 md:px-16 lg:px-24 xl:px-32 py-3 border-b border-gray-300 bg-white transition-all'>
                  
                  <div className='flex-none pr-2 sm:pr-3'>
                    <img onClick={() => {navigate('/'); scrollTo(0, 0)}} src={logo} alt="logo" className="h-16 sm:h-[72px] w-auto cursor-pointer object-contain" />
                  </div>

                    {/* Desktop Menu */}
                    <div className='hidden sm:flex absolute inset-x-0 justify-center'>
                      <div className='flex items-center justify-center gap-4 md:gap-8 max-md:text-sm text-gray-800'>
                        <Link to="/" onClick={() => scrollTo(0, 0)}> Home </Link>
                        <Link to="/marketplace" onClick={() => scrollTo(0, 0)}> Marketplace </Link>
                        <Link to={isSignedIn ? '/messages' : '#'} onClick={() => isSignedIn ? scrollTo(0, 0) : openSignIn()}> Messages </Link>
                        <Link to={isSignedIn ? '/my-listings' : '#'} onClick={() => isSignedIn ? scrollTo(0, 0) : openSignIn()}> My Listings </Link>
                        {isSignedIn && isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => scrollTo(0, 0)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition font-medium"
                          >
                            <ShieldCheckIcon className="size-4" />
                            Admin
                          </Link>
                        )}
                      </div>
                    </div>

                  {!isSignedIn ? (
                    <div className='ml-auto flex items-center gap-3'>
                        <button onClick={openSignIn} className='max-sm:hidden cursor-pointer px-8 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'>Login </button>
                       <MenuIcon onClick={() => setMenuOpen(true)} className='sm:hidden h-8 w-8' />
    
                    </div>      
                  ) : (
                    <div className='ml-auto flex items-center'>
                      <UserButton>
                        <UserButton.MenuItems> 
                          <UserButton.Action label='Marketplace' labelIcon={<GripIcon size={16} />} onClick={() => navigate('/marketplace')} />
                          <UserButton.Action label='Messages' labelIcon={<MessageCircleMoreIcon size={16} />} onClick={() => navigate('/messages')} />
                          <UserButton.Action label='My Listing' labelIcon={<ListIcon size={16} />} onClick={() => navigate('/my-listings')} />
                          <UserButton.Action label='My Orders' labelIcon={<BoxIcon size={16} />} onClick={() => navigate('/my-orders')} />
                          {isAdmin && (
                            <UserButton.Action label='Admin' labelIcon={<ShieldCheckIcon size={16} />} onClick={() => navigate('/admin')} />
                          )}
                        </UserButton.MenuItems>
                      </UserButton>
                    </div>
                  )}
                    
                    
                     </div>


                    {/* Mobile Menu */}
                 <div  className={`sm:hidden fixed inset-0 ${menuOpen ? 'w-full' : 'w-0'} overflow-hidden bg-white backdrop-blur shadow-xl rounded-lg z-200 text-sm transition-all`}>
                 <div className='flex flex-col items-center justify-center h-full text-xl font-semibold gap-6 p-4'>

                         <Link to='/marketplace' onClick={() => setMenuOpen(false)}> Marketplace </Link>
                          <button onClick={openSignIn}>Messages</button>
                          <button onClick={openSignIn}>My Listings</button>
                          {isSignedIn && isAdmin && (
                            <Link
                              to='/admin'
                              onClick={() => setMenuOpen(false)}
                              className='flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-base'
                            >
                              <ShieldCheckIcon className='size-4' />
                              Admin
                            </Link>
                          )}
                                
                            <button onClick={openSignIn} className='cursor-pointer px-8 py-2 bg-indigo-500  hover:bg-indigo-600 transition text-white rounded-full'>Login </button>
                         <XIcon onClick={() => setMenuOpen(false)} className='absolute size-8 right-6 top-6 text-gray-500 hover:text-gray-700 cursor-pointer' />
                        </div>
                    </div>

            </nav>
  )
}


export default Navbar

