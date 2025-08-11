// This is a serverless function that will generate AI-powered insights.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    return res.status(500).json({ error: 'Gemini API key is not configured.' });
  }

  try {
    const { stats } = req.body;

    // Create a human-readable summary of the stats for the AI prompt
    const statsSummary = `
      - Total Active Jobs: ${stats.totalJobs}
      - Total Applications Received: ${stats.totalApplications}
      - Average Candidate Match Score: ${stats.avgMatchScore}%
      - Job distribution by department: ${JSON.stringify(stats.jobsByDepartment)}
      - Application distribution by status: ${JSON.stringify(stats.applicationsByStatus)}
    `;

    const prompt = `
      You are an expert HR analyst. Based on the following hiring data, provide a brief, 
      2-3 sentence summary of the current hiring situation. Focus on actionable insights.
      For example, mention which departments are most active or if there is a bottleneck 
      in the application review process.

      Data:
      ${statsSummary}

      Analysis:
    `;

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
      const errorBody = await apiResponse.text();
      throw new Error(`Gemini API Error: ${errorBody}`);
    }

    const result = await apiResponse.json();
    const summary = result.candidates[0].content.parts[0].text;

    res.status(200).json({ summary });

  } catch (error) {
    console.error('Error generating AI summary:', error);
    res.status(500).json({ error: error.message || 'Failed to generate summary.' });
  }
}
