export interface ClinikoApiResponse<T> {
  total_entries: number;
  total_pages: number;
  page: number;
  per_page: number;
  _embedded: {
    [key: string]: T[];
  };
  _links: {
    self: string;
    next: string | null;
    previous: string | null;
  };
}

export interface ClinikoPatient {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  email?: string;
  patient_phone_numbers?: ClinikoPhoneNumber[];
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  links: {
    self: string;
    appointments: string;
  };
}

export interface ClinikoPhoneNumber {
  id: number;
  number: string;
  phone_type: string;
  is_primary: boolean;
}

export interface ClinikoAppointment {
  id: number;
  created_at: string;
  updated_at: string;
  starts_at: string;
  ends_at: string;
  cancelled_at: string | null;
  did_not_arrive: boolean;
  notes: string;
  patient: {
    id: number;
    links: {
      self: string;
    };
  };
  practitioner: {
    id: number;
    links: {
      self: string;
    };
  };
  business: {
    id: number;
    links: {
      self: string;
    };
  };
  links: {
    self: string;
  };
}

export interface ClinikioPractitioner {
  id: number;
  first_name: string;
  last_name: string;
  nickname: string | null;
  email: string;
  phone_number: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  links: {
    self: string;
  };
}

export interface PatientWithFollowUpStatus extends ClinikoPatient {
  lastAppointmentDate: string | null;
  daysSinceLastAppointment: number | null;
  followUpStatus: 'pending' | 'dismissed' | 'contacted';
  hasFutureAppointment: boolean;
  assignedPractitionerId?: number;
  // Added fields
  treatmentNotes?: string | null;
  reminderDate?: string | null;
}
