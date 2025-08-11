// import { supabase } from '../../lib/supabaseClient';
// FIX: Updated the import path for PDFLoader
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

// This function fetches a file from a public Supabase URL and returns its content as a Buffer
async function fetchFileContent(fileUrl) {
    const response = await fetch(fileUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { fileUrl } = req.body;

    if (!fileUrl) {
        return res.status(400).json({ error: 'File URL is required' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
    }

    try {
        // 1. Fetch the file content from the Supabase URL
        const fileBuffer = await fetchFileContent(fileUrl);
        const blob = new Blob([fileBuffer], { type: 'application/pdf' });
        
        // 2. Use a document loader to extract text from the PDF
        const loader = new PDFLoader(blob);
        const docs = await loader.load();
        const jdText = docs.map(doc => doc.pageContent).join('\n');

        // 3. Construct the prompt for the Gemini API
        const prompt = `
            Based on the following job description text, extract the information and respond with ONLY a valid JSON object.
            Do not include any text before or after the JSON.
            The JSON object must contain these exact keys: "title", "department", "location", "description", "responsibilities" (as an array of strings), "requirements" (as an array of strings), "experience_years", "salary", and "job_type".

            Job Description Text:
            ---
            ${jdText}
            ---
        `;

        // 4. Call the Gemini API
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
        };

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
        
        // Clean the response to ensure it's valid JSON
        const jsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(jsonText);

        res.status(200).json(parsedData);

    } catch (error) {
        console.error('Error parsing JD:', error);
        res.status(500).json({ error: error.message || 'Failed to parse job description.' });
    }
}
