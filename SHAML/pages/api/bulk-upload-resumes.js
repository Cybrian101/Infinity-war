import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs/promises';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import os from 'os';
import path from 'path';

// Secure, server-side Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Disable Next.js's default body parser to allow formidable to handle file streams
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to extract text from a file buffer
async function getResumeTextFromBuffer(fileBuffer, originalFilename) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bulk-resume-'));
  const tempFilePath = path.join(tempDir, originalFilename);
  await fs.writeFile(tempFilePath, fileBuffer);

  let loader;
  if (originalFilename.toLowerCase().endsWith('.pdf')) {
    loader = new PDFLoader(tempFilePath);
  } else if (originalFilename.toLowerCase().endsWith('.docx')) {
    loader = new DocxLoader(tempFilePath);
  } else {
    await fs.rm(tempDir, { recursive: true, force: true });
    throw new Error('Unsupported file type.');
  }

  const docs = await loader.load();
  await fs.rm(tempDir, { recursive: true, force: true });
  return docs.map(doc => doc.pageContent).join('\n\n');
}

// Main API handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = formidable({ multiples: true });

  try {
    const [fields, files] = await form.parse(req);
    
    // FIX: The 'jobId' from formidable is an array. We need to extract the first element.
    const jobId = fields.jobId?.[0];
    const resumeFiles = files.resumes;

    if (!jobId || !resumeFiles || resumeFiles.length === 0) {
      return res.status(400).json({ error: 'Missing job ID or resume files.' });
    }

    const processingPromises = resumeFiles.map(async (file) => {
      try {
        // 1. Upload resume to Supabase Storage
        const fileBuffer = await fs.readFile(file.filepath);
        const fileName = `${jobId}_${Date.now()}_${file.originalFilename}`;
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('resumes')
          .upload(`public/${fileName}`, fileBuffer, {
            contentType: file.mimetype,
          });

        if (uploadError) throw new Error(`Storage Error: ${uploadError.message}`);

        const { data: urlData } = supabaseAdmin.storage.from('resumes').getPublicUrl(uploadData.path);
        const resumeUrl = urlData.publicUrl;

        // 2. Extract text for AI parsing
        const resumeText = await getResumeTextFromBuffer(fileBuffer, file.originalFilename);

        // 3. Use AI to parse name and email
        const prompt = `
          Analyze the following resume text and extract the candidate's full name and their primary email address.
          Respond with ONLY a valid JSON object with two keys: "name" and "email".

          Resume Text:
          ---
          ${resumeText}
          ---
        `;

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const payload = { contents: [{ parts: [{ text: prompt }] }] };
        const apiResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!apiResponse.ok) throw new Error('Failed to parse resume with AI.');
        
        const result = await apiResponse.json();
        const rawText = result.candidates[0].content.parts[0].text;
        const jsonMatch = rawText.match(/\{[\s\S]*?\}/);
        const parsedInfo = JSON.parse(jsonMatch[0]);

        // 4. Create application record in the database
        const { error: insertError } = await supabaseAdmin.from('applications').insert({
          job_id: jobId, // Now using the corrected jobId string
          candidate_name: parsedInfo.name || 'Unknown',
          candidate_email: parsedInfo.email || 'unknown@example.com',
          resume_url: resumeUrl,
          status: 'Sourced', // Custom status for bulk uploads
        });

        if (insertError) throw new Error(`Database Error: ${insertError.message}`);

        return { success: true, fileName: file.originalFilename };
      } catch (error) {
        console.error(`Failed to process file ${file.originalFilename}:`, error);
        return { success: false, fileName: file.originalFilename, error: error.message };
      }
    });

    const results = await Promise.all(processingPromises);
    res.status(200).json({ results });

  } catch (error) {
    console.error('Error in bulk upload API:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
}
