
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
  const reminderOptions = [
    { days: 7, label: '1 Week' },
    { days: 14, label: '2 Weeks' },
    { days: 30, label: '1 Month' },
    { days: 90, label: '3 Months' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-500" />
            Set Follow-up Reminder
          </DialogTitle>
          <DialogDescription>
            Schedule a reminder to follow up with {patient.first_name} {patient.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
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
