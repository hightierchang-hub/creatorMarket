import { useEffect, useState } from 'react'
import { useSearchParams, Link, useLocation } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2Icon } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import api from '../configs/axios'
import toast from 'react-hot-toast'

const POLL_ATTEMPTS = 8
const POLL_INTERVAL_MS = 1500

// This page never decides payment success on its own. It polls GET
// /api/payment/status/:transactionId, which only ever reflects what a
// verified webhook or signed callback already wrote to the DB.
const PaymentResult = () => {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const transactionId = searchParams.get('transactionId')
  const isCancelPath = location.pathname.includes('cancel')
  const { getToken } = useAuth()

  const [status, setStatus] = useState(isCancelPath ? 'failed' : 'checking')

  useEffect(() => {
    if (isCancelPath) return
    if (!transactionId) {
      setStatus('failed')
      return
    }

    let cancelled = false

    const confirm = async () => {
      try {
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }

        for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
          if (cancelled) return
          const { data } = await api.get(`/api/payment/status/${transactionId}`, { headers })
          if (data.isPaid) {
            if (!cancelled) setStatus('success')
            return
          }
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
        }
        if (!cancelled) setStatus('pending')
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Could not confirm payment')
        if (!cancelled) setStatus('failed')
      }
    }

    confirm()
    return () => {
      cancelled = true
    }
  }, [getToken, isCancelPath, transactionId])

  return (
    <div className='min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center'>
      {status === 'checking' ? (
        <>
          <Loader2Icon className='size-10 animate-spin text-indigo-600' />
          <p className='text-gray-600'>Confirming your payment...</p>
        </>
      ) : status === 'success' ? (
        <>
          <CheckCircle2 className='size-14 text-green-500' />
          <h2 className='text-xl font-semibold text-gray-800'>Payment successful</h2>
          <p className='text-gray-500 max-w-sm'>
            Your purchase is confirmed. The seller has been notified and account credentials will be shared via chat.
          </p>
        </>
      ) : status === 'pending' ? (
        <>
          <Loader2Icon className='size-14 text-amber-500' />
          <h2 className='text-xl font-semibold text-gray-800'>Still confirming</h2>
          <p className='text-gray-500 max-w-sm'>
            Your payment is being verified with the provider. This can take a minute - check My Orders shortly.
          </p>
        </>
      ) : (
        <>
          <XCircle className='size-14 text-red-500' />
          <h2 className='text-xl font-semibold text-gray-800'>Payment not completed</h2>
          <p className='text-gray-500 max-w-sm'>
            Your payment was cancelled or could not be confirmed. No charge should have gone through - try again or
            use a different method.
          </p>
        </>
      )}
      <Link to='/my-orders' className='mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium'>
        Go to My Orders
      </Link>
    </div>
  )
}

export default PaymentResult
