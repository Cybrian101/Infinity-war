import formidable from 'formidable';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import fs from 'fs';

// This tells Next.js not to parse the body, so formidable can handle the file stream
export const config = {
    api: {
        bodyParser: false,
    },
};

// Helper to parse form data (file uploads)
async function parseForm(req) {
    return new Promise((resolve, reject) => {
        const form = formidable({});
        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
        });
    });
}

// Helper to fetch a file from a URL
async function fetchFileContent(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    try {
        const { fields, files } = await parseForm(req);
        const resumeFile = files.resume?.[0];
        const resumeUrl = fields.url?.[0];

        if (!resumeFile && !resumeUrl) {
            return res.status(400).json({ error: 'No resume file or URL was provided.' });
        }

        let fileBuffer;
        let fileType;

        if (resumeFile) {
            fileBuffer = fs.readFileSync(resumeFile.filepath);
            fileType = resumeFile.mimetype;
            fs.unlinkSync(resumeFile.filepath); // Clean up temp file
        } else { // Handle URL
            fileBuffer = await fetchFileContent(resumeUrl);
            // Attempt to determine file type from URL extension
            if (resumeUrl.endsWith('.pdf')) fileType = 'application/pdf';
            else if (resumeUrl.endsWith('.docx')) fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            else if (resumeUrl.endsWith('.doc')) fileType = 'application/msword';
            else {
                // Fallback or throw error if type can't be determined
                throw new Error("Could not determine file type from URL.");
            }
        }
        
        const blob = new Blob([fileBuffer]);
        let loader;

        // Use the correct loader based on the file type
        if (fileType === 'application/pdf') {
            loader = new PDFLoader(blob);
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileType === 'application/msword') {
            loader = new DocxLoader(blob);
        } else {
            throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
        }

        const docs = await loader.load();
        const resumeText = docs.map(doc => doc.pageContent).join('\n');

        if (resumeText.trim().length < 100) {
             return res.status(400).json({ isValid: false, reason: "The document contains very little text." });
        }

        const prompt = `
            Analyze the following text to determine if it is a professional resume.
            Respond with ONLY a valid JSON object with two keys:
            1. "is_resume": a boolean (true if it's a resume, false otherwise).
            2. "reason": a brief, one-sentence explanation for your decision.

            Text to analyze:
            ---
            ${resumeText}
            ---
        `;

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;
        const payload = { contents: [{ parts: [{ text: prompt }] }] };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.json();
            throw new Error(`Gemini API Error: ${errorBody.error.message}`);
        }

        const result = await apiResponse.json();
        const rawText = result.candidates[0].content.parts[0].text;
        const jsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const validationResult = JSON.parse(jsonText);

        res.status(200).json(validationResult);

    } catch (error) {
        console.error('Error validating resume:', error);
        res.status(500).json({ error: error.message || 'Failed to validate resume.' });
    }
}
