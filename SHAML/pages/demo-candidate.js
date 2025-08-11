import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, DollarSign, Users, FileText, CheckCircle } from 'lucide-react'

export default function DemoCandidateDashboard() {
  const [jobs] = useState([
    {
      id: '1',
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$120,000 - $160,000',
      skills: ['React', 'TypeScript', 'Next.js'],
      description: 'We are looking for a senior frontend developer to join our team.',
      status: 'open',
      created_at: '2024-01-15'
    },
    {
      id: '2',
      title: 'Backend Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salary: '$110,000 - $150,000',
      skills: ['Node.js', 'Python', 'PostgreSQL'],
      description: 'Join our backend team to build scalable systems.',
      status: 'open',
      created_at: '2024-01-10'
    },
    {
      id: '3',
      title: 'Product Manager',
      department: 'Product',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$130,000 - $170,000',
      skills: ['Product Strategy', 'Analytics', 'Leadership'],
      description: 'Lead our product development initiatives.',
      status: 'open',
      created_at: '2024-01-12'
    }
  ])

  const [appliedJobs, setAppliedJobs] = useState(new Set())
  const [showUploadModal, setShowUploadModal] = useState(null)

  const handleApply = (jobId) => {
    setShowUploadModal(jobId)
  }

  const handleUploadResume = (jobId) => {
    setAppliedJobs(prev => new Set([...prev, jobId]))
    setShowUploadModal(null)
    console.log('✅ Applied to job:', jobId)
  }

  const candidate = {
    name: 'Demo Candidate',
    email: 'candidate@example.com',
    phone: '+1-234-567-8900',
    experience: '3 years',
    skills: ['JavaScript', 'React', 'Node.js'],
    education: 'Bachelor in Computer Science'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                HireWise - Candidate Dashboard
              </h1>
              <span className="ml-4 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                Demo Working!
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              <span>{candidate.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Profile Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600"><strong>Name:</strong> {candidate.name}</p>
              <p className="text-gray-600"><strong>Email:</strong> {candidate.email}</p>
              <p className="text-gray-600"><strong>Phone:</strong> {candidate.phone}</p>
            </div>
            <div>
              <p className="text-gray-600"><strong>Experience:</strong> {candidate.experience}</p>
              <p className="text-gray-600"><strong>Education:</strong> {candidate.education}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {candidate.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Available Jobs</p>
                <p className="text-2xl font-bold text-gray-800">{jobs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Applications Sent</p>
                <p className="text-2xl font-bold text-gray-800">{appliedJobs.size}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-800">{appliedJobs.size}</p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-6">Available Job Opportunities ({jobs.length})</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => {
            const hasApplied = appliedJobs.has(job.id)

            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{job.title}</h3>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{job.location}</span>
                </div>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span className="text-sm">{job.salary}</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{job.department} • {job.type}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>
                
                {!hasApplied ? (
                  <motion.button
                    onClick={() => handleApply(job.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-md hover:from-green-600 hover:to-emerald-700 transition-all"
                  >
                    Apply Now
                  </motion.button>
                ) : (
                  <div className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-md text-center flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Applied
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Resume Upload Modal */}
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold mb-4">Upload Resume</h3>
              <p className="text-gray-600 mb-4">
                Upload your resume to apply for this position.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Drag & drop your resume here</p>
                <p className="text-sm text-gray-500 mt-1">or click to browse</p>
              </div>
              
              <div className="flex space-x-3">
                <motion.button
                  onClick={() => handleUploadResume(showUploadModal)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                >
                  Submit Application
                </motion.button>
                <motion.button
                  onClick={() => setShowUploadModal(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
