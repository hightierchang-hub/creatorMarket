import { useEffect, useState } from 'react'
import { useSearchParams, Link, useLocation } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2Icon, LogInIcon } from 'lucide-react'
import { useAuth, useClerk } from '@clerk/clerk-react'
import api from '../configs/axios'
import toast from 'react-hot-toast'

const POLL_ATTEMPTS = 10
const POLL_INTERVAL_MS = 2000

// This page never decides payment success on its own. It polls GET
// /api/payment/status/:transactionId, which only ever reflects what a
// verified webhook or signed callback already wrote to the DB.
//
// IMPORTANT: getting here is always a full-page redirect back from an
// external domain (Stripe/eSewa), never client-side routing. That means
// Clerk has to re-hydrate the session from scratch on load, and - notably
// with Clerk *development* instances specifically - that hand-off can lag
// a beat behind this component mounting, since dev instances don't get the
// same first-party-cookie continuity across a third-party redirect that
// production instances do. So we (a) wait for Clerk's `isLoaded` before
// doing anything, and (b) fetch a FRESH token on every poll attempt rather
// than grabbing one token once and reusing it - otherwise a token grabbed
// half a second too early gets reused for the entire retry loop and every
// attempt fails the same way.
const PaymentResult = () => {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const transactionId = searchParams.get('transactionId')
  const isCancelPath = location.pathname.includes('cancel')
  const reason = searchParams.get('reason') || ''
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { openSignIn } = useClerk()

  const [status, setStatus] = useState(isCancelPath ? 'failed' : 'checking')

  useEffect(() => {
    if (isCancelPath) return
    if (!transactionId) {
      setStatus('failed')
      return
    }
    // Don't do anything until Clerk has finished re-establishing the
    // session after the redirect back from the payment provider.
    if (!isLoaded) return

    if (!isSignedIn) {
      setStatus('signed-out')
      return
    }

    let cancelled = false

    const confirm = async () => {
      try {
        for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
          if (cancelled) return
          // Fresh token every attempt - see note above.
          const token = await getToken()
          const headers = { Authorization: `Bearer ${token}` }
          try {
            const { data } = await api.get(`/api/payment/status/${transactionId}`, { headers })
            if (data.isPaid) {
              if (!cancelled) setStatus('success')
              return
            }
          } catch (err) {
            // A 404 this early can just mean Clerk's session hand-off (or
            // the callback that writes the transaction) hasn't finished
            // yet - keep retrying instead of failing on the first miss.
            if (err?.response?.status !== 404 && err?.response?.status !== 401) throw err
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
  }, [getToken, isCancelPath, isLoaded, isSignedIn, transactionId])

  const reasonMessages = {
    missing_data: 'No payment data was returned from the provider.',
    signature: 'The payment provider callback could not be verified.',
    not_found: 'The payment record could not be found on our server.',
    not_completed: 'The transaction was not completed by the provider.',
    error: 'There was an error confirming your payment.',
  }
  const reasonText = reasonMessages[reason] || (reason ? `Payment issue: ${reason.replace(/_/g, ' ')}` : '')

  return (
    <div className='min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center'>
      {status === 'checking' ? (
        <>
          <Loader2Icon className='size-10 animate-spin text-indigo-600' />
          <p className='text-gray-600 dark:text-gray-400'>Confirming your payment...</p>
        </>
      ) : status === 'success' ? (
        <>
          <CheckCircle2 className='size-14 text-green-500' />
          <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-100'>Payment successful</h2>
          <p className='text-gray-500 dark:text-gray-400 max-w-sm'>
            Your purchase is confirmed. The seller has been notified and account credentials will be shared via chat.
          </p>
        </>
      ) : status === 'signed-out' ? (
        <>
          <LogInIcon className='size-14 text-amber-500' />
          <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-100'>Sign in to see your confirmation</h2>
          <p className='text-gray-500 dark:text-gray-400 max-w-sm'>
            Your payment provider redirected you back, but we lost track of your session on the way. Your payment is
            still safe - sign back in and check My Orders.
          </p>
          <button
            onClick={() => openSignIn()}
            className='mt-2 bg-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium'
          >
            Sign in
          </button>
        </>
      ) : status === 'pending' ? (
        <>
          <Loader2Icon className='size-14 text-amber-500' />
          <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-100'>Still confirming</h2>
          <p className='text-gray-500 dark:text-gray-400 max-w-sm'>
            Your payment is being verified with the provider. This can take a minute - check My Orders shortly.
          </p>
        </>
      ) : (
        <>
          <XCircle className='size-14 text-red-500' />
          <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-100'>Payment not completed</h2>
          <p className='text-gray-500 dark:text-gray-400 max-w-sm'>
            Your payment was cancelled or could not be confirmed. No charge should have gone through - try again or
            use a different method.
          </p>
          {reasonText ? (
            <p className='text-sm text-red-500'>{reasonText}</p>
          ) : null}
        </>
      )}
      <Link to='/my-orders' className='mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium'>
        Go to My Orders
      </Link>
    </div>
  )
}

export default PaymentResult
