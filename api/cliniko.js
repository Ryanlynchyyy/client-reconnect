
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { apiKey, endpoint = "practitioners", params = {} } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: "Missing API key" });
  }

  const auth = Buffer.from(apiKey + ":").toString("base64");
  let url = `https://api.au2.cliniko.com/v1/${endpoint}`;
  
  // Add URL parameters if provided
  if (Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      searchParams.append(key, value);
    }
    url += `?${searchParams.toString()}`;
  }

  try {
    console.log(`Proxy request to: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        "Authorization": `Basic ${auth}`,
        "User-Agent": req.body.userAgent || "ClinikoFollowUp (ryan@ryflow.com.au)",
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
    });

    const data = await response.json();
    return res.status(response.status).json({
      status: response.status,
      data: data
    });
  } catch (err) {
    console.error("Error hitting Cliniko:", err);
    return res.status(500).json({ 
      error: "Failed to fetch from Cliniko", 
      details: err.message 
    });
  }
}
