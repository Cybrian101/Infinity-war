import { motion } from 'framer-motion'
import { CheckCircle, Clock, Mail } from 'lucide-react'

export default function ProgressBar({ currentStep = 1, totalSteps = 3 }) {
  const steps = [
    { id: 1, label: 'JD Compared', icon: CheckCircle, color: 'green' },
    { id: 2, label: 'Profiles Ranked', icon: Clock, color: 'blue' },
    { id: 3, label: 'Emails Sent', icon: Mail, color: 'purple' }
  ]

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id
          const isPending = currentStep < step.id

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-gray-200 border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                
                {/* Progress line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-6 left-12 w-full h-0.5 bg-gray-200">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: currentStep > step.id ? '100%' : '0%' 
                      }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  </div>
                )}
              </div>
              
              <span
                className={`text-sm font-medium mt-2 ${
                  isCompleted
                    ? 'text-green-600'
                    : isCurrent
                    ? 'text-blue-600'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </motion.div>
          )
        })}
      </div>
      
      <div className="text-center">
        <span className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
    </div>
  )
} 