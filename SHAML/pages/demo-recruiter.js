import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Briefcase, Play, CheckCircle, Clock } from 'lucide-react'

export default function DemoRecruiterDashboard() {
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
      status: 'open'
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
      status: 'open'
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
      status: 'open'
    }
  ])

  const [processingJobs, setProcessingJobs] = useState(new Set())
  const [jobCandidates, setJobCandidates] = useState({})

  const mockCandidates = [
    {
      id: 'candidate-1',
      name: 'John Doe',
      email: 'john@example.com',
      experience: '5 years',
      skills: ['React', 'JavaScript', 'TypeScript', 'Next.js'],
      education: 'Master in Computer Science',
      matchScore: 95
    },
    {
      id: 'candidate-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      experience: '4 years',
      skills: ['React', 'Vue.js', 'JavaScript', 'CSS'],
      education: 'Bachelor in Software Engineering',
      matchScore: 88
    },
    {
      id: 'candidate-3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      experience: '6 years',
      skills: ['Angular', 'TypeScript', 'Node.js'],
      education: 'Master in Information Technology',
      matchScore: 82
    }
  ]

  const handleStartProcessing = async (job) => {
    console.log('🚀 Starting AI candidate matching for job:', job.title)
    setProcessingJobs(prev => new Set([...prev, job.id]))
    
    // Simulate realistic AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Get relevant candidates based on job requirements
    let relevantCandidates = []
    
    if (job.title.toLowerCase().includes('frontend')) {
      relevantCandidates = [
        { ...mockCandidates[0], matchScore: 95 }, // John Doe - React expert
        { ...mockCandidates[1], matchScore: 88 }, // Jane Smith - React/Vue
        { ...mockCandidates[2], matchScore: 82 }  // Mike Johnson - Angular/TypeScript
      ]
    } else if (job.title.toLowerCase().includes('backend')) {
      relevantCandidates = [
        { ...mockCandidates[2], matchScore: 91 }, // Mike Johnson - Node.js
        { ...mockCandidates[0], matchScore: 85 }, // John Doe - some backend
        { ...mockCandidates[1], matchScore: 78 }  // Jane Smith - basic backend
      ]
    } else {
      relevantCandidates = mockCandidates.map(candidate => ({ ...candidate, matchScore: Math.floor(Math.random() * 30) + 70 }))
    }
    
    // Sort by match score and take top 3
    const topCandidates = relevantCandidates
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3)
    
    console.log('✅ AI matching complete! Found top candidates:', topCandidates)
    
    setJobCandidates(prev => ({
      ...prev,
      [job.id]: topCandidates
    }))
    
    setProcessingJobs(prev => {
      const newSet = new Set(prev)
      newSet.delete(job.id)
      return newSet
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
                HireWise - Recruiter Dashboard
              </h1>
              <span className="ml-4 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                Demo Working!
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Briefcase className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-800">{jobs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Matched Candidates</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Object.values(jobCandidates).reduce((total, candidates) => total + candidates.length, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Processed Jobs</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Object.keys(jobCandidates).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-6">Job Postings</h2>
        
        <div className="grid gap-6">
          {jobs.map((job) => {
            const isProcessing = processingJobs.has(job.id)
            const matchedCandidates = jobCandidates[job.id] || []
            const hasProcessed = matchedCandidates.length > 0

            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{job.title}</h3>
                    <p className="text-gray-600 mb-2">{job.department} • {job.location}</p>
                    <p className="text-gray-600 mb-3">{job.salary}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    {!hasProcessed && !isProcessing && (
                      <motion.button
                        onClick={() => handleStartProcessing(job)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-indigo-700 transition-all"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Processing
                      </motion.button>
                    )}

                    {isProcessing && (
                      <div className="flex items-center text-purple-600">
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        <span className="text-sm">AI is analyzing resumes...</span>
                      </div>
                    )}

                    {hasProcessed && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm">Processing Complete</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Matched Candidates */}
                {hasProcessed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t pt-4 mt-4"
                  >
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Top Matched Candidates ({matchedCandidates.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {matchedCandidates.map((candidate, index) => (
                        <motion.div
                          key={candidate.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-50 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-gray-800">{candidate.name}</h5>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              candidate.matchScore >= 90 ? 'bg-green-100 text-green-700' :
                              candidate.matchScore >= 80 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {candidate.matchScore}% Match
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{candidate.email}</p>
                          <p className="text-sm text-gray-600 mb-2">{candidate.experience} experience</p>
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills.slice(0, 3).map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="px-1 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-3 bg-purple-500 text-white py-1 px-3 rounded text-sm hover:bg-purple-600 transition-colors"
                          >
                            Send Offer
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
