import { useState, useEffect } from 'react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { useNavigate, useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { MenuIcon, MessageCircleMoreIcon, XIcon, GripIcon, ListIcon, BoxIcon, ShieldCheckIcon, SunIcon, MoonIcon } from 'lucide-react'
import { useUser, useClerk, useAuth, UserButton } from '@clerk/clerk-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import api from '../configs/axios'

const navLinkClass = 'relative py-1'

const Navbar = () => {

  const { isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  const { getToken } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()

  const [menuOpen, setMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [scrolled, setScrolled] = useState(false)
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const navLinks = [
    { label: 'Home', to: '/', requiresAuth: false },
    { label: 'Marketplace', to: '/marketplace', requiresAuth: false },
    { label: 'Messages', to: '/messages', requiresAuth: true },
    { label: 'My Listings', to: '/my-listings', requiresAuth: true },
  ]

  const isLinkActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
   <nav className='h-[88px]'>
                <motion.div
                  initial={{ y: -40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className={`fixed left-0 right-0 top-0 z-100 flex items-center px-6 md:px-16 lg:px-24 xl:px-32 py-3 border-b transition-all duration-300 ${
                    scrolled
                      ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-gray-200 dark:border-gray-800 shadow-sm'
                      : 'bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-900'
                  }`}
                >

                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className='flex-none pr-2 sm:pr-3'>
                    <Logo onClick={() => { navigate('/'); scrollTo(0, 0) }} className="h-14 sm:h-16 w-auto cursor-pointer" />
                  </motion.div>

                    {/* Desktop Menu */}
                    <div className='hidden sm:flex absolute inset-x-0 justify-center'>
                      <div className='flex items-center justify-center gap-4 md:gap-8 max-md:text-sm text-gray-700 dark:text-gray-300'>
                        {navLinks.map((link) => {
                          const active = isLinkActive(link.to)
                          const handleClick = () => {
                            if (link.requiresAuth && !isSignedIn) { openSignIn(); return }
                            scrollTo(0, 0)
                          }
                          return (
                            <Link
                              key={link.label}
                              to={link.requiresAuth && !isSignedIn ? '#' : link.to}
                              onClick={handleClick}
                              className={`${navLinkClass} transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${active ? 'text-indigo-600 dark:text-indigo-400 font-medium' : ''}`}
                            >
                              {link.label}
                              {active && (
                                <motion.span
                                  layoutId="navbar-underline"
                                  className="absolute left-0 right-0 -bottom-1.5 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                />
                              )}
                            </Link>
                          )
                        })}
                        {isSignedIn && isAdmin && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                            <Link
                              to="/admin"
                              onClick={() => scrollTo(0, 0)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition font-medium"
                            >
                              <ShieldCheckIcon className="size-4" />
                              Admin
                            </Link>
                          </motion.div>
                        )}
                      </div>
                    </div>

                  {!isSignedIn ? (
                    <div className='ml-auto flex items-center gap-3'>
                        <ThemeToggle className="max-sm:hidden" />
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          type='button'
                          onClick={openSignIn}
                          className='max-sm:hidden inline-flex items-center justify-center min-h-11 min-w-[92px] px-6 py-2.5 bg-blue-500 text-white rounded-full font-medium shadow-sm transition-all duration-200 hover:bg-blue-600 active:scale-[0.98]'
                        >
                          Login
                        </motion.button>
                       <MenuIcon onClick={() => setMenuOpen(true)} className='sm:hidden h-8 w-8 text-gray-700 dark:text-gray-200' />
    
                    </div>      
                  ) : (
                    <div className='ml-auto flex items-center gap-3'>
                      <ThemeToggle className="max-sm:hidden" />
                      <UserButton>
                        <UserButton.MenuItems> 
                          <UserButton.Action label='Marketplace' labelIcon={<GripIcon size={16} />} onClick={() => navigate('/marketplace')} />
                          <UserButton.Action label='Messages' labelIcon={<MessageCircleMoreIcon size={16} />} onClick={() => navigate('/messages')} />
                          <UserButton.Action label='My Listing' labelIcon={<ListIcon size={16} />} onClick={() => navigate('/my-listings')} />
                          <UserButton.Action label='My Orders' labelIcon={<BoxIcon size={16} />} onClick={() => navigate('/my-orders')} />
                          <UserButton.Action
                            label={isDark ? 'Light mode' : 'Dark mode'}
                            labelIcon={isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
                            onClick={toggleTheme}
                          />
                          {isAdmin && (
                            <UserButton.Action label='Admin' labelIcon={<ShieldCheckIcon size={16} />} onClick={() => navigate('/admin')} />
                          )}
                        </UserButton.MenuItems>
                      </UserButton>
                      <MenuIcon onClick={() => setMenuOpen(true)} className='sm:hidden h-8 w-8 text-gray-700 dark:text-gray-200' />
                    </div>
                  )}
                    
                    
                     </motion.div>


                    {/* Mobile Menu */}
                 <AnimatePresence>
                 {menuOpen && (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 0.2 }}
                   className='sm:hidden fixed inset-0 bg-white dark:bg-gray-950 z-200 text-sm'
                 >
                 <motion.div
                   initial={{ x: '100%' }}
                   animate={{ x: 0 }}
                   exit={{ x: '100%' }}
                   transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                   className='flex flex-col items-center justify-center h-full text-xl font-semibold gap-6 p-4 text-gray-800 dark:text-gray-100'
                 >

                         <Link to='/marketplace' onClick={() => setMenuOpen(false)}> Marketplace </Link>
                          <button onClick={() => isSignedIn ? navigate('/messages') : openSignIn()}>Messages</button>
                          <button onClick={() => isSignedIn ? navigate('/my-listings') : openSignIn()}>My Listings</button>
                          {isSignedIn && isAdmin && (
                            <Link
                              to='/admin'
                              onClick={() => setMenuOpen(false)}
                              className='flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/30 text-base'
                            >
                              <ShieldCheckIcon className='size-4' />
                              Admin
                            </Link>
                          )}

                          <div className='flex items-center gap-2 text-base font-normal'>
                            <span className='text-gray-500 dark:text-gray-400'>Theme</span>
                            <ThemeToggle />
                          </div>

                          {!isSignedIn && (
                            <button
                              type='button'
                              onClick={openSignIn}
                              className='inline-flex items-center justify-center min-h-11 min-w-[92px] px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full font-medium shadow-sm'
                            >
                              Login
                            </button>
                          )}
                         <XIcon onClick={() => setMenuOpen(false)} className='absolute size-8 right-6 top-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer' />
                        </motion.div>
                    </motion.div>
                 )}
                 </AnimatePresence>

            </nav>
  )
}


export default Navbar
