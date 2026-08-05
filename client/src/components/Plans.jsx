import { PricingTable } from '@clerk/clerk-react'
import { motion } from 'framer-motion'

const plans = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className='max-w-2xl mx-auto z-20 my-30 max-md:px-4'
    >
  <div className='text-center'>
    <h2 className='text-gray-700 dark:text-gray-300 text-4xl font-semibold'>Choose
    Your Plan</h2>
    <p className='text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto'>Start for free and scale up as you grow. Find the perfect
    plan for your content creation needs.</p>
  </div>
  <div className='mt-14'>
    <PricingTable newSubscriptionRedirectUrl='/marketplace' />
  </div>
</motion.div>
  )
}

export default plans