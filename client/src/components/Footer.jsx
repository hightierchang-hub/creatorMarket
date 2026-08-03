import Logo from './Logo'
import { motion } from 'framer-motion'

const Footer = () => {
  return (
    <>
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-32 px-6 md:px-16 lg:px-24 xl:px-32 w-full text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-gray-900 pt-10"
    >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14">
                    <div className="sm:col-span-2 lg:col-span-1">
                        <a href="/">
                            <Logo className="h-12 w-auto" />
                        </a>
                        <p className="text-sm/7 mt-6">FlipEarn is a social media marketplace . We are the leading social media marketplace that connects brands
                         with their customers With our user-friendly interface</p>
                    </div>
                    <div className="flex flex-col lg:items-center lg:justify-center">
                        <div className="flex flex-col text-sm space-y-2.5">
                            <h2 className="font-semibold mb-5 text-gray-800 dark:text-gray-100">Company</h2>
                            <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition" href="#">About us</a>
                            <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition" href="#">Careers<span className="text-xs text-white bg-indigo-600 rounded-md ml-2 px-2 py-1">
                                We're hiring!</span></a>
                            <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition" href="#">Contact us</a>
                            <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition" href="#">Privacy policy</a>
                        </div>
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-5">Subscribe to our newsletter</h2>
                        <div className="text-sm space-y-6 max-w-sm">
                            <p>The latest news, articles, and resources, sent to your inbox weekly.</p>
                            <div className="flex items-center justify-center gap-2 p-2 rounded-md bg-indigo-50 dark:bg-indigo-500/10">
                                <input className="focus:ring-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ring-indigo-600 outline-none w-full max-w-64 py-2 rounded px-2" type="email" 
                                placeholder="Enter your email" />
                                <button className="bg-indigo-600 hover:bg-indigo-700 transition-colors px-4 py-2 text-white rounded">Subscribe</button>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="py-4 text-center border-t mt-6 border-slate-200 dark:border-slate-800">
                    Copyright 2026 © <span className="text-indigo-600 dark:text-indigo-400">Hiten</span>. All Right Reserved.
                </p>
            </motion.footer>
    </>
  )
}

export default Footer
