import { Outlet, Link, useLocation } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { useState } from "react";
import { useEffect } from "react";
import { ArrowRightIcon, Loader2Icon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SignIn, useAuth, useUser } from "@clerk/clerk-react";
import api from "../../configs/axios";
import { toast } from "react-hot-toast";

const Layout = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const {getToken} = useAuth();
    const {user, isLoaded } = useUser();
    const location = useLocation();

    const fetchIsAdmin = async () => {
       try{
        const token = await getToken()
        const { data } = await api.get("/api/admin/admin", {headers: {Authorization: `Bearer ${token}`}});
        setIsAdmin(data.isAdmin);
       } catch (error) {
        toast.error(error.response?.data?.message || error.message);
        console.log(error);
       } finally {
        setIsLoading(false);
       }
    };

    useEffect(() => {
        if (isLoaded && user) {
            fetchIsAdmin();
        }
    }, [isLoaded, user]);

if(isLoaded && !user){
    return (
        <div className="h-screen flex items-center justify-center">
            <SignIn />
        </div>
    )
}

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2Icon className="size-7 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return isAdmin ? (
        <>
            <AdminNavbar />
            <div className="flex">
                <AdminSidebar />
                <div className="flex-1 px-4 py-10 md:px-10 h-[calc(100vh-64px)] bg-slate-50 dark:bg-gray-950 overflow-y-auto text-gray-800 dark:text-gray-100">
                    <AnimatePresence mode="wait">
                        <motion.div
                          key={location.pathname}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </>
    ) : (
        <div className="flex flex-col items-center justify-center h-screen text-center bg-white dark:bg-gray-950">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">You don't have access to this page</h2>
            <Link to="/" className="inline-flex items-center px-6 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-all duration-200">
                Go to Home <ArrowRightIcon className="ml-2 size-4" />
            </Link>
        </div>
    );
};

export default Layout;
