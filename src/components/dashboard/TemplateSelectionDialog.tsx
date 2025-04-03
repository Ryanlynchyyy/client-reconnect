
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Mock templates
const mockTemplates = [
  { 
    id: "template1", 
    name: "General Follow-Up", 
    content: "Hi {patientName}, we noticed you haven't booked your next appointment yet. Based on your last treatment for {condition}, we recommend scheduling your next visit soon. Click here to book: {bookingLink}" 
  },
  { 
    id: "template2", 
    name: "Post-Initial Consultation", 
    content: "Hello {patientName}, thank you for your initial consultation. To continue your treatment plan for {condition}, we recommend booking your follow-up appointment. Click here to book: {bookingLink}" 
  },
  { 
    id: "template3", 
    name: "Missed Appointment", 
    content: "Hi {patientName}, we noticed you missed your recent appointment. Your {condition} treatment is important to us. Let's get you rescheduled - click here: {bookingLink}" 
  },
  { 
    id: "template4", 
    name: "Long Gap Between Visits", 
    content: "Hello {patientName}, it's been a while since your last visit for {condition}. We recommend scheduling a check-up to ensure your recovery stays on track: {bookingLink}" 
  },
];

const formSchema = z.object({
  templateId: z.string().min(1, "Please select a template"),
  messageContent: z.string().min(10, "Message must be at least 10 characters"),
});

interface TemplateSelectionDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  patientName: string;
  onConfirm: (templateId: string) => void;
}

const TemplateSelectionDialog: React.FC<TemplateSelectionDialogProps> = ({
  open,
  setOpen,
  patientName,
  onConfirm
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateId: "",
      messageContent: "",
    },
  });
  
  const templateId = form.watch('templateId');

  const onTemplateChange = (templateId: string) => {
    const selectedTemplate = mockTemplates.find(t => t.id === templateId);
    if (selectedTemplate) {
      let content = selectedTemplate.content;
      content = content.replace('{patientName}', patientName);
      content = content.replace('{condition}', 'your condition');
      content = content.replace('{bookingLink}', 'https://booking.cliniko.com/yourlink');
      
      form.setValue('messageContent', content);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onConfirm(values.templateId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Follow-Up Message</DialogTitle>
          <DialogDescription>
            Customize and send a booking reminder to {patientName}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Template</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      onTemplateChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            {templateId && (
              <FormField
                control={form.control}
                name="messageContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personalized Message</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Send Message</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelectionDialog;
