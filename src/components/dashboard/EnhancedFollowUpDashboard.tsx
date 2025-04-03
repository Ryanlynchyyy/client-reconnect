import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ArrowUpDown, CalendarClock, CheckCircle2, ChevronDown, ChevronUp, RefreshCw, Send, Users } from 'lucide-react';
import DismissConfirmDialog from '@/components/dashboard/DismissConfirmDialog';
import TemplateSelectionDialog from '@/components/dashboard/TemplateSelectionDialog';
import ReminderDialog from '@/components/dashboard/ReminderDialog';
import EnhancedFilters from './EnhancedFilters';
import FollowUpCard from './FollowUpCard';
import DashboardHeader from './DashboardHeader';

// Mock data - replace with API calls in a real implementation
const mockPatients = [
  {
    id: '1',
    patientId: 101,
    patientName: 'Emily Johnson',
    lastAppointmentDate: '2023-03-15',
    gapDays: 35,
    status: 'cancelled',
    appointmentType: 'Initial Consultation',
    phone: '0412 345 678',
    practitionerId: 1,
    practitionerName: 'Dr. Sarah Williams',
    notes: 'Lower back pain, recommended stretching exercises and follow-up in 2 weeks. Patient mentioned increased discomfort after long periods of sitting.',
  },
  {
    id: '2',
    patientId: 102,
    patientName: 'Michael Brown',
    lastAppointmentDate: '2023-03-01',
    gapDays: 49,
    status: 'no-followup',
    appointmentType: 'Follow-up',
    phone: '0423 456 789',
    practitionerId: 2,
    practitionerName: 'Dr. James Thompson',
    notes: 'Knee rehabilitation following surgery. Good progress with exercises, but still experiencing some stiffness. Continue with prescribed routine.',
  },
  {
    id: '3',
    patientId: 103,
    patientName: 'Sophia Martinez',
    lastAppointmentDate: '2023-02-20',
    gapDays: 58,
    status: 'large-gap',
    appointmentType: 'Treatment',
    phone: '0434 567 890',
    practitionerId: 1,
    practitionerName: 'Dr. Sarah Williams',
    notes: 'Shoulder impingement treatment. Pain significantly reduced. Should return within 3-4 weeks to assess progress and adjust treatment plan as needed.',
  },
  {
    id: '4',
    patientId: 104,
    patientName: 'David Wilson',
    lastAppointmentDate: '2023-04-05',
    gapDays: 14,
    status: 'cancelled',
    appointmentType: 'Initial Consultation',
    phone: '0445 678 901',
    practitionerId: 2,
    practitionerName: 'Dr. James Thompson',
    notes: 'Neck strain from poor ergonomic setup. Provided stretching routine and advice on workspace adjustment. Schedule follow-up in 2 weeks.',
  },
  {
    id: '5',
    patientId: 105,
    patientName: 'Olivia Taylor',
    lastAppointmentDate: '2023-02-15',
    gapDays: 63,
    status: 'no-followup',
    appointmentType: 'Treatment',
    phone: '0456 789 012',
    practitionerId: 1,
    practitionerName: 'Dr. Sarah Williams',
    notes: 'Plantar fasciitis treatment. Improving slowly but still experiencing morning pain. Continue with stretching routine and ice therapy.',
  },
];

const practitioners = [
  { id: 1, name: 'Dr. Sarah Williams' },
  { id: 2, name: 'Dr. James Thompson' },
];

const appointmentTypes = ['Initial Consultation', 'Follow-up', 'Treatment', 'Assessment'];

const EnhancedFollowUpDashboard: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState(mockPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPractitioner, setSelectedPractitioner] = useState<number | null>(null);
  const [minGapDays, setMinGapDays] = useState(14);
  const [statusFilters, setStatusFilters] = useState({
    cancelled: true,
    'no-followup': true,
    'large-gap': true
  });
  const [selectedAppointmentTypes, setSelectedAppointmentTypes] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'gapDays',
    direction: 'desc' as 'asc' | 'desc'
  });
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showDismissDialog, setShowDismissDialog] = useState(false);
  const [selectedPatientForAction, setSelectedPatientForAction] = useState<string | null>(null);

  // Filter patients based on selected criteria
  const filteredPatients = patients.filter(patient => {
    // Search filter
    const matchesSearch = !searchTerm || 
      patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      patient.phone.includes(searchTerm) ||
      (patient.notes && patient.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Practitioner filter
    const matchesPractitioner = !selectedPractitioner || patient.practitionerId === selectedPractitioner;
    
    // Status filter based on tabs or checkboxes
    const matchesStatus = selectedTab === 'all' 
      ? statusFilters[patient.status]
      : selectedTab === patient.status;
    
    // Gap days filter
    const matchesGapDays = patient.gapDays >= minGapDays;
    
    // Appointment type filter
    const matchesAppointmentType = selectedAppointmentTypes.length === 0 || 
      selectedAppointmentTypes.includes(patient.appointmentType);
    
    return matchesSearch && matchesPractitioner && matchesStatus && matchesGapDays && matchesAppointmentType;
  });

  // Sort patients
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (sortConfig.key === 'patientName') {
      return sortConfig.direction === 'asc'
        ? a.patientName.localeCompare(b.patientName)
        : b.patientName.localeCompare(a.patientName);
    } else if (sortConfig.key === 'gapDays') {
      return sortConfig.direction === 'asc'
        ? a.gapDays - b.gapDays
        : b.gapDays - a.gapDays;
    } else if (sortConfig.key === 'lastAppointmentDate') {
      return sortConfig.direction === 'asc'
        ? new Date(a.lastAppointmentDate).getTime() - new Date(b.lastAppointmentDate).getTime()
        : new Date(b.lastAppointmentDate).getTime() - new Date(a.lastAppointmentDate).getTime();
    }
    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setIsLoading(false);
    toast({
      title: "Refreshed",
      description: "Patient follow-up data has been updated",
    });
  };

  const handleSelectPatient = (patientId: string, selected: boolean) => {
    setSelectedPatients(prev => 
      selected 
        ? [...prev, patientId] 
        : prev.filter(id => id !== patientId)
    );
  };

  const handleSelectAllPatients = (selected: boolean) => {
    setSelectedPatients(selected ? sortedPatients.map(p => p.id) : []);
  };

  const handleSendFollowUp = (patientId: string) => {
    setSelectedPatientForAction(patientId);
    setShowTemplateDialog(true);
  };

  const handleDismiss = (patientId: string) => {
    setSelectedPatientForAction(patientId);
    setShowDismissDialog(true);
  };

  const handleRemindLater = (patientId: string) => {
    setSelectedPatientForAction(patientId);
    setShowReminderDialog(true);
  };

  const handleBulkFollowUp = () => {
    toast({
      title: "Bulk Follow-up",
      description: `Preparing follow-up templates for ${selectedPatients.length} patients`,
    });
    setShowTemplateDialog(true);
  };

  const handleSendTemplate = (templateId: string) => {
    const patientIds = selectedPatientForAction 
      ? [selectedPatientForAction]
      : selectedPatients;
    
    toast({
      title: "Follow-up Sent",
      description: `Template sent to ${patientIds.length} patient(s)`,
    });

    setShowTemplateDialog(false);
    setSelectedPatientForAction(null);
  };

  const handleSetReminder = (days: number) => {
    toast({
      title: "Reminder Set",
      description: `You will be reminded in ${days} days`,
    });
    setShowReminderDialog(false);
    setSelectedPatientForAction(null);
  };

  const handleConfirmDismiss = (sendReview: boolean) => {
    toast({
      title: "Patient Dismissed",
      description: sendReview 
        ? "Review request has been sent to the patient" 
        : "Patient has been removed from follow-up list",
    });
    setShowDismissDialog(false);
    setSelectedPatientForAction(null);
  };

  const getStatusCount = (status: string) => {
    return patients.filter(p => status === 'all' ? true : p.status === status).length;
  };

  const getTimeFrameLabel = (days: number) => {
    if (days >= 90) return '90+ days';
    if (days >= 60) return '60-90 days';
    if (days >= 30) return '30-60 days';
    return '< 30 days';
  };

  // Group patients by time frame for statistics
  const timeFrameGroups = patients.reduce((acc, patient) => {
    const timeFrame = getTimeFrameLabel(patient.gapDays);
    acc[timeFrame] = (acc[timeFrame] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <DashboardHeader handleRefresh={handleRefresh} isLoading={isLoading} />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-beach-sand to-beach-foam border-beach-coral/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-beach-ocean">{patients.length}</CardTitle>
            <CardDescription>Total Patients to Follow-up</CardDescription>
          </CardHeader>
          <CardContent>
            <Users className="h-8 w-8 text-beach-ocean/70" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-amber-700">{getStatusCount('no-followup')}</CardTitle>
            <CardDescription className="text-amber-700/70">No Follow-up Booked</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-red-700">{getStatusCount('cancelled')}</CardTitle>
            <CardDescription className="text-red-700/70">Cancelled Appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarClock className="h-8 w-8 text-red-500" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-blue-700">{timeFrameGroups['90+ days'] || 0}</CardTitle>
            <CardDescription className="text-blue-700/70">90+ Days Since Last Visit</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarClock className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
      </div>

      <EnhancedFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        practitioners={practitioners}
        selectedPractitioner={selectedPractitioner}
        setSelectedPractitioner={setSelectedPractitioner}
        minGapDays={minGapDays}
        setMinGapDays={setMinGapDays}
        statusFilters={statusFilters}
        setStatusFilters={(filters) => setStatusFilters(filters as typeof statusFilters)}
        appointmentTypes={appointmentTypes}
        selectedAppointmentTypes={selectedAppointmentTypes}
        setSelectedAppointmentTypes={setSelectedAppointmentTypes}
      />

      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="bg-beach-sand/50 p-1 mb-4">
          <TabsTrigger value="all" className="data-[state=active]:bg-beach-ocean data-[state=active]:text-white">
            All Patients
            <Badge variant="outline" className="ml-2 bg-white/80">{getStatusCount('all')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Cancelled
            <Badge variant="outline" className="ml-2 bg-white/80">{getStatusCount('cancelled')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="no-followup" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
            No Follow-up
            <Badge variant="outline" className="ml-2 bg-white/80">{getStatusCount('no-followup')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="large-gap" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Large Gap
            <Badge variant="outline" className="ml-2 bg-white/80">{getStatusCount('large-gap')}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedTab} className="m-0">
          <Card>
            <CardHeader className="pb-0 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Patient Follow-up List</CardTitle>
                <CardDescription>
                  {sortedPatients.length} patients requiring follow-up
                </CardDescription>
              </div>

              {selectedPatients.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedPatients.length} selected
                  </span>
                  <Button 
                    onClick={handleBulkFollowUp}
                    className="bg-beach-ocean hover:bg-beach-ocean/90 text-white"
                    size="sm"
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    Bulk Send
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedPatients.length > 0 && selectedPatients.length === sortedPatients.length}
                    onCheckedChange={handleSelectAllPatients}
                  />
                  <Label htmlFor="select-all" className="text-sm font-medium">
                    Select All
                  </Label>
                </div>
                <div className="flex gap-3 text-sm">
                  <button 
                    onClick={() => handleSort('patientName')}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    Name
                    {sortConfig.key === 'patientName' && (
                      sortConfig.direction === 'asc' ? 
                      <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  <button 
                    onClick={() => handleSort('lastAppointmentDate')}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    Last Visit
                    {sortConfig.key === 'lastAppointmentDate' && (
                      sortConfig.direction === 'asc' ? 
                      <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  <button 
                    onClick={() => handleSort('gapDays')}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    Gap Days
                    {sortConfig.key === 'gapDays' && (
                      sortConfig.direction === 'asc' ? 
                      <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-4 mt-4">
                {sortedPatients.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground">No patients match your filters</p>
                  </div>
                ) : (
                  sortedPatients.map((patient) => (
                    <FollowUpCard
                      key={patient.id}
                      patient={patient}
                      onSendFollowUp={handleSendFollowUp}
                      onDismiss={handleDismiss}
                      onRemindLater={handleRemindLater}
                      selected={selectedPatients.includes(patient.id)}
                      onSelect={handleSelectPatient}
                    />
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {sortedPatients.length} of {patients.length} patients
              </p>
              <Button 
                variant="outline"
                className="border-beach-ocean text-beach-ocean"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reusing existing dialog components */}
      <TemplateSelectionDialog
        open={showTemplateDialog}
        setOpen={setShowTemplateDialog}
        patientName={selectedPatientForAction ? patients.find(p => p.id === selectedPatientForAction)?.patientName || '' : 'selected patients'}
        onConfirm={handleSendTemplate}
      />
      
      <ReminderDialog
        reminderDialogOpen={showReminderDialog}
        setReminderDialogOpen={setShowReminderDialog}
        handleConfirmReminder={handleSetReminder}
      />

      <DismissConfirmDialog
        open={showDismissDialog}
        setOpen={setShowDismissDialog}
        patientName={selectedPatientForAction ? patients.find(p => p.id === selectedPatientForAction)?.patientName || '' : ''}
        onConfirm={handleConfirmDismiss}
      />
    </div>
  );
};

export default EnhancedFollowUpDashboard;
