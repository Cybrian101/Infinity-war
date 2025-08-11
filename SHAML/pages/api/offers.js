// import { Database } from '../../lib/database';
import path from 'path';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        return handleGetOffers(req, res);
      case 'POST':
        return handleCreateOffer(req, res);
      case 'PUT':
        return handleUpdateOffer(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Offers API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetOffers(req, res) {
  const { candidateId, jobId, applicationId } = req.query;

  // For simplicity, we'll store offers in a separate file
  const offers = Database.readFile(path.join(process.cwd(), 'data/offers.json')) || [];

  let filteredOffers = offers;

  if (candidateId) {
    filteredOffers = offers.filter(offer => offer.candidateId === candidateId);
  }

  if (jobId) {
    filteredOffers = offers.filter(offer => offer.jobId === jobId);
  }

  if (applicationId) {
    filteredOffers = offers.filter(offer => offer.applicationId === applicationId);
  }

  return res.status(200).json(filteredOffers);
}

async function handleCreateOffer(req, res) {
  const {
    applicationId,
    candidateId,
    jobId,
    salary,
    startDate,
    benefits,
    notes,
    recruiterId
  } = req.body;

  if (!applicationId || !candidateId || !jobId) {
    return res.status(400).json({ 
      error: 'Missing required fields: applicationId, candidateId, jobId' 
    });
  }

  // Verify application exists
  const application = Database.getApplications().find(app => app.id === applicationId);
  if (!application) {
    return res.status(404).json({ error: 'Application not found' });
  }

  // Verify job exists
  const job = Database.getJobById(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Verify candidate exists
  const candidate = Database.getCandidateById(candidateId);
  if (!candidate) {
    return res.status(404).json({ error: 'Candidate not found' });
  }

  const offer = {
    id: Date.now().toString(),
    applicationId,
    candidateId,
    jobId,
    salary: salary || job.salary || '',
    startDate: startDate || '',
    benefits: benefits || [],
    notes: notes || '',
    recruiterId: recruiterId || 'default-recruiter',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // Read existing offers
  const offersPath = path.join(process.cwd(), 'data/offers.json');
  const offers = Database.readFile(offersPath) || [];
  
  // Add new offer
  offers.push(offer);
  Database.writeFile(offersPath, offers);

  // Update application status
  Database.updateApplication(applicationId, { status: 'offer_sent' });

  return res.status(201).json({
    success: true,
    offer,
    message: 'Offer created successfully'
  });
}

async function handleUpdateOffer(req, res) {
  const { id, status, candidateResponse, ...updates } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Offer ID is required' });
  }

  const offersPath = path.join(process.cwd(), 'data/offers.json');
  const offers = Database.readFile(offersPath) || [];
  
  const offerIndex = offers.findIndex(offer => offer.id === id);
  if (offerIndex === -1) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  // Update offer
  offers[offerIndex] = {
    ...offers[offerIndex],
    ...updates,
    status: status || offers[offerIndex].status,
    candidateResponse: candidateResponse || offers[offerIndex].candidateResponse,
    updatedAt: new Date().toISOString()
  };

  Database.writeFile(offersPath, offers);

  // Update application status based on offer status
  if (status === 'accepted') {
    Database.updateApplication(offers[offerIndex].applicationId, { status: 'hired' });
  } else if (status === 'rejected') {
    Database.updateApplication(offers[offerIndex].applicationId, { status: 'rejected' });
  }

  return res.status(200).json({
    success: true,
    offer: offers[offerIndex],
    message: 'Offer updated successfully'
  });
}
