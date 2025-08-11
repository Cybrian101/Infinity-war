import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme, isLoading } = useTheme()

  if (isLoading) {
    return (
      <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
    )
  }

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative inline-flex items-center justify-center w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      role="switch"
      aria-checked={isDarkMode}
    >
      {/* Toggle Background */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500"
        initial={false}
        animate={{
          opacity: isDarkMode ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Toggle Circle */}
      <motion.div
        className="relative w-5 h-5 bg-white dark:bg-gray-200 rounded-full shadow-md flex items-center justify-center"
        initial={false}
        animate={{
          x: isDarkMode ? 16 : -16
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        {/* Icon */}
        <motion.div
          initial={false}
          animate={{
            scale: isDarkMode ? 1 : 0,
            rotate: isDarkMode ? 0 : 180
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Moon className="w-3 h-3 text-purple-600" />
        </motion.div>
        
        <motion.div
          initial={false}
          animate={{
            scale: isDarkMode ? 0 : 1,
            rotate: isDarkMode ? 180 : 0
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Sun className="w-3 h-3 text-yellow-500" />
        </motion.div>
      </motion.div>
    </motion.button>
  )
}
