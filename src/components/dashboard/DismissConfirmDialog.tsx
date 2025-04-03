
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface DismissConfirmDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  patientName: string;
  onConfirm: (sendReview: boolean) => void;
}

const DismissConfirmDialog: React.FC<DismissConfirmDialogProps> = ({
  open,
  setOpen,
  patientName,
  onConfirm
}) => {
  const [sendReview, setSendReview] = useState(false);

  const handleConfirm = () => {
    onConfirm(sendReview);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Dismiss {patientName}</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove {patientName} from your active follow-up list. You won't be reminded about this patient anymore.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex items-center space-x-2 py-4">
          <Checkbox
            id="send-review" 
            checked={sendReview}
            onCheckedChange={(checked) => setSendReview(checked === true)}
          />
          <Label htmlFor="send-review">
            Send a review request text message
          </Label>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DismissConfirmDialog;
