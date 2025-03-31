
import { ClinikoApiResponse, ClinikoAppointment, ClinikoPatient, ClinikioPractitioner } from "@/types/clinikoTypes";

class ClinikoApiService {
  private baseUrl: string;
  private apiKey: string;
  private userAgent: string;
  private proxyUrl: string;
  
  constructor() {
    this.baseUrl = localStorage.getItem('cliniko_base_url') || 'https://api.au2.cliniko.com/v1';
    this.apiKey = localStorage.getItem('cliniko_api_key') || '';
    this.userAgent = localStorage.getItem('cliniko_user_agent') || 'ClinikoFollowUp (ryan@ryflow.com.au)';
    this.proxyUrl = '/api/cliniko'; // Our Vercel serverless function
  }

  updateCredentials(baseUrl: string, apiKey: string, userAgent: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.userAgent = userAgent;
    
    localStorage.setItem('cliniko_base_url', baseUrl);
    localStorage.setItem('cliniko_api_key', apiKey);
    localStorage.setItem('cliniko_user_agent', userAgent);
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  // TEST CONNECTION FUNCTION - We'll use this specifically for testing the API connection
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log("Testing connection with credentials:", {
        baseUrl: this.baseUrl,
        apiKeyLength: this.apiKey.length,
        userAgent: this.userAgent
      });
      
      // Use our proxy to test connection to Cliniko
      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          apiKey: this.apiKey,
          endpoint: 'practitioners',
          userAgent: this.userAgent
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Test Error:', response.status, errorData);
        
        return {
          success: false,
          message: `API request failed with status ${response.status}`,
          details: errorData
        };
      }
      
      const responseData = await response.json();
      const data = responseData.data;
      const practitionerCount = data._embedded && data._embedded.practitioners ? 
        data._embedded.practitioners.length : 0;
      
      return {
        success: true,
        message: `Successfully connected to Cliniko API. Found ${practitionerCount} practitioners.`
      };
    } catch (error) {
      console.error('Connection test error:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      };
    }
  }

  async fetchAllPages<T>(endpoint: string, resourceType: string, params?: Record<string, string>): Promise<T[]> {
    let allItems: T[] = [];
    let page = 1;
    let hasMorePages = true;
    
    try {
      while (hasMorePages) {
        console.log(`Fetching page ${page} of ${endpoint}`);
        
        // Include pagination in params
        const pageParams = { 
          ...(params || {}), 
          page: page.toString(),
        };
        
        const response = await fetch(this.proxyUrl, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            apiKey: this.apiKey,
            endpoint: endpoint,
            params: pageParams,
            userAgent: this.userAgent
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error:', response.status, errorData);
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const responseData = await response.json();
        const data = responseData.data as ClinikoApiResponse<T>;
        
        if (data._embedded && data._embedded[resourceType]) {
          allItems = [...allItems, ...data._embedded[resourceType]];
        }
        
        // Check if there's a next page
        hasMorePages = data._links && data._links.next ? true : false;
        page++;
        
        // Safety mechanism to avoid infinite loops
        if (page > 100) {
          console.warn('Reached maximum page limit (100). Stopping pagination.');
          break;
        }
      }
      
      return allItems;
    } catch (error) {
      console.error('Error in fetchAllPages:', error);
      throw error;
    }
  }

  async getPatients(): Promise<ClinikoPatient[]> {
    return this.fetchAllPages<ClinikoPatient>('patients', 'patients');
  }

  async getPatientAppointments(patientId: number): Promise<ClinikoAppointment[]> {
    return this.fetchAllPages<ClinikoAppointment>(
      `patients/${patientId}/appointments`, 
      'appointments'
    );
  }

  async getPractitioners(): Promise<ClinikioPractitioner[]> {
    return this.fetchAllPages<ClinikioPractitioner>(
      'practitioners',
      'practitioners'
    );
  }

  async getAllAppointments(params?: Record<string, string>): Promise<ClinikoAppointment[]> {
    return this.fetchAllPages<ClinikoAppointment>('individual_appointments', 'individual_appointments', params);
  }
}

export const clinikoApi = new ClinikoApiService();
