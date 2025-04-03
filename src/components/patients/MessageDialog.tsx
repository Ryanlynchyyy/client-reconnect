
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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Send, MessageSquare, CalendarPlus } from 'lucide-react';

interface MessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
  onSend: (messageTemplate: string) => void;
}

const MessageDialog: React.FC<MessageDialogProps> = ({
  isOpen,
  onClose,
  patient,
  onSend
}) => {
  const [activeTemplate, setActiveTemplate] = useState<string>('followUp');
  const [customMessage, setCustomMessage] = useState<string>('');

  // Generate templates based on patient data
  const templates = {
    followUp: `Hi ${patient.first_name}, this is ${patient.practitionerName} from Body in Mind Physio. 
It's been ${patient.daysSinceLastAppointment} days since your last appointment for ${patient.lastAppointmentType.toLowerCase()}. 
${patient.isInitialAppointment ? "I'd love to schedule your follow-up session to continue your treatment plan." : "I wanted to check how you're progressing with your treatment."}

${patient.appointmentNotes ? `Based on my notes from our last session: "${patient.appointmentNotes.split('.')[0]}.", I recommend booking another session soon.` : ""}

You can book online here: [BOOKING_LINK] or call us at 03 9999 9999.`,

    maintenance: `Hi ${patient.first_name}, this is ${patient.practitionerName} from Body in Mind Physio.
It's been ${patient.daysSinceLastAppointment} days since your last visit, and I wanted to check in about scheduling a maintenance appointment.

Regular sessions can help prevent the return of your symptoms and maintain the progress we've made.

Would you like me to arrange a time for you? You can also book online: [BOOKING_LINK]`,

    missedCare: `Hi ${patient.first_name}, this is ${patient.practitionerName} from Body in Mind Physio.
I noticed it's been ${patient.daysSinceLastAppointment} days since your last appointment${patient.hasRecentCancellation ? ", and you recently cancelled a scheduled session" : ""}.

Consistent care is important for your recovery, especially ${patient.isInitialAppointment ? "after an initial consultation" : "with your condition"}.

I have some openings this week if you'd like to come in. Book online: [BOOKING_LINK] or let me know what works for you.`
  };

  // Initialize custom message from selected template
  React.useEffect(() => {
    setCustomMessage(templates[activeTemplate as keyof typeof templates]);
  }, [activeTemplate, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-beach-ocean" />
            Send Follow-up Message
          </DialogTitle>
          <DialogDescription>
            Send a personalized message to {patient.first_name} {patient.last_name} for rebooking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Tabs defaultValue="followUp" value={activeTemplate} onValueChange={setActiveTemplate} className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="followUp">Follow-up</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                <TabsTrigger value="missedCare">Missed Care</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="border rounded p-3 bg-gray-50 text-sm mb-4">
            <p><strong>Patient:</strong> {patient.first_name} {patient.last_name}</p>
            <p><strong>Last Visit:</strong> {patient.daysSinceLastAppointment} days ago ({patient.lastAppointmentType})</p>
            <p><strong>Contact:</strong> {patient.phone} | {patient.email}</p>
          </div>

          <Textarea 
            value={customMessage} 
            onChange={(e) => setCustomMessage(e.target.value)} 
            className="min-h-[200px] font-mono text-sm"
          />
          
          <div className="text-xs text-muted-foreground">
            Use [BOOKING_LINK] to include your online booking link.
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            className="bg-beach-ocean hover:bg-beach-ocean/90 text-white gap-1"
            onClick={() => onSend(customMessage)}
          >
            <Send className="h-3.5 w-3.5" />
            Send Message
          </Button>
          <Button 
            variant="outline" 
            className="border-green-500 text-green-700 hover:bg-green-50 gap-1"
            onClick={() => {
              window.open('https://yourbookingcalendar.com', '_blank');
            }}
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            Open Calendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDialog;
