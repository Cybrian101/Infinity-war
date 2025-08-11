import { CandidatesService } from '../../lib/supabaseDatabase'

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        return handleGetCandidates(req, res);
      case 'POST':
        return handleCreateCandidate(req, res);
      case 'PUT':
        return handleUpdateCandidate(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Candidates API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetCandidates(req, res) {
  const { id, email } = req.query;

  try {
    if (id) {
      const candidate = await CandidatesService.getCandidateById(id);
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }
      return res.status(200).json(candidate);
    }

    if (email) {
      const candidates = await CandidatesService.getAllCandidates();
      const candidate = candidates.find(c => c.email === email);
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }
      return res.status(200).json(candidate);
    }

    // Return all candidates
    const candidates = await CandidatesService.getAllCandidates();
    return res.status(200).json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleCreateCandidate(req, res) {
  const {
    name,
    email,
    phone,
    location,
    experience,
    skills,
    education,
    summary
  } = req.body;

  // Validate required fields
  if (!name || !email) {
    return res.status(400).json({ 
      error: 'Missing required fields: name and email' 
    });
  }

  try {
    // Check if candidate already exists
    const candidates = await CandidatesService.getAllCandidates();
    const existingCandidate = candidates.find(c => c.email === email);
    if (existingCandidate) {
      return res.status(409).json({ 
        error: 'Candidate with this email already exists' 
      });
    }

    const candidateData = {
      name,
      email,
      phone: phone || '',
      location: location || '',
      experience: experience || '',
      skills: Array.isArray(skills) ? skills : [],
      education: education || '',
      summary: summary || ''
    };

    const newCandidate = await CandidatesService.createCandidate(candidateData);

    return res.status(201).json({
      success: true,
      candidate: newCandidate,
      message: 'Candidate created successfully'
    });
  } catch (error) {
    console.error('Error creating candidate:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleUpdateCandidate(req, res) {
  const { id, ...updates } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Candidate ID is required' });
  }

  try {
    const updatedCandidate = await CandidatesService.updateCandidate(id, updates);

    return res.status(200).json({
      success: true,
      candidate: updatedCandidate,
      message: 'Candidate updated successfully'
    });
  } catch (error) {
    console.error('Error updating candidate:', error);
    return res.status(500).json({ error: error.message });
  }
}
