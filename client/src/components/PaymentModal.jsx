import { useState } from 'react'
import { X, CreditCard, Landmark } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import api from '../configs/axios'

const methods = [
  { id: 'stripe', label: 'Card (Stripe)', sub: 'Visa, Mastercard, Amex - charged in USD', icon: CreditCard },
  { id: 'esewa', label: 'eSewa', sub: 'Nepal mobile wallet - charged in NPR', icon: Landmark },
]

const PaymentModal = ({ listing, onClose }) => {
  const { getToken } = useAuth()
  const [loadingMethod, setLoadingMethod] = useState(null)

  const pay = async (method) => {
    try {
      setLoadingMethod(method)
      const token = await getToken()
      const headers = { Authorization: `Bearer ${token}` }

      if (method === 'stripe') {
        const { data } = await api.post(`/api/payment/stripe/checkout/${listing.id}`, {}, { headers })
        window.location.href = data.url
        return
      }

      if (method === 'esewa') {
        const { data } = await api.post(`/api/payment/esewa/checkout/${listing.id}`, {}, { headers })
        // eSewa expects a real form POST straight to their gateway, not a redirect URL
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = data.gatewayUrl
        Object.entries(data.fields).forEach(([key, value]) => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = value
          form.appendChild(input)
        })
        document.body.appendChild(form)
        form.submit()
        return
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message)
      setLoadingMethod(null)
    }
  }

  return (
    <div className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 flex items-center justify-center sm:p-4 z-50'>
      <div className='bg-white sm:rounded-lg shadow-2xl w-full max-w-md flex flex-col'>
        <div className='bg-linear-to-r from-indigo-600 to-indigo-400 text-white p-4 sm:rounded-t-lg relative flex items-center'>
          <h3 className='font-semibold text-lg flex-1'>Choose Payment Method</h3>
          <button onClick={onClose} className='absolute right-4 p-1 hover:bg-white/20 rounded-lg transition-colors'>
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='flex flex-col gap-3 p-5'>
          {methods.map(({ id, label, sub, icon: Icon }) => (
            <button
              key={id}
              disabled={loadingMethod !== null}
              onClick={() => pay(id)}
              className='flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 text-left hover:border-indigo-400 hover:bg-indigo-50 transition disabled:opacity-50'
            >
              <Icon className='size-5 text-indigo-600 shrink-0' />
              <span>
                <span className='block text-sm font-medium text-gray-800'>
                  {loadingMethod === id ? 'Redirecting...' : label}
                </span>
                <span className='block text-xs text-gray-500'>{sub}</span>
              </span>
            </button>
          ))}
          <p className='text-xs text-gray-400 mt-1'>
            Payment is confirmed by the provider before the listing is marked sold - you'll land on a confirmation
            page once that's verified.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
