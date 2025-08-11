import { createClient } from '@supabase/supabase-js';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

// --- Secure, Server-Side Supabase Client ---
// FIX: Create a new Supabase client using the SERVICE_ROLE_KEY.
// This is essential for a backend API to bypass Row-Level Security (RLS)
// and read all the necessary application and job data for analysis.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Helper to fetch and read a resume file from Supabase Storage
async function getResumeText(resumeUrl) {
  try {
    const response = await fetch(resumeUrl);
    if (!response.ok) throw new Error(`Failed to fetch resume: ${response.statusText}`);
    
    const fileBuffer = Buffer.from(await response.arrayBuffer());
    // Create a temporary directory to safely handle the file
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'resume-'));
    const tempFilePath = path.join(tempDir, path.basename(new URL(resumeUrl).pathname));
    await fs.writeFile(tempFilePath, fileBuffer);

    let loader;
    if (resumeUrl.toLowerCase().endsWith('.pdf')) {
      loader = new PDFLoader(tempFilePath);
    } else if (resumeUrl.toLowerCase().endsWith('.docx')) {
      loader = new DocxLoader(tempFilePath);
    } else {
      // Clean up even if the file type is unsupported
      await fs.rm(tempDir, { recursive: true, force: true });
      throw new Error('Unsupported file type.');
    }

    const docs = await loader.load();
    await fs.rm(tempDir, { recursive: true, force: true }); // Cleanup
    return docs.map(doc => doc.pageContent).join('\n\n');
  } catch (error) {
    console.error(`Error processing resume from ${resumeUrl}:`, error);
    return null; // Return null if a single resume fails, so others can still be processed
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { jobId } = req.body;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!jobId || !geminiApiKey) {
    return res.status(400).json({ error: 'Missing jobId or Gemini API key.' });
  }

  try {
    // 1. Fetch job details and applications using the secure admin client
    const { data: job, error: jobError } = await supabaseAdmin.from('jobs').select('*').eq('id', jobId).single();
    if (jobError) throw jobError;

    const { data: applications, error: appError } = await supabaseAdmin.from('applications').select('*').eq('job_id', jobId);
    if (appError) throw appError;

    if (!applications || applications.length === 0) {
      // This is the case that was likely being hit before the fix
      return res.status(200).json({ topCandidates: [] });
    }

    // 2. Extract text from each resume
    const resumesData = await Promise.all(
      applications.map(async (app) => ({
        ...app,
        resumeText: await getResumeText(app.resume_url),
      }))
    );
    
    const validResumes = resumesData.filter(r => r.resumeText);

    if (validResumes.length === 0) {
        return res.status(200).json({ topCandidates: [], message: "No valid resumes could be processed." });
    }

    // 3. Prepare the detailed prompt for Gemini
    const prompt = `
      You are an expert AI hiring assistant. Your task is to analyze the following resumes and rank the top 3 candidates for the position of "${job.title}".

      JOB DESCRIPTION:
      ---
      ${job.description}
      Requirements: ${job.requirements.join(', ')}
      ---

      CANDIDATE RESUMES:
      ---
      ${validResumes.map((r, i) => `
        CANDIDATE ${i + 1} (ID: ${r.candidate_id}):
        Name: ${r.candidate_name}
        Email: ${r.candidate_email}
        Resume Content: ${r.resumeText}
      `).join('\n---\n')}
      ---

      Based on the job description, analyze each candidate's skills, experience, and qualifications.
      Respond with ONLY a valid JSON array of the top 3 candidates. Each object in the array should have the following keys:
      - "candidateId": The ID of the candidate.
      - "name": The name of the candidate.
      - "email": The email of the candidate.
      - "matchScore": An integer from 0 to 100 representing the candidate's match to the job.
      - "summary": A brief, one-sentence summary explaining why they are a good match.
      - "skills": An array of the candidate's top 5 skills relevant to the job.
      - "keyStrengths": An array of 2-3 key strengths or qualifications.
      - "aiSuggestions": An array of 2-3 suggested interview questions or points to discuss.
    `;

    // 4. Call the Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      throw new Error(`Gemini API Error: ${errorBody}`);
    }

    const result = await apiResponse.json();
    const rawText = result.candidates[0].content.parts[0].text;
    const jsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const topCandidates = JSON.parse(jsonText);

    // 5. Add the resume URL back to the candidate objects for the frontend
    const finalCandidates = topCandidates.map(tc => {
        const originalApp = applications.find(app => app.candidate_id === tc.candidateId);
        return { ...tc, resumeUrl: originalApp?.resume_url };
    });

    res.status(200).json({ topCandidates: finalCandidates });

  } catch (error) {
    console.error('Error in match-candidates API:', error);
    res.status(500).json({ error: error.message || 'Failed to match candidates.' });
  }
}
