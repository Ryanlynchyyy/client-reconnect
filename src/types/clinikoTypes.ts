
export interface ClinikoPatient {
  id: number;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  patient_phone_numbers?: ClinikoPhoneNumber[];
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
  notes: string | null;
  patient: {
    id: number;
    links: { self: string };
  };
  practitioner: {
    id: number;
    links: { self: string };
  };
  business: {
    id: number;
    links: { self: string };
  };
  links: {
    self: string;
  }
}

export interface ClinikioPractitioner {
  id: number;
  created_at: string;
  updated_at: string;
  title: string | null;
  first_name: string;
  last_name: string;
  archived_at: string | null;
  designation: string | null;
  show_in_online_bookings: boolean;
  label: string;
  links: {
    self: string;
    appointments: string;
  }
}

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
    next?: string;
    previous?: string;
  };
}

export interface PatientWithFollowUpStatus extends ClinikoPatient {
  lastAppointmentDate: string | null;
  daysSinceLastAppointment: number | null;
  followUpStatus: 'pending' | 'dismissed' | 'contacted';
  hasFutureAppointment: boolean;
  assignedPractitionerId?: number;
  assignedPractitionerName?: string;
}
