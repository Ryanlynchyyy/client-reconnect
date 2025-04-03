import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { PatientWithFollowUpStatus, ClinikoAppointment, ClinikoPatient, ClinikioPractitioner } from '@/types/clinikoTypes';
import { clinikoApi } from '@/services/clinikoApi';
import { useToast } from '@/hooks/use-toast';
import { getMockData } from '@/data/mockData';

interface FollowUpContextType {
  patients: PatientWithFollowUpStatus[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  dismissPatient: (patientId: number) => void;
  markAsContacted: (patientId: number) => void;
  filterDays: number;
  setFilterDays: (days: number) => void;
  filteredPatients: PatientWithFollowUpStatus[];
  remindLater: (patientId: number, days: number) => void;
  practitioners: ClinikioPractitioner[];
  selectedPractitionerId: number | null;
  setSelectedPractitionerId: (id: number | null) => void;
}

const FollowUpContext = createContext<FollowUpContextType | undefined>(undefined);

export const FollowUpProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<PatientWithFollowUpStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDays, setFilterDays] = useState<number>(30);
  const [practitioners, setPractitioners] = useState<ClinikioPractitioner[]>([]);
  const [selectedPractitionerId, setSelectedPractitionerId] = useState<number | null>(null);
  const { toast } = useToast();

  const filteredPatients = React.useMemo(() => {
    return patients.filter(patient => {
      // Filter by practitioner if one is selected
      if (selectedPractitionerId !== null && patient.assignedPractitionerId !== selectedPractitionerId) {
        return false;
      }
      
      if (patient.hasFutureAppointment) return false;
      
      // Check if patient has a pending reminder
      const reminderDate = patient.reminderDate ? new Date(patient.reminderDate) : null;
      const now = new Date();
      if (reminderDate && reminderDate > now) return false;
      
      return patient.daysSinceLastAppointment !== null && 
             patient.daysSinceLastAppointment >= filterDays;
    });
  }, [patients, filterDays, selectedPractitionerId]);

  const mockTreatmentNotes = [
    "Lower back pain treatment",
    "Shoulder rehabilitation",
    "Sports injury assessment",
    "Neck and upper back treatment",
    "Post-surgery rehabilitation",
    "Chronic pain management",
    "Posture assessment and correction"
  ];

  const mockPractitioners = [
    { id: 1, first_name: "Ben", last_name: "Smith", nickname: null, email: "ben@clinic.com", phone_number: null, image_url: null, created_at: "", updated_at: "", links: { self: "" } },
    { id: 2, first_name: "Josh", last_name: "Adams", nickname: null, email: "josh@clinic.com", phone_number: null, image_url: null, created_at: "", updated_at: "", links: { self: "" } }
  ];

  const loadExampleData = async () => {
    try {
      console.log('Loading example data directly from mock data');
      
      const patientResponse = getMockData('patients');
      const patients = patientResponse._embedded.patients as ClinikoPatient[];
      
      const processedPatients = await Promise.all(patients.map(async (patient, index) => {
        const appointmentData = getMockData(`patients/${patient.id}/appointments`);
        const appointments = appointmentData._embedded.appointments as ClinikoAppointment[];
        
        appointments.sort(
          (a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
        );
        
        const now = new Date();
        
        const hasFutureAppointment = appointments.some(
          app => new Date(app.starts_at) > now
        );
        
        const lastAppointment = appointments.find(
          app => new Date(app.starts_at) <= now
        );
        
        let lastAppointmentDate: string | null = null;
        let daysSinceLastAppointment: number | null = null;
        let assignedPractitionerId: number | undefined;
        let practitionerName: string | null = null;
        
        if (lastAppointment) {
          lastAppointmentDate = lastAppointment.starts_at;
          const lastDate = new Date(lastAppointment.starts_at);
          daysSinceLastAppointment = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Assign a practitioner ID (alternating between 1 and 2 for mock data)
          assignedPractitionerId = index % 2 === 0 ? 1 : 2;
          const practitioner = mockPractitioners.find(p => p.id === assignedPractitionerId);
          if (practitioner) {
            practitionerName = `${practitioner.first_name} ${practitioner.last_name}`;
          }
        }
        
        const followUpStatus = Math.random() < 0.8 ? 'pending' : 'contacted';
        
        // Add mock treatment notes
        const treatmentNotes = mockTreatmentNotes[Math.floor(Math.random() * mockTreatmentNotes.length)];
        
        return {
          ...patient,
          lastAppointmentDate,
          daysSinceLastAppointment,
          followUpStatus: followUpStatus as 'pending' | 'dismissed' | 'contacted',
          hasFutureAppointment,
          assignedPractitionerId,
          practitionerName,
          treatmentNotes,
          reminderDate: null
        };
      }));
      
      setPatients(processedPatients);
      setPractitioners(mockPractitioners);
      setError(null);
    } catch (err) {
      console.error('Failed to load example data:', err);
      setError('Failed to load example data. Try again or check your API settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const processPatientData = async (patients: ClinikoPatient[]): Promise<PatientWithFollowUpStatus[]> => {
    const now = new Date();
    const followUpStatuses = JSON.parse(localStorage.getItem('followup_statuses') || '{}');
    const reminderDates = JSON.parse(localStorage.getItem('reminder_dates') || '{}');
    
    const processedPatients: PatientWithFollowUpStatus[] = [];
    const practitioners = await clinikoApi.getPractitioners();
    
    for (const patient of patients) {
      try {
        const appointments = await clinikoApi.getPatientAppointments(patient.id);
        
        const validAppointments = appointments.filter(
          app => !app.cancelled_at && !app.did_not_arrive
        );
        
        validAppointments.sort(
          (a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
        );
        
        const hasFutureAppointment = validAppointments.some(
          app => new Date(app.starts_at) > now
        );
        
        const lastAppointment = validAppointments.find(
          app => new Date(app.starts_at) <= now
        );
        
        let lastAppointmentDate: string | null = null;
        let daysSinceLastAppointment: number | null = null;
        let assignedPractitionerId: number | undefined;
        let practitionerName: string | null = null;
        let treatmentNotes: string | null = null;
        
        if (lastAppointment) {
          lastAppointmentDate = lastAppointment.starts_at;
          const lastDate = new Date(lastAppointment.starts_at);
          daysSinceLastAppointment = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          assignedPractitionerId = lastAppointment.practitioner.id;
          
          // Find practitioner name
          const practitioner = practitioners.find(p => p.id === assignedPractitionerId);
          if (practitioner) {
            practitionerName = `${practitioner.first_name} ${practitioner.last_name}`;
          }
          
          // Extract treatment notes from appointment notes
          treatmentNotes = lastAppointment.notes || null;
        }
        
        const savedStatus = followUpStatuses[patient.id] || 'pending';
        const reminderDate = reminderDates[patient.id] || null;
        
        processedPatients.push({
          ...patient,
          lastAppointmentDate,
          daysSinceLastAppointment,
          followUpStatus: savedStatus,
          hasFutureAppointment,
          assignedPractitionerId,
          practitionerName,
          treatmentNotes,
          reminderDate
        });
      } catch (err) {
        console.error(`Error processing patient ${patient.id}:`, err);
      }
    }
    
    return processedPatients;
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!localStorage.getItem('cliniko_api_key')) {
        console.log('No API key found, loading example data instead');
        await loadExampleData();
        return;
      }
      
      const patients = await clinikoApi.getPatients();
      const practitioners = await clinikoApi.getPractitioners();
      
      const processedPatients = await processPatientData(patients);
      
      setPatients(processedPatients);
      setPractitioners(practitioners);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load patient data. Check your API settings and try again.');
      
      console.log('Falling back to example data');
      await loadExampleData();
      
      toast({
        title: "Using example data",
        description: "Could not connect to Cliniko API. Showing example data instead.",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFollowUpStatus = (patientId: number, status: 'pending' | 'dismissed' | 'contacted') => {
    const statuses = JSON.parse(localStorage.getItem('followup_statuses') || '{}');
    statuses[patientId] = status;
    localStorage.setItem('followup_statuses', JSON.stringify(statuses));
    
    setPatients(patients.map(p => 
      p.id === patientId ? { ...p, followUpStatus: status } : p
    ));
  };

  const dismissPatient = (patientId: number) => {
    updateFollowUpStatus(patientId, 'dismissed');
    toast({
      title: "Patient dismissed",
      description: "This patient has been removed from the follow-up list.",
    });
  };

  const markAsContacted = (patientId: number) => {
    updateFollowUpStatus(patientId, 'contacted');
    toast({
      title: "Patient marked as contacted",
      description: "Follow-up status updated successfully.",
    });
  };

  const remindLater = (patientId: number, days: number) => {
    // Calculate the future date for the reminder
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + days);
    
    // Save reminder date to localStorage
    const reminderDates = JSON.parse(localStorage.getItem('reminder_dates') || '{}');
    reminderDates[patientId] = reminderDate.toISOString();
    localStorage.setItem('reminder_dates', JSON.stringify(reminderDates));
    
    // Update patients state
    setPatients(patients.map(p => 
      p.id === patientId ? { ...p, reminderDate: reminderDate.toISOString() } : p
    ));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <FollowUpContext.Provider
      value={{
        patients,
        isLoading,
        error,
        refreshData: loadData,
        dismissPatient,
        markAsContacted,
        filterDays,
        setFilterDays,
        filteredPatients,
        remindLater,
        practitioners,
        selectedPractitionerId,
        setSelectedPractitionerId
      }}
    >
      {children}
    </FollowUpContext.Provider>
  );
};

export const useFollowUp = () => {
  const context = useContext(FollowUpContext);
  if (context === undefined) {
    throw new Error('useFollowUp must be used within a FollowUpProvider');
  }
  return context;
};
