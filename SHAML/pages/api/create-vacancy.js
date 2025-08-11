import { JobsService } from '../../lib/supabaseDatabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      title,
      department,
      location,
      description,
      responsibilities,
      requirements,
      experienceYears,
      salary,
      jobType,
      recruiterId,
      skills
    } = req.body;

    // Validate required fields
    if (!title || !department || !location || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create vacancy using Supabase
    const vacancyData = {
      title,
      department,
      location,
      description,
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      experienceYears: experienceYears || '0',
      salary: salary || '',
      jobType: jobType || 'Full-time',
      recruiterId: recruiterId || 'default-recruiter',
      skills: Array.isArray(skills) ? skills : []
    };

    const vacancy = await JobsService.createJob(vacancyData);

    res.status(201).json({
      success: true,
      message: 'Vacancy created successfully',
      vacancy
    });
  } catch (error) {
    console.error('Error creating vacancy:', error);
    res.status(500).json({ error: error.message || 'Failed to create vacancy' });
  }
}