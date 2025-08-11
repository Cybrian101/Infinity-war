import { JobsService } from '../../lib/supabaseDatabase'

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        return handleGetJobs(req, res);
      case 'PUT':
        return handleUpdateJob(req, res);
      case 'DELETE':
        return handleDeleteJob(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Jobs API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetJobs(req, res) {
  const { recruiterId, status } = req.query;

  try {
    let jobs;

    if (recruiterId) {
      jobs = await JobsService.getJobsByRecruiter(recruiterId);
    } else if (status) {
      jobs = await JobsService.getAllJobs();
      jobs = jobs.filter(job => job.status === status);
    } else {
      jobs = await JobsService.getAllJobs();
    }

    return res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleUpdateJob(req, res) {
  const { id } = req.query;
  const updates = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Job ID is required' });
  }

  try {
    const updatedJob = await JobsService.updateJob(id, updates);
    return res.status(200).json({
      success: true,
      job: updatedJob,
      message: 'Job updated successfully'
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleDeleteJob(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Job ID is required' });
  }

  try {
    // Check if job has applications
    const { ApplicationsService } = await import('../../lib/supabaseDatabase');
    const applications = await ApplicationsService.getApplicationsByJobId(id);
    
    if (applications.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete job with existing applications' 
      });
    }

    await JobsService.deleteJob(id);
    return res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return res.status(500).json({ error: error.message });
  }
}
