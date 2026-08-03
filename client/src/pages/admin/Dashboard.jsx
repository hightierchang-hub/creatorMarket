import { ChartLineIcon, CircleDollarSignIcon, ListIcon, Loader2Icon, UsersIcon } from 'lucide-react';
import AdminTitle from '../../components/admin/AdminTitle';
import { useState } from 'react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import ListingDetailsModal from '../../components/admin/ListingDetailsModal';
import { useUser, useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import api from '../../configs/axios';

const Dashboard = () => {

    const { user } = useUser();
    const { getToken } = useAuth();

    const currency = import.meta.env.VITE_CURRENCY || '$';

    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        totalListings: 0,
        totalRevenue: 0,
        activeListings: 0,
        totalUser: 0,
        recentListings: [],
    });
    const [showModal, setShowModal] = useState(null);

    const dashboardCards = [
        { title: 'Total Listings', value: dashboardData.totalListings || '0', icon: ChartLineIcon },
        { title: 'Total Revenue', value: currency + dashboardData.totalRevenue.toLocaleString() || '0', icon: CircleDollarSignIcon },
        { title: 'Active Listings', value: dashboardData.activeListings || '0', icon: ListIcon },
        { title: 'Total Users', value: dashboardData.totalUser || '0', icon: UsersIcon },
    ];

    const fetchDashboardData = async () => {
    try {
        const token = await getToken();
        const { data } = await api.get('/api/admin/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(data.dashBoardData);
    } catch (error) {
        toast.error(error.response?.data?.message || error.message);
        console.log(error);
    } finally {
        setLoading(false);
    }
};
    useEffect(() => {
        if(user) {
            fetchDashboardData();
        }
    }, [user]);

    return loading ? (
        <div className='flex items-center justify-center h-full'>
            <Loader2Icon className='animate-spin text-indigo-600 size-7' />
        </div>
    ) : (
        <>
            <AdminTitle text1='Admin' text2='Dashboard' />

            <div className='relative flex flex-wrap gap-4 mt-6 text-gray-600 dark:text-gray-400'>
                <div className='flex flex-wrap gap-4 w-full'>
                    {dashboardCards.map((card, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                          whileHover={{ y: -3 }}
                          className='flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 ring ring-gray-200 dark:ring-gray-800 rounded-md max-w-50 w-full shadow-sm hover:shadow-md transition-shadow'
                        >
                            <div>
                                <h1 className='text-sm'>{card.title}</h1>
                                <p className='text-xl font-medium mt-1 text-gray-900 dark:text-gray-100'>{card.value}</p>
                            </div>
                            <card.icon className='text-indigo-500 dark:text-indigo-400' />
                        </motion.div>
                    ))}
                </div>
            </div>
            <p className='mt-10 text-lg font-medium text-gray-700 dark:text-gray-300'>Recent Listings</p>
            <div className='mt-6 overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-5xl rounded-xl'>
                <table className='w-full text-sm text-left  text-gray-700 dark:text-gray-300'>
                    <thead className='text-xs uppercase border-b border-gray-200 dark:border-gray-800'>
                        <tr>
                            <th className='pl-4 py-3'> # </th>
                            <th className='px-4 py-3'>Title</th>
                            <th className='px-4 py-3'>Niche</th>
                            <th className='px-4 py-3'>Platform</th>
                            <th className='px-4 py-3'>Username</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashboardData.recentListings.map((listing, index) => (
                            <motion.tr
                              onClick={() => setShowModal(listing)}
                              key={index}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.25, delay: index * 0.03 }}
                              className='border-t border-gray-200 dark:border-gray-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 cursor-pointer'
                            >
                                <td className='pl-4 py-3'>{index + 1}.</td>
                                <td className='px-4 py-3 text-gray-900 dark:text-gray-100'>{listing.title}</td>
                                <td className='px-4 py-3'>{listing.niche}</td>
                                <td className='px-4 py-3'>{listing.platform}</td>
                                <td className='px-4 py-3'>@{listing.username}</td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
                {showModal && <ListingDetailsModal listing={showModal} onClose={() => setShowModal(null)} />}
            </div>
        </>
    );
};

export default Dashboard;
