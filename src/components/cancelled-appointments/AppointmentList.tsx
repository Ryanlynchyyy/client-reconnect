
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, CalendarClock, CalendarX2, UserX, CalendarCheck } from 'lucide-react';

interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  lastAppointmentDate: string;
  gapDays: number;
  status: string;
  appointmentType: string;
  phone: string;
  email: string;
  practitionerId: number;
  practitionerName: string;
}

interface AppointmentListProps {
  gaps: Appointment[];
  onSendMessage: (patientId: number, patientName: string) => void;
}

export function AppointmentList({ gaps, onSendMessage }: AppointmentListProps) {
  const getPractitionerColor = (practitionerId: number) => {
    switch (practitionerId) {
      case 1: return "bg-blue-100 text-blue-800";
      case 2: return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "cancelled": return "bg-orange-100 text-orange-800";
      case "missed": return "bg-red-100 text-red-800";
      case "large-gap": return "bg-yellow-100 text-yellow-800";
      case "no-followup": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "cancelled": return <CalendarX2 className="h-4 w-4 mr-1" />;
      case "missed": return <UserX className="h-4 w-4 mr-1" />;
      case "large-gap": return <CalendarClock className="h-4 w-4 mr-1" />;
      case "no-followup": return <CalendarCheck className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  if (gaps.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No appointments found matching your criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {gaps.map((gap) => (
        <Card key={gap.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-medium">{gap.patientName}</h3>
                  <Badge className={getPractitionerColor(gap.practitionerId)}>
                    {gap.practitionerName}
                  </Badge>
                  <Badge className={getStatusColor(gap.status)} variant="secondary">
                    {getStatusIcon(gap.status)}
                    {gap.status === "cancelled" && "Cancelled"}
                    {gap.status === "missed" && "Missed Appointment"}
                    {gap.status === "large-gap" && `${gap.gapDays} Day Gap`}
                    {gap.status === "no-followup" && "No Follow-up"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1 text-sm text-muted-foreground">
                  <span>Last Appointment: {format(new Date(gap.lastAppointmentDate), "PPP")}</span>
                  <span>{gap.appointmentType}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <Phone className="h-4 w-4" />
                  {gap.phone}
                </Button>
                <Button
                  className="bg-cliniko-primary hover:bg-cliniko-accent"
                  size="sm"
                  onClick={() => onSendMessage(gap.patientId, gap.patientName)}
                >
                  Send Booking Link
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
