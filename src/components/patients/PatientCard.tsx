
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CalendarClock, 
  AlertTriangle, 
  CalendarX2, 
  UserCheck, 
  Clock, 
  Send,
  Bell,
  X,
  Star
} from 'lucide-react';
import MessageDialog from './MessageDialog';
import ReminderDialog from './ReminderDialog';
import DismissDialog from './DismissDialog';

interface PatientCardProps {
  patient: any;
  onSendFollowUp: (patientId: string, messageTemplate: string) => void;
  onDismiss: (patientId: string, sendReview: boolean) => void;
  onRemindLater: (patientId: string, days: number) => void;
  selected: boolean;
  onSelect: (patientId: string, selected: boolean) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onSendFollowUp,
  onDismiss,
  onRemindLater,
  selected,
  onSelect
}) => {
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isDismissOpen, setIsDismissOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);

  // Determine card style and status based on patient data
  const getCardStyle = () => {
    if (patient.isInitialAppointment && patient.daysSinceFirstAppointment <= 14) {
      return "bg-blue-50 border-blue-200 hover:bg-blue-100"; // Initial appointment within 2 weeks
    } else if (patient.hasRecentCancellation) {
      return "bg-red-50 border-red-200 hover:bg-red-100"; // Cancelled appointment
    } else if (patient.daysSinceLastAppointment >= 90) {
      return "bg-amber-50 border-amber-200 hover:bg-amber-100"; // 90+ days
    } else if (patient.daysSinceLastAppointment >= 30) {
      return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"; // 30-90 days
    } 
    return "bg-gray-50 border-gray-200 hover:bg-gray-100"; // Default
  };

  const getStatusIcon = () => {
    if (patient.hasRecentCancellation) {
      return <CalendarX2 className="h-5 w-5 text-red-500" />;
    } else if (patient.isInitialAppointment && patient.daysSinceFirstAppointment <= 14) {
      return <UserCheck className="h-5 w-5 text-blue-500" />;
    } else if (patient.daysSinceLastAppointment >= 90) {
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    } else if (patient.daysSinceLastAppointment >= 30) {
      return <Clock className="h-5 w-5 text-yellow-500" />;
    }
    return <CalendarClock className="h-5 w-5 text-gray-500" />;
  };

  const getStatusText = () => {
    if (patient.hasRecentCancellation) {
      return "Cancelled Appointment";
    } else if (patient.isInitialAppointment && patient.daysSinceFirstAppointment <= 14) {
      return "Initial Appointment";
    } else if (patient.daysSinceLastAppointment >= 90) {
      return "90+ Days Gap";
    } else if (patient.daysSinceLastAppointment >= 30) {
      return "30+ Days Gap";
    }
    return "Regular Follow-up";
  };

  const getStatusBadge = () => {
    if (patient.hasRecentCancellation) {
      return <Badge className="bg-red-100 text-red-800 border-red-300">{getStatusText()}</Badge>;
    } else if (patient.isInitialAppointment && patient.daysSinceFirstAppointment <= 14) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300">{getStatusText()}</Badge>;
    } else if (patient.daysSinceLastAppointment >= 90) {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-300">{getStatusText()}</Badge>;
    } else if (patient.daysSinceLastAppointment >= 30) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">{getStatusText()}</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800 border-gray-300">{getStatusText()}</Badge>;
  };

  const handleSendFollowUp = (messageTemplate: string) => {
    onSendFollowUp(patient.id, messageTemplate);
    setIsMessageOpen(false);
  };

  const handleDismiss = (sendReview: boolean) => {
    onDismiss(patient.id, sendReview);
    setIsDismissOpen(false);
  };

  const handleRemindLater = (days: number) => {
    onRemindLater(patient.id, days);
    setIsReminderOpen(false);
  };

  const getPractitionerBadgeColor = () => {
    switch(patient.assignedPractitionerId) {
      case 1: return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case 2: return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case 3: return "bg-violet-100 text-violet-800 border-violet-300";
      case 4: return "bg-orange-100 text-orange-800 border-orange-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <>
      <Card className={`transition-all duration-200 shadow-sm ${getCardStyle()} border ${selected ? 'ring-2 ring-blue-500' : ''}`}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="pt-0.5">
                <Checkbox 
                  id={`select-${patient.id}`}
                  checked={selected}
                  onCheckedChange={(checked) => onSelect(patient.id, !!checked)}
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <h3 className="font-medium text-lg">{patient.first_name} {patient.last_name}</h3>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Last seen: {format(new Date(patient.lastAppointmentDate), 'MMM d, yyyy')}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70" />
                    {patient.daysSinceLastAppointment} days ago
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {getStatusBadge()}
                  <Badge className="bg-gray-100 text-gray-800 border-gray-300">{patient.lastAppointmentType}</Badge>
                  <Badge className={getPractitionerBadgeColor()}>{patient.practitionerName}</Badge>
                  {patient.hasFutureAppointment && (
                    <Badge className="bg-green-100 text-green-800 border-green-300">Future Appointment</Badge>
                  )}
                </div>

                <div className="mt-3 bg-white/60 p-2 rounded-md border border-gray-200 text-sm">
                  <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center">
                    <Star className="h-3 w-3 mr-1 text-amber-500" />
                    Treatment Notes
                  </p>
                  <p className="line-clamp-2">{patient.appointmentNotes}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-row sm:flex-col gap-2 mt-2 sm:mt-0">
              <Button 
                size="sm" 
                className="bg-beach-ocean hover:bg-beach-ocean/90 text-white w-full sm:w-auto gap-1"
                onClick={() => setIsMessageOpen(true)}
              >
                <Send className="h-3.5 w-3.5" /> 
                Follow Up
              </Button>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                  onClick={() => setIsDismissOpen(true)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                  onClick={() => setIsReminderOpen(true)}
                >
                  <Bell className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <MessageDialog
        isOpen={isMessageOpen} 
        onClose={() => setIsMessageOpen(false)}
        patient={patient}
        onSend={handleSendFollowUp}
      />

      <DismissDialog
        isOpen={isDismissOpen}
        onClose={() => setIsDismissOpen(false)}
        patient={patient}
        onDismiss={handleDismiss}
      />

      <ReminderDialog
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        patient={patient}
        onRemind={handleRemindLater}
      />
    </>
  );
};

export default PatientCard;
