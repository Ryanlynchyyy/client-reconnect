
import { useState, useEffect, useMemo } from 'react';
import { subDays } from 'date-fns';

interface CancelledAppointment {
  id: number;
  patientId: number;
  patientName: string;
  lastAppointmentDate: string;
  gapDays: number;
  status: 'cancelled' | 'missed' | 'large-gap' | 'no-followup';
  appointmentType?: string;
  phone: string;
  email: string;
  practitionerId: number;
  practitionerName: string;
}

export const useCancelledAppointments = () => {
  // In a real app, this would fetch from the API
  // For now, we're using mock data
  const [appointments, setAppointments] = useState<CancelledAppointment[]>([
    {
      id: 1,
      patientId: 101,
      patientName: "John Smith",
      lastAppointmentDate: new Date().toISOString(),
      gapDays: 5,
      status: "cancelled",
      appointmentType: "Standard consultation",
      phone: "0412 345 678",
      email: "john@example.com",
      practitionerId: 1,
      practitionerName: "Ben Smith"
    },
    {
      id: 2,
      patientId: 102,
      patientName: "Sarah Johnson",
      lastAppointmentDate: subDays(new Date(), 3).toISOString(),
      gapDays: 18,
      status: "missed",
      appointmentType: "Follow-up session",
      phone: "0423 456 789",
      email: "sarah@example.com",
      practitionerId: 2,
      practitionerName: "Josh Adams"
    },
    {
      id: 3,
      patientId: 103,
      patientName: "Michael Brown",
      lastAppointmentDate: subDays(new Date(), 14).toISOString(),
      gapDays: 14,
      status: "cancelled",
      appointmentType: "Initial assessment",
      phone: "0434 567 890",
      email: "michael@example.com",
      practitionerId: 1,
      practitionerName: "Ben Smith"
    },
    {
      id: 4,
      patientId: 104,
      patientName: "Lisa Williams",
      lastAppointmentDate: subDays(new Date(), 21).toISOString(),
      gapDays: 21,
      status: "missed",
      appointmentType: "Therapeutic session",
      phone: "0445 678 901",
      email: "lisa@example.com",
      practitionerId: 2,
      practitionerName: "Josh Adams"
    },
    {
      id: 5,
      patientId: 105,
      patientName: "David Jones",
      lastAppointmentDate: subDays(new Date(), 7).toISOString(),
      gapDays: 7,
      status: "large-gap",
      appointmentType: "Physiotherapy",
      phone: "0456 789 012",
      email: "david@example.com",
      practitionerId: 1, 
      practitionerName: "Ben Smith"
    }
  ]);

  // Statistics
  const stats = useMemo(() => {
    const cancelled = appointments.filter(a => a.status === "cancelled").length;
    const missed = appointments.filter(a => a.status === "missed").length;
    const recentCancellations = appointments.filter(a => 
      a.status === "cancelled" && a.gapDays <= 7
    ).length;
    
    return { cancelled, missed, recentCancellations };
  }, [appointments]);

  // Filter functions
  const getCancelledAppointments = () => 
    appointments.filter(a => a.status === "cancelled");
    
  const getMissedAppointments = () => 
    appointments.filter(a => a.status === "missed");

  return {
    appointments,
    getCancelledAppointments,
    getMissedAppointments,
    stats
  };
};
