
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
  notes?: string; // Added notes field
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
      practitionerName: "Ben Smith",
      notes: "Patient reported shoulder tension. Advised to continue stretching exercises and use heat pack. Mentioned tennis elbow symptoms beginning to develop. Recommended follow-up in 7-10 days."
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
      practitionerName: "Josh Adams",
      notes: "Lower back pain diminishing after 3 treatments. Still experiencing morning stiffness. Patient mentioned swim training starting next week. Need to assess how this impacts recovery."
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
      practitionerName: "Ben Smith",
      notes: "First consultation for chronic neck pain. Identified poor desk ergonomics as likely cause. Provided initial treatment and postural advice. Patient needs comprehensive treatment plan with regular follow-ups."
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
      practitionerName: "Josh Adams",
      notes: "Ongoing treatment for sports injury (hamstring). Progress slowed this session. Mentioned increased work stress affecting recovery. Might need to adjust recovery timeline and incorporate relaxation techniques."
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
      practitionerName: "Ben Smith",
      notes: "Regular patient missing usual appointment schedule. Last treatment focused on shoulder mobility. Patient mentioned upcoming vacation - might be reason for gap in treatments. Has responded well to maintenance schedule previously."
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
