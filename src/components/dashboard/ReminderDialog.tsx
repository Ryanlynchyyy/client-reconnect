
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

interface ReminderDialogProps {
  reminderDialogOpen: boolean;
  setReminderDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleConfirmReminder: (days: number) => void;
}

const ReminderDialog: React.FC<ReminderDialogProps> = ({
  reminderDialogOpen,
  setReminderDialogOpen,
  handleConfirmReminder
}) => {
  return (
    <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remind Later</DialogTitle>
          <DialogDescription>
            When would you like to be reminded about this patient?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-between mt-4">
          <Button onClick={() => handleConfirmReminder(1)}>Tomorrow</Button>
          <Button onClick={() => handleConfirmReminder(3)}>3 Days</Button>
          <Button onClick={() => handleConfirmReminder(7)}>1 Week</Button>
          <Button onClick={() => handleConfirmReminder(14)}>2 Weeks</Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setReminderDialogOpen(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderDialog;
