
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Users, 
  AlertCircle, 
  Clock, 
  CalendarClock,
  CalendarX,
  UserCheck,
  ArrowDown
} from 'lucide-react';
import PatientFilters from './PatientFilters';
import PatientCard from './PatientCard';
import { mockPatients } from '@/data/mockPatients';

// This component would replace the current Patients.tsx eventually
const PatientFollowUp = () => {
  const { toast } = useToast();
  const [patients, setPatients] = useState(mockPatients);
  const [filteredPatients, setFilteredPatients] = useState(mockPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [practitionerFilter, setPractitionerFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Apply all filters
  useEffect(() => {
    let result = [...patients];
    
    // Search filter
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      result = result.filter(patient => 
        `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(lowercaseSearch) ||
        patient.phone.includes(lowercaseSearch) ||
        patient.email.toLowerCase().includes(lowercaseSearch) ||
        (patient.appointmentNotes && patient.appointmentNotes.toLowerCase().includes(lowercaseSearch))
      );
    }
    
    // Practitioner filter
    if (practitionerFilter) {
      result = result.filter(patient => patient.assignedPractitionerId === practitionerFilter);
    }
    
    // Time-based filter
    if (timeFilter === 'initial-2-weeks') {
      result = result.filter(patient => 
        patient.isInitialAppointment && 
        patient.daysSinceFirstAppointment <= 14);
    } else if (timeFilter === 'last-30-days') {
      result = result.filter(patient => 
        patient.daysSinceLastAppointment >= 14 && 
        patient.daysSinceLastAppointment <= 30);
    } else if (timeFilter === 'last-90-days') {
      result = result.filter(patient => 
        patient.daysSinceLastAppointment >= 30 && 
        patient.daysSinceLastAppointment <= 90);
    } else if (timeFilter === '90-plus-days') {
      result = result.filter(patient => 
        patient.daysSinceLastAppointment > 90);
    }
    
    // Status filter
    if (statusFilter === 'cancelled') {
      result = result.filter(patient => patient.hasRecentCancellation);
    } else if (statusFilter === 'no-followup') {
      result = result.filter(patient => 
        patient.isInitialAppointment && 
        !patient.hasFutureAppointment);
    } else if (statusFilter === 'pending') {
      result = result.filter(patient => patient.followUpStatus === 'pending');
    } else if (statusFilter === 'contacted') {
      result = result.filter(patient => patient.followUpStatus === 'contacted');
    } else if (statusFilter === 'dismissed') {
      result = result.filter(patient => patient.followUpStatus === 'dismissed');
    }
    
    // Apply tab filters
    if (activeTab === 'initial') {
      result = result.filter(patient => 
        patient.isInitialAppointment && 
        patient.daysSinceFirstAppointment <= 14);
    } else if (activeTab === '30-day') {
      result = result.filter(patient => 
        patient.daysSinceLastAppointment >= 14 && 
        patient.daysSinceLastAppointment <= 30);
    } else if (activeTab === '90-day') {
      result = result.filter(patient => 
        patient.daysSinceLastAppointment >= 30 && 
        patient.daysSinceLastAppointment <= 90);
    } else if (activeTab === 'cancelled') {
      result = result.filter(patient => patient.hasRecentCancellation);
    }
    
    setFilteredPatients(result);
  }, [patients, searchTerm, timeFilter, practitionerFilter, statusFilter, activeTab]);

  // Handler functions
  const handleSendFollowUp = (patientId: string, messageTemplate: string) => {
    // In a real app, this would send the message
    toast({
      title: "Follow-up message sent",
      description: `Message sent to patient with booking link`,
    });
    
    // Update patient status
    setPatients(prev => 
      prev.map(patient => 
        patient.id === patientId 
          ? { ...patient, followUpStatus: 'contacted' } 
          : patient
      )
    );
  };
  
  const handleDismissPatient = (patientId: string, sendReview: boolean) => {
    toast({
      title: "Patient dismissed from follow-ups",
      description: sendReview 
        ? "Review request has been sent" 
        : "Patient will no longer appear in the follow-up list",
    });
    
    setPatients(prev => 
      prev.map(patient => 
        patient.id === patientId 
          ? { ...patient, followUpStatus: 'dismissed' } 
          : patient
      )
    );
  };
  
  const handleRemindLater = (patientId: string, days: number) => {
    toast({
      title: "Reminder set",
      description: `You'll be reminded to follow up in ${days} days`,
    });
    
    // In a real app, this would set a reminder
  };
  
  const handleToggleSelectPatient = (patientId: string, selected: boolean) => {
    if (selected) {
      setSelectedPatients(prev => [...prev, patientId]);
    } else {
      setSelectedPatients(prev => prev.filter(id => id !== patientId));
    }
  };
  
  const handleSelectAllPatients = () => {
    if (selectedPatients.length === filteredPatients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(filteredPatients.map(p => p.id));
    }
  };
  
  const handleBulkAction = (action: string) => {
    if (selectedPatients.length === 0) {
      toast({
        title: "No patients selected",
        description: "Please select patients first",
        variant: "destructive"
      });
      return;
    }
    
    if (action === 'message') {
      toast({
        title: "Bulk messaging",
        description: `Preparing messages for ${selectedPatients.length} patients`,
      });
    } else if (action === 'dismiss') {
      toast({
        title: "Bulk dismiss",
        description: `Dismissed ${selectedPatients.length} patients from follow-up`,
      });
      
      setPatients(prev => 
        prev.map(patient => 
          selectedPatients.includes(patient.id) 
            ? { ...patient, followUpStatus: 'dismissed' } 
            : patient
        )
      );
      
      setSelectedPatients([]);
    }
  };

  // Patient counts for tabs
  const counts = {
    all: patients.length,
    initial: patients.filter(p => p.isInitialAppointment && p.daysSinceFirstAppointment <= 14).length,
    '30-day': patients.filter(p => p.daysSinceLastAppointment >= 14 && p.daysSinceLastAppointment <= 30).length,
    '90-day': patients.filter(p => p.daysSinceLastAppointment >= 30 && p.daysSinceLastAppointment <= 90).length,
    cancelled: patients.filter(p => p.hasRecentCancellation).length
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient Follow-Up Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Manage patient follow-ups and increase rebooking rates
        </p>
      </div>
      
      {/* Statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white border-beach-sand shadow">
          <CardContent className="flex p-3 items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
              <h2 className="text-2xl font-bold">{patients.length}</h2>
            </div>
            <Users className="h-8 w-8 text-blue-500 opacity-80" />
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardContent className="flex p-3 items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Initial (2w)</p>
              <h2 className="text-2xl font-bold text-blue-700">{counts.initial}</h2>
            </div>
            <UserCheck className="h-8 w-8 text-blue-500 opacity-80" />
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200 shadow-sm">
          <CardContent className="flex p-3 items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">30 Day Gap</p>
              <h2 className="text-2xl font-bold text-yellow-700">{counts['30-day']}</h2>
            </div>
            <Clock className="h-8 w-8 text-yellow-500 opacity-80" />
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50 border-amber-200 shadow-sm">
          <CardContent className="flex p-3 items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">90 Day Gap</p>
              <h2 className="text-2xl font-bold text-amber-700">{counts['90-day']}</h2>
            </div>
            <CalendarClock className="h-8 w-8 text-amber-500 opacity-80" />
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200 shadow-sm">
          <CardContent className="flex p-3 items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Cancelled</p>
              <h2 className="text-2xl font-bold text-red-700">{counts.cancelled}</h2>
            </div>
            <CalendarX className="h-8 w-8 text-red-500 opacity-80" />
          </CardContent>
        </Card>
      </div>
      
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients, notes or contact details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border-beach-sand"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="border-beach-ocean/50 text-beach-ocean hover:bg-beach-ocean/10 gap-1.5"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </Button>
          
          <Button 
            variant={selectedPatients.length > 0 ? "default" : "outline"}
            className={selectedPatients.length > 0 
              ? "bg-beach-ocean hover:bg-beach-ocean/90 text-white" 
              : "border-gray-200 text-gray-700"
            }
            onClick={handleSelectAllPatients}
          >
            {selectedPatients.length === filteredPatients.length && filteredPatients.length > 0 
              ? "Deselect All" 
              : "Select All"}
          </Button>
        </div>
      </div>
      
      {/* Filters panel - collapsible */}
      {showFilters && (
        <PatientFilters 
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          practitionerFilter={practitionerFilter}
          setPractitionerFilter={setPractitionerFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      )}
      
      {/* Selected patients actions */}
      {selectedPatients.length > 0 && (
        <Card className="border-beach-ocean bg-beach-foam/50">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-beach-ocean" />
              <span className="font-medium">{selectedPatients.length} patients selected</span>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => handleBulkAction('dismiss')}
              >
                Dismiss All
              </Button>
              <Button 
                size="sm"
                className="bg-beach-ocean hover:bg-beach-ocean/90"
                onClick={() => handleBulkAction('message')}
              >
                Message All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Main tabs and patient cards */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Patient Follow-ups</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4 px-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 grid grid-cols-5 w-full">
              <TabsTrigger value="all" className="flex items-center justify-center gap-1">
                All
                <Badge variant="secondary">{counts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="initial" className="flex items-center justify-center gap-1">
                Initial 2w
                <Badge variant="secondary">{counts.initial}</Badge>
              </TabsTrigger>
              <TabsTrigger value="30-day" className="flex items-center justify-center gap-1">
                30d Gap
                <Badge variant="secondary">{counts['30-day']}</Badge>
              </TabsTrigger>
              <TabsTrigger value="90-day" className="flex items-center justify-center gap-1">
                90d Gap
                <Badge variant="secondary">{counts['90-day']}</Badge>
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex items-center justify-center gap-1">
                Cancelled
                <Badge variant="secondary">{counts.cancelled}</Badge>
              </TabsTrigger>
            </TabsList>
        
            <TabsContent value={activeTab} className="mt-0">
              <ScrollArea className="h-[calc(100vh-350px)] pr-4">
                {filteredPatients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                    <h3 className="font-medium text-lg mb-1">No patients found</h3>
                    <p className="text-muted-foreground max-w-md">
                      Try changing your filters or search term to find what you're looking for.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredPatients.map(patient => (
                      <PatientCard
                        key={patient.id}
                        patient={patient}
                        onSendFollowUp={handleSendFollowUp}
                        onDismiss={handleDismissPatient}
                        onRemindLater={handleRemindLater}
                        selected={selectedPatients.includes(patient.id)}
                        onSelect={handleToggleSelectPatient}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              {filteredPatients.length > 10 && (
                <div className="flex justify-center mt-4">
                  <Button variant="ghost" className="text-muted-foreground flex items-center gap-1">
                    <ArrowDown className="h-3.5 w-3.5" />
                    Load more
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientFollowUp;
