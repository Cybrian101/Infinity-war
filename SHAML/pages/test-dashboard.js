import { useState } from 'react'
import { motion } from 'framer-motion'

export default function TestDashboard() {
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
    }
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                HireWise Test Dashboard
              </h1>
              <span className="ml-4 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                Working!
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-6">Available Jobs ({jobs.length})</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{job.title}</h3>
              <p className="text-gray-600 mb-2">{job.department} • {job.location}</p>
              <p className="text-gray-600 mb-3">{job.salary}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              
              <button className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors">
                Apply Now
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
