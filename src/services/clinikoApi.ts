
import { ClinikoApiResponse, ClinikoAppointment, ClinikoPatient, ClinikioPractitioner } from "@/types/clinikoTypes";

class ClinikoApiService {
  private baseUrl: string;
  private apiKey: string;
  private userAgent: string;
  
  constructor() {
    this.baseUrl = localStorage.getItem('cliniko_base_url') || 'https://api.au2.cliniko.com/v1';
    this.apiKey = localStorage.getItem('cliniko_api_key') || '';
    this.userAgent = localStorage.getItem('cliniko_user_agent') || 'ClinikoFollowUp (ryan@ryflow.com.au)';
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
    // Properly format the API key for Basic Auth - Key: followed by empty password
    const encodedKey = btoa(`${this.apiKey}:`);
    
    return {
      'Authorization': `Basic ${encodedKey}`,
      'User-Agent': this.userAgent,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  async fetchAllPages<T>(url: string, resourceType: string): Promise<T[]> {
    let nextUrl = url;
    let allItems: T[] = [];
    
    try {
      while (nextUrl) {
        console.log(`Fetching: ${nextUrl}`);
        
        const response = await fetch(nextUrl, {
          method: 'GET',
          headers: this.getHeaders(),
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
        
        const data = await response.json() as ClinikoApiResponse<T>;
        
        if (data._embedded && data._embedded[resourceType]) {
          allItems = [...allItems, ...data._embedded[resourceType]];
        }
        
        nextUrl = data._links && data._links.next ? data._links.next : '';
      }
      
      return allItems;
    } catch (error) {
      console.error('Error in fetchAllPages:', error);
      throw error;
    }
  }

  async getPatients(): Promise<ClinikoPatient[]> {
    return this.fetchAllPages<ClinikoPatient>(`${this.baseUrl}/patients`, 'patients');
  }

  async getPatientAppointments(patientId: number): Promise<ClinikoAppointment[]> {
    return this.fetchAllPages<ClinikoAppointment>(
      `${this.baseUrl}/patients/${patientId}/appointments`, 
      'appointments'
    );
  }

  async getPractitioners(): Promise<ClinikioPractitioner[]> {
    return this.fetchAllPages<ClinikioPractitioner>(
      `${this.baseUrl}/practitioners`,
      'practitioners'
    );
  }

  async getAllAppointments(params?: URLSearchParams): Promise<ClinikoAppointment[]> {
    let url = `${this.baseUrl}/individual_appointments`;
    if (params) {
      url += `?${params.toString()}`;
    }
    return this.fetchAllPages<ClinikoAppointment>(url, 'individual_appointments');
  }
}

export const clinikoApi = new ClinikoApiService();
