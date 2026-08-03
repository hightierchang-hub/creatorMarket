import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import Logo from "../Logo"
import ThemeToggle from "../ThemeToggle"
import { ShieldCheckIcon } from "lucide-react"

const AdminNavbar = () => {

    return (
        <motion.div
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between px-4 sm:px-6 md:px-10 h-16 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-40"
        >
            <Link to="/" className="inline-flex items-center gap-2">
                <Logo className="h-9 w-auto sm:h-10 md:h-11" />
            </Link>
            <div className="flex items-center gap-3">
                <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/30">
                    <ShieldCheckIcon className="size-3.5" />
                    Admin console
                </span>
                <ThemeToggle size="sm" />
            </div>
        </motion.div>
    )
}

export default AdminNavbar
