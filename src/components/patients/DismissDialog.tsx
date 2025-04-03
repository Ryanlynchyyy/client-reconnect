
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Star } from 'lucide-react';

interface DismissDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
  onDismiss: (sendReview: boolean) => void;
}

const DismissDialog: React.FC<DismissDialogProps> = ({
  isOpen,
  onClose,
  patient,
  onDismiss
}) => {
  const [sendReview, setSendReview] = useState(false);

  // Reset when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setSendReview(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <X className="h-5 w-5 text-red-500" />
            Dismiss Patient Follow-up
          </DialogTitle>
          <DialogDescription>
            Remove {patient.first_name} {patient.last_name} from the follow-up list
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            This patient won't appear in the follow-up list anymore. 
            You can also send them an automated review request.
          </p>

          <div className="flex items-center space-x-2 mt-4">
            <Checkbox 
              id="send-review" 
              checked={sendReview}
              onCheckedChange={(checked) => setSendReview(!!checked)}
            />
            <Label htmlFor="send-review" className="text-sm flex items-center gap-1">
              Send review request
              <Star className="h-3.5 w-3.5 text-amber-500" />
            </Label>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            variant="default" 
            className="bg-red-600 hover:bg-red-700 text-white" 
            onClick={() => onDismiss(sendReview)}
          >
            Dismiss Patient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DismissDialog;
