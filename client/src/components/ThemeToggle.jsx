import { motion, AnimatePresence } from 'framer-motion'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const ThemeToggle = ({ className = '', size = 'md' }) => {
  const { isDark, toggleTheme } = useTheme()

  const dims = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
  const iconSize = size === 'sm' ? 15 : 17

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative ${dims} flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-colors overflow-hidden ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.4 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-center"
          >
            <MoonIcon size={iconSize} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0.4 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-center"
          >
            <SunIcon size={iconSize} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export default ThemeToggle
