import { NavLink } from 'react-router-dom'
import { BanknoteIcon, CheckIcon, LayoutDashboardIcon, ListIcon, Settings2Icon, WalletIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';

const AdminSidebar = () => {

    const { user } = useUser();

    const adminNavlinks = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboardIcon },
        { name: 'Verify', path: '/admin/verify-credentials', icon: CheckIcon },
        { name: 'Change', path: '/admin/change-credentials', icon: Settings2Icon },
        { name: 'Listings', path: '/admin/list-listings', icon: ListIcon },
        { name: 'Transactions', path: '/admin/transactions', icon: BanknoteIcon },
        { name: 'Withdrawal', path: '/admin/withdrawal', icon: WalletIcon },
    ];

    return (
        <motion.div
          initial={{ x: -24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className='h-[calc(100vh-64px)] md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm'
        >
            <img className='size-9 md:size-12 rounded-full mx-auto ring-2 ring-indigo-100 dark:ring-indigo-500/30' src={user.imageUrl} alt="sidebar" />
            <p className='mt-2 text-base max-md:hidden text-gray-800 dark:text-gray-100'>{user.firstName} {user.lastName}</p>
            <div className='w-full'>
                {adminNavlinks.map((link, index) => (
                    <NavLink
                      key={index}
                      to={link.path}
                      end
                      className={({ isActive }) =>
                        `relative flex items-center max-md:justify-center gap-2 w-full py-2.5 min-md:pl-10 first:mt-6 transition-colors duration-200 ${
                          isActive
                            ? 'bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 group'
                            : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`
                      }
                    >
                        {({ isActive }) => (
                            <>
                                <link.icon className="w-5 h-5" />
                                <p className="max-md:hidden">{link.name}</p>
                                {isActive && (
                                  <motion.span
                                    layoutId="admin-sidebar-indicator"
                                    className="w-1.5 h-10 rounded-l right-0 absolute bg-indigo-500"
                                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                  />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </motion.div>
    )
}

export default AdminSidebar
