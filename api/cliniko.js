
// api/cliniko.js (Node 18 runtime)
export default async function handler(req, res) {
  // Set CORS headers if needed (for local dev or other domains)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    // Handle preflight (CORS) 
    return res.status(200).end();
  }

  // Check if this is a demo/example data request
  const { useExampleData, endpoint, params, apiKey, userAgent } = req.body;
  
  if (useExampleData) {
    return res.status(200).json({ 
      data: getMockData(endpoint)
    });
  }
  
  if (!apiKey) {
    return res.status(400).json({ error: "Missing API key" });
  }
  
  try {
    // Construct URL with endpoint and query parameters
    let url = `https://api.au2.cliniko.com/v1/${endpoint}`;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value?.toString() || '');
      });
      url = `${url}?${queryParams.toString()}`;
    }
    
    // Prepare Basic Auth header for Cliniko API
    const authHeader = 'Basic ' + Buffer.from(apiKey + ':').toString('base64');
    
    // Make request to Cliniko API
    console.log(`Making request to: ${url}`);
    const clinikoResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': authHeader,
        'User-Agent': userAgent || 'ClinikoFollowUp (ryan@ryflow.com.au)'
      }
    });
    
    if (!clinikoResponse.ok) {
      const errorData = await clinikoResponse.text();
      console.error(`Cliniko API error (${clinikoResponse.status}):`, errorData);
      
      return res.status(clinikoResponse.status).json({
        error: `Cliniko API returned ${clinikoResponse.status}`,
        details: errorData
      });
    }
    
    const data = await clinikoResponse.json();
    return res.status(200).json({ data });
  } catch (err) {
    console.error('Cliniko proxy error:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}

// Mock data function to provide example data for demonstration
function getMockData(endpoint) {
  if (endpoint === 'patients' || endpoint === 'patients/') {
    return {
      total_entries: 15,
      total_pages: 1,
      page: 1,
      per_page: 50,
      _embedded: {
        patients: [
          {
            id: 1001,
            first_name: "Sarah",
            last_name: "Johnson",
            created_at: "2023-01-15T10:30:00Z",
            updated_at: "2023-05-20T14:20:00Z",
            archived_at: null,
            patient_phone_numbers: [
              { id: 2001, number: "0412 345 678", phone_type: "Mobile", is_primary: true }
            ],
            links: { self: "/patients/1001", appointments: "/patients/1001/appointments" }
          },
          {
            id: 1002,
            first_name: "Michael",
            last_name: "Chen",
            created_at: "2022-11-03T09:45:00Z",
            updated_at: "2023-03-18T11:10:00Z",
            archived_at: null,
            patient_phone_numbers: [
              { id: 2002, number: "0423 456 789", phone_type: "Mobile", is_primary: true }
            ],
            links: { self: "/patients/1002", appointments: "/patients/1002/appointments" }
          },
          {
            id: 1003,
            first_name: "Emma",
            last_name: "Williams",
            created_at: "2023-02-22T15:20:00Z",
            updated_at: "2023-04-10T09:30:00Z",
            archived_at: null,
            patient_phone_numbers: [
              { id: 2003, number: "0434 567 890", phone_type: "Mobile", is_primary: true }
            ],
            links: { self: "/patients/1003", appointments: "/patients/1003/appointments" }
          },
          {
            id: 1004,
            first_name: "James",
            last_name: "Smith",
            created_at: "2022-10-11T13:15:00Z",
            updated_at: "2023-05-05T10:45:00Z",
            archived_at: null,
            patient_phone_numbers: [
              { id: 2004, number: "0445 678 901", phone_type: "Home", is_primary: true }
            ],
            links: { self: "/patients/1004", appointments: "/patients/1004/appointments" }
          },
          {
            id: 1005,
            first_name: "Olivia",
            last_name: "Brown",
            created_at: "2023-03-08T11:50:00Z",
            updated_at: "2023-06-12T16:25:00Z",
            archived_at: null,
            patient_phone_numbers: [
              { id: 2005, number: "0456 789 012", phone_type: "Mobile", is_primary: true }
            ],
            links: { self: "/patients/1005", appointments: "/patients/1005/appointments" }
          },
          {
            id: 1006,
            first_name: "Daniel",
            last_name: "Taylor",
            created_at: "2022-12-19T14:10:00Z",
            updated_at: "2023-04-28T09:15:00Z",
            archived_at: null,
            patient_phone_numbers: [
              { id: 2006, number: "0467 890 123", phone_type: "Mobile", is_primary: true }
            ],
            links: { self: "/patients/1006", appointments: "/patients/1006/appointments" }
          },
          {
            id: 1007,
            first_name: "Sophia",
            last_name: "Martinez",
            created_at: "2023-02-03T10:20:00Z",
            updated_at: "2023-05-15T13:40:00Z",
            archived_at: null,
            patient_phone_numbers: [],
            links: { self: "/patients/1007", appointments: "/patients/1007/appointments" }
          },
          {
            id: 1008,
            first_name: "William",
            last_name: "Lee",
            created_at: "2022-09-25T16:30:00Z",
            updated_at: "2023-03-30T11:05:00Z",
            archived_at: null,
            patient_phone_numbers: [
              { id: 2008, number: "0489 012 345", phone_type: "Mobile", is_primary: true }
            ],
            links: { self: "/patients/1008", appointments: "/patients/1008/appointments" }
          },
          {
            id: 1009,
            first_name: "Isabella",
            last_name: "Garcia",
            created_at: "2023-01-29T08:55:00Z",
            updated_at: "2023-06-02T15:50:00Z",
            archived_at: null,
            patient_phone_numbers: [
              { id: 2009, number: "0490 123 456", phone_type: "Mobile", is_primary: true }
            ],
            links: { self: "/patients/1009", appointments: "/patients/1009/appointments" }
          },
          {
            id: 1010,
            first_name: "Ethan",
            last_name: "Wilson",
            created_at: "2022-11-17T12:40:00Z",
            updated_at: "2023-04-03T10:25:00Z",
            archived_at: null,
            patient_phone_numbers: [
              { id: 2010, number: "0401 234 567", phone_type: "Work", is_primary: true }
            ],
            links: { self: "/patients/1010", appointments: "/patients/1010/appointments" }
          }
        ]
      },
      _links: {
        self: "/patients",
        next: null,
        previous: null
      }
    };
  } 
  
  // If requesting appointments for a specific patient
  if (endpoint.includes('appointments')) {
    const patientId = endpoint.split('/')[1]; // Extract patient ID from "patients/{id}/appointments"
    
    // Get current date for reference
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Create different mock appointment data based on patient ID
    let lastAppointmentDate;
    let futureDays = null;
    
    switch (parseInt(patientId)) {
      case 1001: // Sarah Johnson - has appointment 40 days ago
        lastAppointmentDate = new Date(now.getTime() - (40 * oneDay));
        break;
      case 1002: // Michael Chen - has appointment 65 days ago
        lastAppointmentDate = new Date(now.getTime() - (65 * oneDay));
        break;
      case 1003: // Emma Williams - has appointment 25 days ago and one scheduled
        lastAppointmentDate = new Date(now.getTime() - (25 * oneDay));
        futureDays = 5; // Appointment in 5 days
        break;
      case 1004: // James Smith - has appointment 95 days ago
        lastAppointmentDate = new Date(now.getTime() - (95 * oneDay));
        break;
      case 1005: // Olivia Brown - has appointment 35 days ago
        lastAppointmentDate = new Date(now.getTime() - (35 * oneDay));
        break;
      case 1006: // Daniel Taylor - has appointment 85 days ago
        lastAppointmentDate = new Date(now.getTime() - (85 * oneDay));
        break;
      case 1007: // Sophia Martinez - has appointment 45 days ago
        lastAppointmentDate = new Date(now.getTime() - (45 * oneDay));
        break;
      case 1008: // William Lee - has appointment 110 days ago
        lastAppointmentDate = new Date(now.getTime() - (110 * oneDay));
        break;
      case 1009: // Isabella Garcia - has appointment 75 days ago
        lastAppointmentDate = new Date(now.getTime() - (75 * oneDay));
        break;
      case 1010: // Ethan Wilson - has appointment 55 days ago and one scheduled
        lastAppointmentDate = new Date(now.getTime() - (55 * oneDay));
        futureDays = 10; // Appointment in 10 days
        break;
      default:
        lastAppointmentDate = new Date(now.getTime() - (30 * oneDay));
    }
    
    const appointments = [
      {
        id: parseInt(patientId) + 5000,
        created_at: lastAppointmentDate.toISOString().split('T')[0] + "T09:00:00Z",
        updated_at: lastAppointmentDate.toISOString().split('T')[0] + "T09:30:00Z",
        starts_at: lastAppointmentDate.toISOString().split('T')[0] + "T10:00:00Z",
        ends_at: lastAppointmentDate.toISOString().split('T')[0] + "T10:30:00Z",
        cancelled_at: null,
        did_not_arrive: false,
        notes: "Regular checkup",
        patient: { id: parseInt(patientId), links: { self: `/patients/${patientId}` } },
        practitioner: { id: 101, links: { self: "/practitioners/101" } },
        business: { id: 1, links: { self: "/businesses/1" } },
        links: { self: `/appointments/${parseInt(patientId) + 5000}` }
      }
    ];
    
    // Add future appointment if specified
    if (futureDays !== null) {
      const futureDate = new Date(now.getTime() + (futureDays * oneDay));
      appointments.push({
        id: parseInt(patientId) + 6000,
        created_at: now.toISOString().split('T')[0] + "T09:00:00Z",
        updated_at: now.toISOString().split('T')[0] + "T09:30:00Z",
        starts_at: futureDate.toISOString().split('T')[0] + "T14:00:00Z",
        ends_at: futureDate.toISOString().split('T')[0] + "T14:30:00Z",
        cancelled_at: null,
        did_not_arrive: false,
        notes: "Follow-up appointment",
        patient: { id: parseInt(patientId), links: { self: `/patients/${patientId}` } },
        practitioner: { id: 101, links: { self: "/practitioners/101" } },
        business: { id: 1, links: { self: "/businesses/1" } },
        links: { self: `/appointments/${parseInt(patientId) + 6000}` }
      });
    }
    
    return {
      total_entries: appointments.length,
      total_pages: 1,
      page: 1,
      per_page: 50,
      _embedded: {
        appointments: appointments
      },
      _links: {
        self: endpoint,
        next: null,
        previous: null
      }
    };
  }
  
  // Default fallback for other endpoints
  return {
    total_entries: 0,
    total_pages: 0,
    page: 1,
    per_page: 50,
    _embedded: {},
    _links: {
      self: endpoint,
      next: null,
      previous: null
    }
  };
}
