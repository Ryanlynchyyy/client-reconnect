// api/cliniko.js (Node 18 runtime)
export default async function handler(req, res) {
  // Set CORS headers if needed (for local dev or other domains):
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    // Handle preflight (CORS) 
    return res.status(200).end();
  }

  // Prepare Basic Auth header for Cliniko API
  const apiKey = process.env.CLINIKO_API_KEY;  // (Store your Cliniko API key in Vercel env)
  const authHeader = 'Basic ' + Buffer.from(apiKey + ':').toString('base64');
  
  // Forward the request to Cliniko API
  try {
    const clinikoResponse = await fetch('https://api.cliniko.com/v1/your-endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authHeader
      },
      body: req.body
    });
    const data = await clinikoResponse.json();
    res.status(clinikoResponse.status).json(data);
  } catch (err) {
    console.error('Cliniko proxy error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
