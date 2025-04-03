
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell, CalendarClock } from 'lucide-react';
import { addDays, format } from 'date-fns';

interface ReminderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
  onRemind: (days: number) => void;
}

const ReminderDialog: React.FC<ReminderDialogProps> = ({
  isOpen,
  onClose,
  patient,
  onRemind
}) => {
  // Updated reminder options with more targeted follow-up periods
  const reminderOptions = [
    { days: 7, label: '1 Week' },
    { days: 14, label: '2 Weeks' },
    { days: 30, label: '1 Month' },
    { days: 60, label: '2 Months' },
    { days: 90, label: '3 Months' }
  ];

  // Add special messaging if this is a new patient who hasn't returned
  const isNewPatientWithoutFollowUp = patient?.isInitialAppointment && 
    !patient?.hasFutureAppointment && 
    patient?.daysSinceFirstAppointment >= 14;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-500" />
            Set Follow-up Reminder
          </DialogTitle>
          <DialogDescription>
            {isNewPatientWithoutFollowUp ? 
              `Schedule a reminder to follow up with ${patient.first_name} ${patient.last_name} who hasn't booked a second appointment` :
              `Schedule a reminder to follow up with ${patient.first_name} ${patient.last_name}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isNewPatientWithoutFollowUp && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-700">
                <strong>New Patient Alert:</strong> It's been {patient.daysSinceFirstAppointment} days since this patient's 
                first appointment, and they haven't booked a follow-up yet.
              </p>
            </div>
          )}
          
          <p className="text-sm text-gray-600 mb-4">
            Choose when you'd like to be reminded to follow up with this patient:
          </p>

          <div className="grid grid-cols-2 gap-3">
            {reminderOptions.map((option) => (
              <Button
                key={option.days}
                variant="outline"
                className="flex flex-col py-3 h-auto border-blue-200 hover:bg-blue-50"
                onClick={() => onRemind(option.days)}
              >
                <span className="text-blue-600 font-medium">{option.label}</span>
                <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <CalendarClock className="h-3 w-3" /> 
                  {format(addDays(new Date(), option.days), 'MMM d, yyyy')}
                </span>
              </Button>
            ))}
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderDialog;
