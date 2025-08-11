// Sample candidate data with resumes
const sampleCandidates = [
  {
    id: 'candidate1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    role: 'Senior Software Engineer',
    resumeUrl: 'resume_jane_doe.pdf',
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS'],
    keyStrengths: ['Team Leadership', 'System Architecture'],
    aiSuggestions: [
      'Explore Kubernetes for orchestration.',
      'Contribute to open-source projects to enhance profile.'
    ],
    experience: 'Excellent alignment with core technologies and senior-level experience.'
  },
  {
    id: 'candidate2',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'Frontend Developer',
    resumeUrl: 'resume_john_smith.pdf',
    skills: ['JavaScript', 'React', 'Redux', 'Next.js', 'GraphQL'],
    keyStrengths: ['UI/UX Design Sense', 'Performance Optimization'],
    aiSuggestions: [
      'Gain experience with backend technologies like Node.js.',
      'Learn a typed superset of JavaScript like TypeScript.'
    ],
    experience: 'Strong frontend skills and experience with modern JavaScript frameworks.'
  },
  {
    id: 'candidate3',
    name: 'Emily White',
    email: 'emily.white@example.com',
    role: 'Junior Developer',
    resumeUrl: 'resume_emily_white.pdf',
    skills: ['Java', 'Spring Boot', 'SQL', 'REST APIs'],
    keyStrengths: ['Problem Solving', 'Attention to Detail'],
    aiSuggestions: [
      'Participate in open-source projects.',
      'Explore cloud platforms like Azure or GCP.'
    ],
    experience: 'Solid understanding of data structures and algorithms.'
  },
  {
    id: 'candidate4',
    name: 'Michael Johnson',
    email: 'michael.johnson@example.com',
    role: 'Full Stack Developer',
    resumeUrl: 'resume_michael_johnson.pdf',
    skills: ['React', 'Node.js', 'MongoDB', 'Express', 'Docker'],
    keyStrengths: ['Full Stack Development', 'Database Design'],
    aiSuggestions: [
      'Learn cloud deployment strategies.',
      'Gain experience with microservices architecture.'
    ],
    experience: 'Comprehensive full-stack development experience with modern technologies.'
  },
  {
    id: 'candidate5',
    name: 'Sarah Davis',
    email: 'sarah.davis@example.com',
    role: 'DevOps Engineer',
    resumeUrl: 'resume_sarah_davis.pdf',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
    keyStrengths: ['Infrastructure Management', 'CI/CD Pipeline'],
    aiSuggestions: [
      'Explore serverless architectures.',
      'Learn about security best practices in DevOps.'
    ],
    experience: 'Strong background in cloud infrastructure and automation.'
  }
]

// AI-powered matching function using Gemini API
export async function getTopCandidates(jobDescription, resumeFiles = []) {
  try {
    // If no resume files provided, use sample data as fallback
    if (!resumeFiles || resumeFiles.length === 0) {
      console.log('No resume files provided, using sample data')
      return getSampleCandidates(jobDescription)
    }

    // Create FormData for the API request
    const formData = new FormData()
    formData.append('jobDescription', jobDescription)
    
    // Add resume files to FormData
    resumeFiles.forEach((file, index) => {
      formData.append('resumes', file)
    })

    // Call the backend API
    const response = await fetch('/api/compare-resume', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `API Error: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.success || !result.candidates) {
      throw new Error('Invalid API response format')
    }

    return result.candidates

  } catch (error) {
    console.error('Error calling Gemini API:', error)
    // Fallback to sample data on error
    return getSampleCandidates(jobDescription)
  }
}

// Fallback function using sample data
function getSampleCandidates(jobDescription) {
  const jobSkills = extractSkillsFromJD(jobDescription)
  const jobRole = extractRoleFromJD(jobDescription)
  
  const candidatesWithScores = sampleCandidates.map(candidate => {
    let matchScore = 0
    
    // Skill matching (60% weight)
    const skillMatches = candidate.skills.filter(skill => 
      jobSkills.some(jobSkill => 
        skill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(skill.toLowerCase())
      )
    )
    const skillScore = (skillMatches.length / Math.max(jobSkills.length, candidate.skills.length)) * 60
    
    // Role matching (25% weight)
    const roleScore = calculateRoleMatch(jobRole, candidate.role) * 25
    
    // Experience relevance (15% weight)
    const experienceScore = Math.random() * 15 // Simulated experience matching
    
    matchScore = Math.min(95, Math.max(65, skillScore + roleScore + experienceScore))
    
    return {
      ...candidate,
      matchScore: Math.round(matchScore)
    }
  })
  
  // Sort by match score and return top 3
  return candidatesWithScores
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3)
}

function extractSkillsFromJD(jobDescription) {
  const commonSkills = [
    'React', 'Node.js', 'JavaScript', 'TypeScript', 'Python', 'Java', 'AWS', 
    'Docker', 'Kubernetes', 'MongoDB', 'SQL', 'GraphQL', 'Redux', 'Next.js',
    'Express', 'Spring Boot', 'REST APIs', 'Jenkins', 'Terraform'
  ]
  
  return commonSkills.filter(skill => 
    jobDescription.toLowerCase().includes(skill.toLowerCase())
  )
}

function extractRoleFromJD(jobDescription) {
  const roles = [
    'Senior Software Engineer', 'Frontend Developer', 'Backend Developer',
    'Full Stack Developer', 'DevOps Engineer', 'Junior Developer'
  ]
  
  const foundRole = roles.find(role => 
    jobDescription.toLowerCase().includes(role.toLowerCase())
  )
  
  return foundRole || 'Software Developer'
}

function calculateRoleMatch(jobRole, candidateRole) {
  if (jobRole.toLowerCase() === candidateRole.toLowerCase()) return 1
  if (jobRole.toLowerCase().includes('senior') && candidateRole.toLowerCase().includes('senior')) return 0.9
  if (jobRole.toLowerCase().includes('developer') && candidateRole.toLowerCase().includes('developer')) return 0.7
  if (jobRole.toLowerCase().includes('engineer') && candidateRole.toLowerCase().includes('engineer')) return 0.7
  return 0.5
}

export { sampleCandidates }
