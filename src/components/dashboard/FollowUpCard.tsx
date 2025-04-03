
import React from 'react';
import { format, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CalendarClock, 
  AlertTriangle, 
  CalendarX2, 
  UserX, 
  Clock, 
  Send,
  Bell,
  X
} from 'lucide-react';
import { Label } from '@/components/ui/label';

interface FollowUpCardProps {
  patient: any;
  onSendFollowUp: (patientId: string) => void;
  onDismiss: (patientId: string) => void;
  onRemindLater: (patientId: string) => void;
  selected: boolean;
  onSelect: (patientId: string, selected: boolean) => void;
}

const FollowUpCard: React.FC<FollowUpCardProps> = ({
  patient,
  onSendFollowUp,
  onDismiss,
  onRemindLater,
  selected,
  onSelect
}) => {
  // Determine the gap severity based on days since last appointment
  const getGapSeverity = (gapDays: number) => {
    if (gapDays >= 90) return 'severe';
    if (gapDays >= 60) return 'high';
    if (gapDays >= 30) return 'medium';
    return 'low';
  };

  const getGapColor = (gapDays: number) => {
    const severity = getGapSeverity(gapDays);
    switch (severity) {
      case 'severe': return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'high': return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
      case 'medium': return 'bg-amber-50 border-amber-200 hover:bg-amber-100';
      case 'low': return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      default: return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'cancelled': return <CalendarX2 className="h-5 w-5 text-red-500" />;
      case 'no-followup': return <UserX className="h-5 w-5 text-orange-500" />;
      case 'large-gap': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default: return <CalendarClock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Cancelled</Badge>;
      case 'no-followup':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">No Follow-up</Badge>;
      case 'large-gap':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Large Gap</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Follow-up</Badge>;
    }
  };

  return (
    <Card className={`transition-all duration-200 shadow-sm ${getGapColor(patient.gapDays)} border ${selected ? 'ring-2 ring-primary' : ''}`}>
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
                {getStatusIcon(patient.status)}
                <h3 className="font-medium text-lg">{patient.patientName}</h3>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Last seen: {format(new Date(patient.lastAppointmentDate), 'MMM d, yyyy')}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70" />
                  {patient.gapDays} days ago
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {getStatusBadge(patient.status)}
                <Badge className="bg-gray-100 text-gray-800 border-gray-300">{patient.appointmentType}</Badge>
                <Badge className="bg-purple-100 text-purple-800 border-purple-300">{patient.practitionerName}</Badge>
              </div>

              <div className="mt-3 bg-white/50 p-2 rounded-md border border-gray-100 text-sm">
                <Label className="text-xs font-semibold text-gray-500 mb-1 block">Treatment Notes</Label>
                <p className="line-clamp-2">{patient.notes || "No treatment notes available."}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col gap-2 mt-2 sm:mt-0">
            <Button 
              size="sm" 
              className="bg-beach-ocean hover:bg-beach-ocean/90 text-white w-full sm:w-auto gap-1"
              onClick={() => onSendFollowUp(patient.id)}
            >
              <Send className="h-3.5 w-3.5" /> 
              Follow Up
            </Button>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={() => onDismiss(patient.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => onRemindLater(patient.id)}
              >
                <Bell className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FollowUpCard;
