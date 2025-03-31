import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { PatientWithFollowUpStatus, ClinikoAppointment, ClinikoPatient } from '@/types/clinikoTypes';
import { clinikoApi } from '@/services/clinikoApi';
import { useToast } from '@/components/ui/use-toast';
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
}

const FollowUpContext = createContext<FollowUpContextType | undefined>(undefined);

export const FollowUpProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<PatientWithFollowUpStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDays, setFilterDays] = useState<number>(30);
  const { toast } = useToast();

  const filteredPatients = React.useMemo(() => {
    return patients.filter(patient => {
      if (patient.hasFutureAppointment) return false;
      if (patient.followUpStatus === 'dismissed') return false;
      return patient.daysSinceLastAppointment !== null && 
             patient.daysSinceLastAppointment >= filterDays;
    });
  }, [patients, filterDays]);

  const loadExampleData = async () => {
    try {
      console.log('Loading example data directly from mock data');
      
      const patientResponse = getMockData('patients');
      const patients = patientResponse._embedded.patients as ClinikoPatient[];
      
      const processedPatients = await Promise.all(patients.map(async (patient) => {
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
        
        if (lastAppointment) {
          lastAppointmentDate = lastAppointment.starts_at;
          const lastDate = new Date(lastAppointment.starts_at);
          daysSinceLastAppointment = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          assignedPractitionerId = lastAppointment.practitioner?.id;
        }
        
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
    
    const processedPatients: PatientWithFollowUpStatus[] = [];
    
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
        
        if (lastAppointment) {
          lastAppointmentDate = lastAppointment.starts_at;
          const lastDate = new Date(lastAppointment.starts_at);
          daysSinceLastAppointment = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          assignedPractitionerId = lastAppointment.practitioner.id;
        }
        
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
      
      if (!localStorage.getItem('cliniko_api_key')) {
        console.log('No API key found, loading example data instead');
        await loadExampleData();
        return;
      }
      
      const patients = await clinikoApi.getPatients();
      
      const processedPatients = await processPatientData(patients);
      
      setPatients(processedPatients);
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
