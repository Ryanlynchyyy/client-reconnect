
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { PatientWithFollowUpStatus, ClinikoAppointment, ClinikoPatient } from '@/types/clinikoTypes';
import { clinikoApi } from '@/services/clinikoApi';
import { useToast } from '@/components/ui/use-toast';

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
}

const FollowUpContext = createContext<FollowUpContextType | undefined>(undefined);

export const FollowUpProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<PatientWithFollowUpStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDays, setFilterDays] = useState<number>(30);
  const { toast } = useToast();

  // Filter patients based on days since last appointment
  const filteredPatients = React.useMemo(() => {
    return patients.filter(patient => {
      // If they have a future appointment, don't include them
      if (patient.hasFutureAppointment) return false;
      
      // If they've been dismissed, don't include them
      if (patient.followUpStatus === 'dismissed') return false;
      
      // If they've been contacted, still include them for reference
      
      // Filter by days since last appointment
      return patient.daysSinceLastAppointment !== null && 
             patient.daysSinceLastAppointment >= filterDays;
    });
  }, [patients, filterDays]);

  // Function to load example data
  const loadExampleData = async () => {
    try {
      // Use our proxy with the example data flag
      const response = await fetch('/api/cliniko', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          useExampleData: true,
          endpoint: 'patients'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to load example data');
      }
      
      const responseData = await response.json();
      const patients = responseData.data._embedded.patients as ClinikoPatient[];
      
      // Process example patient data to add appointment info
      const processedPatients = await Promise.all(patients.map(async (patient) => {
        const appointmentResponse = await fetch('/api/cliniko', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            useExampleData: true,
            endpoint: `patients/${patient.id}/appointments`
          })
        });
        
        if (!appointmentResponse.ok) {
          throw new Error(`Failed to load appointments for patient ${patient.id}`);
        }
        
        const appointmentData = await appointmentResponse.json();
        const appointments = appointmentData.data._embedded.appointments as ClinikoAppointment[];
        
        // Sort by date descending
        appointments.sort(
          (a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
        );
        
        const now = new Date();
        
        // Check for future appointments
        const hasFutureAppointment = appointments.some(
          app => new Date(app.starts_at) > now
        );
        
        // Find most recent past appointment
        const lastAppointment = appointments.find(
          app => new Date(app.starts_at) <= now
        );
        
        let lastAppointmentDate: string | null = null;
        let daysSinceLastAppointment: number | null = null;
        let assignedPractitionerId: number | undefined;
        
        if (lastAppointment) {
          lastAppointmentDate = lastAppointment.starts_at;
          const lastDate = new Date(lastAppointment.starts_at);
          daysSinceLastAppointment = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          assignedPractitionerId = lastAppointment.practitioner?.id;
        }
        
        // Get random follow-up status - mostly pending but some contacted
        const followUpStatus = Math.random() < 0.8 ? 'pending' : 'contacted';
        
        return {
          ...patient,
          lastAppointmentDate,
          daysSinceLastAppointment,
          followUpStatus: followUpStatus as 'pending' | 'dismissed' | 'contacted',
          hasFutureAppointment,
          assignedPractitionerId
        };
      }));
      
      setPatients(processedPatients);
    } catch (err) {
      console.error('Failed to load example data:', err);
      setError('Failed to load example data. Try again or check your API settings.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to process patient appointments and determine follow-up status
  const processPatientData = async (patients: ClinikoPatient[]): Promise<PatientWithFollowUpStatus[]> => {
    const now = new Date();
    const followUpStatuses = JSON.parse(localStorage.getItem('followup_statuses') || '{}');
    
    // Process each patient in sequence to avoid overwhelming the API
    const processedPatients: PatientWithFollowUpStatus[] = [];
    
    for (const patient of patients) {
      try {
        // Get patient's appointment history
        const appointments = await clinikoApi.getPatientAppointments(patient.id);
        
        // Filter out cancelled or no-shows
        const validAppointments = appointments.filter(
          app => !app.cancelled_at && !app.did_not_arrive
        );
        
        // Sort by date descending
        validAppointments.sort(
          (a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
        );
        
        // Check for future appointments
        const hasFutureAppointment = validAppointments.some(
          app => new Date(app.starts_at) > now
        );
        
        // Find most recent past appointment
        const lastAppointment = validAppointments.find(
          app => new Date(app.starts_at) <= now
        );
        
        let lastAppointmentDate: string | null = null;
        let daysSinceLastAppointment: number | null = null;
        let assignedPractitionerId: number | undefined;
        
        if (lastAppointment) {
          lastAppointmentDate = lastAppointment.starts_at;
          const lastDate = new Date(lastAppointment.starts_at);
          daysSinceLastAppointment = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          assignedPractitionerId = lastAppointment.practitioner.id;
        }
        
        // Get previous follow-up status if it exists
        const savedStatus = followUpStatuses[patient.id] || 'pending';
        
        processedPatients.push({
          ...patient,
          lastAppointmentDate,
          daysSinceLastAppointment,
          followUpStatus: savedStatus,
          hasFutureAppointment,
          assignedPractitionerId
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
      
      // Check if API key is set
      if (!localStorage.getItem('cliniko_api_key')) {
        console.log('No API key found, loading example data instead');
        await loadExampleData();
        return;
      }
      
      // Get all patients
      const patients = await clinikoApi.getPatients();
      
      // Process patient data to determine follow-up status
      const processedPatients = await processPatientData(patients);
      
      setPatients(processedPatients);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load patient data. Check your API settings and try again.');
      toast({
        title: "Error loading data",
        description: "There was a problem connecting to Cliniko API.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save status changes to localStorage
  const updateFollowUpStatus = (patientId: number, status: 'pending' | 'dismissed' | 'contacted') => {
    const statuses = JSON.parse(localStorage.getItem('followup_statuses') || '{}');
    statuses[patientId] = status;
    localStorage.setItem('followup_statuses', JSON.stringify(statuses));
    
    setPatients(patients.map(p => 
      p.id === patientId ? { ...p, followUpStatus: status } : p
    ));
  };

  // Actions for patient follow-ups
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

  // Load data on initial mount
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
        filteredPatients
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
