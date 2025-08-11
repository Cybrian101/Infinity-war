import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, CheckCircle, Building, Clock, Users } from 'lucide-react';
import ResumeUploadModal from './ResumeUploadModal'; // Import the new modal

export default function JobCard({ 
    job, 
    onApply, 
    hasApplied, 
    isCandidateView, 
    index,
    applications = [],
    onStartProcessing,
    isProcessing,
    matchedCandidates = []
}) {
  // This state now controls the visibility of the new modal
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex flex-col h-full p-6 transition-all bg-white border rounded-lg shadow-md dark:bg-gray-800 hover:shadow-xl dark:border-gray-700"
      >
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{job.title}</h3>
          <div className="flex items-center mb-2 text-sm text-gray-500 dark:text-gray-400">
              <Building className="w-4 h-4 mr-2" />
              <span>{job.department}</span>
          </div>
          
          <div className="flex items-center mb-1 text-sm text-gray-600 dark:text-gray-300">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center mb-3 text-sm text-gray-600 dark:text-gray-300">
            <DollarSign className="w-4 h-4 mr-2" />
            <span>{job.salary || 'Not specified'}</span>
          </div>
           <div className="flex items-center mb-3 text-sm text-gray-600 dark:text-gray-300">
            <Clock className="w-4 h-4 mr-2" />
            <span>{job.experience_years || 'Not specified'} experience</span>
          </div>

          <p className="mb-4 text-sm text-gray-700 dark:text-gray-200 line-clamp-2">
            {job.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills?.slice(0, 4).map(skill => (
              <span key={skill} className="px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900/50 dark:text-blue-300">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Candidate-Specific View */}
        {isCandidateView && (
          <div className="pt-4 mt-auto border-t dark:border-gray-700">
              {hasApplied ? (
                  <div className="flex items-center justify-center font-semibold text-green-600 dark:text-green-400">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span>Applied</span>
                  </div>
              ) : (
                  <button
                      onClick={() => setShowUploadModal(true)} // Open the modal on click
                      className="w-full bg-green-600 btn-primary hover:bg-green-700"
                  >
                      Apply Now
                  </button>
              )}
          </div>
        )}

        {/* Recruiter-Specific View */}
        {!isCandidateView && (
            <div className="pt-4 mt-auto space-y-4 border-t dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{applications.length} Applications</span>
                    </div>
                    <button 
                      onClick={onStartProcessing} 
                      disabled={isProcessing || applications.length === 0}
                      className="text-sm btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Analyzing...' : 'Analyze Candidates'}
                    </button>
                </div>
                {matchedCandidates.length > 0 && (
                    <div>
                        <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Top Matches:</h4>
                        <div className="space-y-1">
                            {matchedCandidates.map(c => (
                                <div key={c.id} className="flex justify-between p-2 text-xs bg-gray-100 rounded dark:bg-gray-700">
                                    <span>{c.full_name}</span>
                                    <span className="font-bold">{c.match_score}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
      </motion.div>

      {/* The Modal itself, which is controlled by the state */}
      <ResumeUploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        job={job}
        onApply={onApply}
      />
    </>
  );
}
