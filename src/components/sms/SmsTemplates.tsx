
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface SmsTemplate {
  id: string;
  name: string;
  content: string;
}

const PLACEHOLDERS = [
  { label: 'First Name', value: '{{first_name}}' },
  { label: 'Last Name', value: '{{last_name}}' },
  { label: 'Full Name', value: '{{full_name}}' },
  { label: 'Last Visit Date', value: '{{last_visit_date}}' },
  { label: 'Days Since Visit', value: '{{days_since_visit}}' },
];

const DEFAULT_TEMPLATES: SmsTemplate[] = [
  {
    id: 'template1',
    name: 'Basic Follow-Up',
    content: 'Hi {{first_name}}, it\'s been {{days_since_visit}} days since your last physio session. How\'s your recovery going? Reply to book a follow-up appointment if needed.',
  },
  {
    id: 'template2',
    name: 'Special Offer',
    content: 'Hi {{first_name}}, we noticed it\'s been a while since your last visit. We\'re offering 10% off follow-up appointments this month. Reply to book.',
  },
];

const SmsTemplates: React.FC = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<SmsTemplate | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [twilioSettings, setTwilioSettings] = useState({
    accountSid: localStorage.getItem('twilio_account_sid') || '',
    authToken: localStorage.getItem('twilio_auth_token') || '',
    fromNumber: localStorage.getItem('twilio_from_number') || '',
  });
  
  useEffect(() => {
    // Load templates from localStorage or use defaults
    const savedTemplates = localStorage.getItem('sms_templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      setTemplates(DEFAULT_TEMPLATES);
      localStorage.setItem('sms_templates', JSON.stringify(DEFAULT_TEMPLATES));
    }
  }, []);
  
  const handleTemplateChange = (templateId: string) => {
    const selected = templates.find(t => t.id === templateId);
    if (selected) {
      setActiveTemplate(selected);
    }
  };
  
  const handleContentChange = (content: string) => {
    if (!activeTemplate) return;
    
    const updatedTemplate: SmsTemplate = { ...activeTemplate, content };
    setActiveTemplate(updatedTemplate);
    
    // Update templates list
    const updatedTemplates = templates.map(t => 
      t.id === activeTemplate.id ? updatedTemplate : t
    );
    
    setTemplates(updatedTemplates);
    localStorage.setItem('sms_templates', JSON.stringify(updatedTemplates));
  };
  
  const handleInsertPlaceholder = (placeholder: string) => {
    if (!activeTemplate) return;
    
    const textArea = document.getElementById('template-content') as HTMLTextAreaElement;
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    
    const newContent = 
      activeTemplate.content.substring(0, start) + 
      placeholder + 
      activeTemplate.content.substring(end);
    
    handleContentChange(newContent);
  };
  
  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) {
      toast({
        title: "Template name required",
        description: "Please enter a name for your new template.",
        variant: "destructive",
      });
      return;
    }
    
    const newTemplate: SmsTemplate = {
      id: `template${Date.now()}`,
      name: newTemplateName,
      content: 'Hi {{first_name}}, ',
    };
    
    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem('sms_templates', JSON.stringify(updatedTemplates));
    
    setNewTemplateName('');
    setIsCreating(false);
    setActiveTemplate(newTemplate);
    
    toast({
      title: "Template created",
      description: "Your new template has been created.",
    });
  };
  
  const handleDeleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    localStorage.setItem('sms_templates', JSON.stringify(updatedTemplates));
    
    if (activeTemplate && activeTemplate.id === templateId) {
      setActiveTemplate(updatedTemplates[0] || null);
    }
    
    toast({
      title: "Template deleted",
      description: "The SMS template has been removed.",
    });
  };
  
  const handleSaveTwilioSettings = () => {
    localStorage.setItem('twilio_account_sid', twilioSettings.accountSid);
    localStorage.setItem('twilio_auth_token', twilioSettings.authToken);
    localStorage.setItem('twilio_from_number', twilioSettings.fromNumber);
    
    toast({
      title: "Twilio settings saved",
      description: "Your SMS provider settings have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SMS Templates</h1>
          <p className="text-gray-600">
            Create and manage your SMS templates for patient follow-ups
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">SMS Provider Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-4">
            {templates.map(template => (
              <Button
                key={template.id}
                variant={activeTemplate?.id === template.id ? "default" : "outline"}
                onClick={() => handleTemplateChange(template.id)}
              >
                {template.name}
              </Button>
            ))}
            
            {!isCreating && (
              <Button variant="outline" onClick={() => setIsCreating(true)}>
                + New Template
              </Button>
            )}
          </div>
          
          {isCreating && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="Enter template name"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate}>
                  Create Template
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {activeTemplate && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{activeTemplate.name}</CardTitle>
                  <Button 
                    variant="ghost" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteTemplate(activeTemplate.id)}
                  >
                    Delete
                  </Button>
                </div>
                <CardDescription>
                  Edit your SMS template below. You can insert placeholders using the buttons.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="template-content">Template Content</Label>
                  <Textarea
                    id="template-content"
                    value={activeTemplate.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    rows={6}
                  />
                  <p className="text-xs text-gray-500">
                    {160 - activeTemplate.content.length} characters remaining
                    {activeTemplate.content.length > 160 && 
                      ' (will be sent as multiple messages)'}
                  </p>
                </div>
                
                <div>
                  <Label>Insert Placeholders:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {PLACEHOLDERS.map(placeholder => (
                      <Button
                        key={placeholder.value}
                        variant="outline"
                        size="sm"
                        onClick={() => handleInsertPlaceholder(placeholder.value)}
                      >
                        {placeholder.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500">
                  Templates are saved automatically as you type.
                </p>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Provider Settings</CardTitle>
              <CardDescription>
                Configure your Twilio account to send SMS messages to patients.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account-sid">Twilio Account SID</Label>
                <Input
                  id="account-sid"
                  value={twilioSettings.accountSid}
                  onChange={(e) => setTwilioSettings({...twilioSettings, accountSid: e.target.value})}
                  placeholder="Enter your Twilio Account SID"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="auth-token">Twilio Auth Token</Label>
                <Input
                  id="auth-token"
                  type="password"
                  value={twilioSettings.authToken}
                  onChange={(e) => setTwilioSettings({...twilioSettings, authToken: e.target.value})}
                  placeholder="Enter your Twilio Auth Token"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="from-number">Twilio Phone Number</Label>
                <Input
                  id="from-number"
                  value={twilioSettings.fromNumber}
                  onChange={(e) => setTwilioSettings({...twilioSettings, fromNumber: e.target.value})}
                  placeholder="+15551234567"
                />
                <p className="text-xs text-gray-500">
                  Enter the Twilio phone number that will send the SMS messages.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveTwilioSettings}>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmsTemplates;
