import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Marketplace from './pages/Marketplace'
import MyListing from './pages/MyListing'
import ListingDetails from './pages/ListingDetails'
import ManageListing from './pages/ManageListing'
import Messages from './pages/Messages'
import MyOrders from './pages/MyOrders'
import Loading from './pages/Loading'
import PaymentResult from './pages/PaymentResult'
import { useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ChatBox from './components/ChatBox'
import PageTransition from './components/PageTransition'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import Layout from './pages/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import AllListings from './pages/admin/AllListings'
import CredentialChange from './pages/admin/CredentialChange'
import CredentialVerify from './pages/admin/CredentialVerify'
import Transactions from './pages/admin/Transactions'
import Withdrawal from './pages/admin/Withdrawal'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { useTheme } from './context/ThemeContext'
import { getAllPublicListing, getAllUserListing } from './app/features/listingSlice'

const withTransition = (element) => <PageTransition>{element}</PageTransition>

const App = () => {
  const location = useLocation();
  const { pathname } = location;
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser()
  const { isDark } = useTheme()

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getAllPublicListing())
  }, [])

  useEffect(() => {
    if (isLoaded && user) {
      dispatch(getAllUserListing({ getToken }))
    }
  }, [dispatch, isLoaded, user?.id])

  return (
    <div className='bg-white dark:bg-gray-950 min-h-screen transition-colors duration-300'>
      <Toaster
        toastOptions={{
          style: isDark
            ? { background: '#1f2937', color: '#f3f4f6', border: '1px solid #374151' }
            : undefined,
        }}
      />
      {!pathname.includes('/admin') && <Navbar />}
      <AnimatePresence mode='wait'>
        <Routes location={location} key={pathname.startsWith('/admin') ? '/admin' : pathname}>
          <Route path='/' element={withTransition(<Home />)} />
          <Route path='/marketplace' element={withTransition(<Marketplace />)} />
          <Route path='/my-listings' element={withTransition(<MyListing />)} />
          <Route path='/listing/:listingId' element={withTransition(<ListingDetails />)} />
          <Route path='/create-listing' element={withTransition(<ManageListing />)} />
          <Route path='/edit-listing/:listingId' element={withTransition(<ManageListing />)} />
          <Route path='/messages' element={withTransition(<Messages />)} />
          <Route path='/my-orders' element={withTransition(<MyOrders />)} />
          <Route path='/loading' element={withTransition(<Loading />)} />
          <Route path='/payment/success' element={withTransition(<PaymentResult />)} />
          <Route path='/payment/cancel' element={withTransition(<PaymentResult />)} />
          <Route path='/admin' element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path='verify-credentials' element={<CredentialVerify />} />
            <Route path='change-credentials' element={<CredentialChange />} />
            <Route path='list-listings' element={<AllListings />} />
            <Route path='transactions' element={<Transactions />} />
            <Route path='withdrawal' element={<Withdrawal />} />
          </Route>
        </Routes>
      </AnimatePresence>
      <ChatBox />
    </div>
  )
}

export default App
