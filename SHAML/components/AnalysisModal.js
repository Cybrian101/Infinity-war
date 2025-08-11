import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader, ExternalLink, X } from 'lucide-react';
import ProgressBar from './ProgressBar';

export default function AnalysisModal({ isOpen, onClose, jobTitle, analysisStep, topCandidates, jobId }) {
  const isComplete = analysisStep > 3;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-lg bg-white rounded-lg shadow-xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Analyzing Applicants for {jobTitle}
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X />
                </button>
              </div>

              <div className="my-8">
                <ProgressBar currentStep={analysisStep} />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={analysisStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center"
                >
                  {isComplete ? (
                    <div>
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Analysis Complete!</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        We've ranked the top {topCandidates.length} candidates for you.
                      </p>
                      <motion.a
                        href={`/recruiter/top-matches/${jobId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center justify-center w-full gap-2 px-4 py-3 mt-6 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                      >
                        View Top Matches <ExternalLink className="w-4 h-4" />
                      </motion.a>
                    </div>
                  ) : (
                    <div>
                      <Loader className="w-8 h-8 mx-auto mb-4 text-blue-500 animate-spin" />
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">AI Processing in Progress...</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Please wait while we analyze the resumes. This may take a moment.
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
