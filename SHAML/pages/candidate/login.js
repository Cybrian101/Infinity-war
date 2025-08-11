import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from '../../components/LoginForm'
import SignupForm from '../../components/SignupForm'

export default function CandidateLogin() {
  const [showSignup, setShowSignup] = useState(false)

  return (
    <AnimatePresence mode="wait">
      {showSignup ? (
        <motion.div
          key="signup"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <SignupForm onSwitchToLogin={() => setShowSignup(false)} />
        </motion.div>
      ) : (
        <motion.div
          key="login"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <LoginForm 
            role="candidate" 
            onSwitchToSignup={() => setShowSignup(true)} 
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
} 