import { useState, useEffect } from 'react'; // Import useEffect
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle } from 'lucide-react';

export default function SendOfferModal({ 
  isOpen, 
  onClose, 
  candidate, 
  jobTitle,
  // The onSendOffer prop is no longer needed for the sending logic,
  // but we can leave it here so it doesn't break the parent component.
  onSendOffer 
}) {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // *** FIX: This useEffect hook ensures the form data updates ***
  // *** whenever a new candidate is selected. ***
  useEffect(() => {
    if (candidate) {
      setFormData({
        to: candidate.email || '',
        subject: `Job Offer - ${jobTitle || ''}`,
        message: `Hi ${candidate.name || ''},\n\nWe were impressed with your résumé (${candidate.resumeUrl || 'resume.pdf'}). Based on our AI assessment, your profile has a ${candidate.matchScore || 0}% match for the role.\n\nWe would love to discuss the next steps with you.\n\nBest regards,\nThe HireWise AI Team`
      });
    }
  }, [candidate, jobTitle]); // This runs every time the candidate changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // *** FIX: This function now makes a REAL API call to your Supabase function ***
  const handleSendOffer = async () => {
    setIsLoading(true);
    
    try {
      // This is the real API call to your locally running Supabase function
      const response = await fetch('http://localhost:3000/functions/v1/send-offer-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formData.to,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // This will stop the process and jump to the catch block
        throw new Error(errorData.error || 'Failed to send the email.');
      }
      
      // If the API call succeeds, show the success UI
      setShowSuccess(true);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 3000);
      
    } catch (error) {
      console.error('Failed to send offer:', error);
      // Show an alert to the user with the specific error message
      alert(`Error: ${error.message}`);
    } finally {
      // This will run whether the call succeeded or failed
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading && !showSuccess) {
      onClose();
    }
  };

  // The UI below is exactly the same as what you provided.
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white border border-gray-200 shadow-2xl dark:bg-gray-800 rounded-xl dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {showSuccess ? (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full dark:bg-green-900/30"
                >
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </motion.div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Mail sent successfully!
                </h3>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Send Offer to {candidate?.name}
                  </h2>
                  <button
                    onClick={handleClose}
                    className="p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    disabled={isLoading}
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      To
                    </label>
                    <input
                      type="email"
                      name="to"
                      value={formData.to}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={8}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg resize-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-700 transition-colors rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendOffer}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Send Email
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
