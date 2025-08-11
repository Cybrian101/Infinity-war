import { ApplicationsService, CandidatesService, StorageService } from '../../lib/supabaseDatabase';
import formidable from 'formidable';
import fs from 'fs/promises'; // Using promises version of fs for async/await
import path from 'path';

// Disable default body parser to handle file uploads with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // We only allow POST requests to this specific endpoint for creation
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const form = formidable({
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
  });

  try {
    const [fields, files] = await form.parse(req);

    // Extract and validate required fields from the form data
    const jobId = fields.jobId?.[0];
    const candidateId = fields.candidateId?.[0];
    const candidateName = fields.candidateName?.[0];
    const candidateEmail = fields.candidateEmail?.[0];
    const resumeFile = files.file?.[0]; // The dashboard sends the file under the key 'file'

    if (!jobId || !candidateId || !candidateName || !candidateEmail || !resumeFile) {
      return res.status(400).json({ 
        error: 'Missing one or more required fields: jobId, candidateId, candidateName, candidateEmail, or resume file.' 
      });
    }

    // Validate file type on the backend using mimetype for reliability
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(resumeFile.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.' 
      });
    }

    // Generate a unique and secure filename
    const fileExt = path.extname(resumeFile.originalFilename);
    const fileName = `${candidateId}_${jobId}_${Date.now()}${fileExt}`;

    // Read the file from its temporary path to get the buffer for upload
    const fileBuffer = await fs.readFile(resumeFile.filepath);

    // Upload file to Supabase Storage using a dedicated service
    const uploadResult = await StorageService.uploadResume(fileName, fileBuffer, resumeFile.mimetype);
    
    // Clean up the temporary file created by formidable
    await fs.unlink(resumeFile.filepath);

    if (!uploadResult || !uploadResult.url) {
        throw new Error("Failed to upload resume to storage or get public URL.");
    }
    
    // The logic to create a candidate if they don't exist is a good fallback.
    // In a production app, you'd typically ensure the profile exists from the sign-up flow.
    try {
      await CandidatesService.getCandidateById(candidateId);
    } catch (error) {
        if (error.status === 404 || error.message.includes('Not found')) {
            console.log(`Candidate ${candidateId} not found, creating new profile.`);
            await CandidatesService.createCandidate({
                id: candidateId,
                full_name: candidateName,
                email: candidateEmail,
            });
        } else {
            // Re-throw other errors
            throw error;
        }
    }

    // Prepare data for the new application record in the database
    const applicationData = {
      job_id: jobId,
      candidate_id: candidateId,
      candidate_name: candidateName,
      candidate_email: candidateEmail,
      resume_url: uploadResult.url,
      status: 'Applied', // Set an initial status
    };

    const newApplication = await ApplicationsService.createApplication(applicationData);

    return res.status(201).json({
      success: true,
      application: newApplication,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('Error in /api/applications:', error);
    // Provide a generic but helpful error message to the client
    return res.status(500).json({ error: error.message || 'An internal server error occurred while processing your application.' });
  }
}
