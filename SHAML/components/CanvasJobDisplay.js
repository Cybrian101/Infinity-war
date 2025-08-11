import { motion } from 'framer-motion';
import { 
  Users, 
  FileText, 
  Eye, 
  TrendingUp,
  Calendar,
  Building
} from 'lucide-react';

// FIX: The component now receives the full 'applications' list as a prop from the dashboard.
// The unnecessary 'useApplications' hook has been removed.
export default function CanvasJobDisplay({ jobs = [], applications = [] }) {

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold text-gray-800">
          Job Canvas View
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {jobs.length} active jobs
          </span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </motion.div>

      <div className="grid gap-6">
        {jobs.map((job, index) => {
          // FIX: Instead of calling a non-existent function, we now filter the applications prop.
          // This is faster and uses the data that is already loaded.
          const jobApplications = applications.filter(app => app.job_id === job.id);
          
          const sortedApplications = jobApplications
            .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
            .slice(0, 5);

          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              {/* Job Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Building className="w-5 h-5 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">{job.department}</span>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-800">
                    {job.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{job.salary}</span>
                    <span>•</span>
                    <span>{job.experience_years} experience</span>
                    <span>•</span>
                    <span>{jobApplications.length} applications</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center mb-2">
                    <span className="mr-2 text-sm text-gray-600">Status</span>
                    <span className="px-2 py-1 text-xs text-green-700 capitalize bg-green-100 rounded-full">
                      {job.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Recruitment Progress</span>
                  <span className="text-sm text-gray-500">
                    {jobApplications.length > 0 ? 'In Progress' : 'No Applications'}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <motion.div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((jobApplications.length / 10) * 100, 100)}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
              </div>

              {/* Applications List */}
              {sortedApplications.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="flex items-center font-medium text-gray-700">
                      <Users className="w-4 h-4 mr-2" />
                      Top Candidates ({sortedApplications.length})
                    </h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Best matches first
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {sortedApplications.map((application, idx) => (
                      <motion.div
                        key={application.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="flex items-center justify-between p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-10 h-10 mr-3 font-semibold text-white rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                            {/* FIX: Use candidate_name directly from the application object */}
                            {application.candidate_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {application.candidate_name || 'Unknown Candidate'}
                            </p>
                            <div className="flex items-center text-sm text-gray-600">
                              <FileText className="w-3 h-3 mr-1" />
                              <span className="mr-2">Resume</span>
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>{new Date(application.applied_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center mb-1">
                            <span className="mr-2 text-sm font-medium text-gray-600">
                              {application.match_score || 0}%
                            </span>
                            <div className="w-16 h-2 overflow-hidden bg-gray-200 rounded-full">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${application.match_score || 0}%` }}
                                transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 capitalize">
                            {application.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-8 text-center"
                >
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <h4 className="mb-2 text-lg font-medium text-gray-600">
                    No applications yet
                  </h4>
                  <p className="text-sm text-gray-500">
                    This job posting is waiting for candidates to apply
                  </p>
                </motion.div>
              )}

              {/* Quick Actions */}
              <div className="pt-4 mt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </motion.button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      Last updated: {new Date().toLocaleTimeString()}
                    </span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {jobs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-12 text-center"
        >
          <Building className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold text-gray-600">
            No active jobs
          </h3>
          <p className="text-gray-500">
            Create job postings to see them in the canvas view
          </p>
        </motion.div>
      )}
    </div>
  )
}
