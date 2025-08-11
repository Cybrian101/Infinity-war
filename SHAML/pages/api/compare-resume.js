// /pages/api/compare-resume.js
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
// import { Database } from '../../lib/database'; // If not used, consider removing

export const config = {
  api: {
    bodyParser: false,
  },
};

async function extractTextFromPdf(filePath) {
  try {
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    return `Resume file: ${path.basename(filePath)}`;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await form.parse(req);
    const jobDescription = fields.jobDescription?.[0];
    const resumeFiles = files.resumes || [];

    if (!jobDescription || !resumeFiles.length) {
      return res.status(400).json({
        error: 'Missing job description or resume files',
      });
    }

    const jdText = jobDescription;

    const resumesText = await Promise.all(
      (Array.isArray(resumeFiles) ? resumeFiles : [resumeFiles]).map(async (file) => ({
        name: file.originalFilename || file.newFilename,
        content: await extractTextFromPdf(file.filepath),
      }))
    );

    const analysisPrompt = `
As an expert recruitment AI, analyze the following job description and resumes. 
For each resume, provide a detailed analysis based on the job description.

Respond with ONLY a valid JSON object. Do not include any text before or after the JSON.

The JSON object must have a key "candidate_rankings", which is an array of objects. Each object must contain:
- "full_name": string
- "email": string (generate a realistic email based on the name)
- "match_percentage": number (0-100)
- "extracted_skills": array of strings (top 5 relevant skills)
- "years_of_experience": number
- "candidate_strengths": string (brief summary)
- "reason_for_match_score": string (brief explanation)
- "id": string (generate a unique ID)
- "role": string (inferred job role from resume)
- "resumeUrl": string (use the filename)
- "keyStrengths": array of strings (2-3 key strengths)
- "aiSuggestions": array of strings (2-3 AI suggestions for improvement)
- "experience": string (brief experience summary)

Job Description:
---
${jdText}
---

Resumes:
---
${resumesText.map(r => `Resume File: ${r.name}\n${r.content}`).join('\n---\n')}
---
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Gemini API key not configured',
      });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 4000,
      },
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', response.status, errorText);
      return res.status(500).json({
        error: `Gemini API Error: ${response.status} ${response.statusText}`,
      });
    }

    const result = await response.json();
    const analysisText = result.candidates[0].content.parts[0].text;

    let analysisJson;
    try {
      analysisJson = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return res.status(500).json({
        error: 'Failed to parse AI response',
      });
    }

    if (analysisJson.candidate_rankings) {
      analysisJson.candidate_rankings.sort(
        (a, b) => b.match_percentage - a.match_percentage
      );

      analysisJson.candidate_rankings = analysisJson.candidate_rankings.map((candidate, index) => ({
        id: candidate.id || `candidate_${index + 1}`,
        name: candidate.full_name || `Candidate ${index + 1}`,
        email: candidate.email || `candidate${index + 1}@example.com`,
        role: candidate.role || 'Software Developer',
        resumeUrl: candidate.resumeUrl || resumesText[index]?.name || 'resume.pdf',
        matchScore: candidate.match_percentage || 0,
        skills: candidate.extracted_skills || [],
        keyStrengths:
          candidate.keyStrengths || candidate.candidate_strengths
            ? [candidate.candidate_strengths]
            : [],
        aiSuggestions:
          candidate.aiSuggestions || [
            'Continue developing technical skills',
            'Gain more industry experience',
          ],
        experience:
          candidate.experience ||
          candidate.reason_for_match_score ||
          'Relevant experience for the role',
        yearsOfExperience: candidate.years_of_experience || 0,
      }));
    }

    const allFiles = Array.isArray(resumeFiles) ? resumeFiles : [resumeFiles];
    allFiles.forEach((file) => {
      try {
        fs.unlinkSync(file.filepath);
      } catch (cleanupError) {
        console.warn('File cleanup error:', cleanupError);
      }
    });

    const topCandidates = analysisJson.candidate_rankings?.slice(0, 3) || [];

    return res.status(200).json({
      success: true,
      candidates: topCandidates,
      totalAnalyzed: resumesText.length,
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}
