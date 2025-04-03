
import React, { useState, useMemo } from 'react';
import { useFollowUp } from '@/contexts/FollowUpContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PatientWithFollowUpStatus } from '@/types/clinikoTypes';
import { Check, Clock, MessageSquare, RefreshCw, Filter, Search, X, ChevronDown, Calendar, PieChart } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const {
    filteredPatients,
    isLoading,
    error,
    refreshData,
    dismissPatient,
    markAsContacted,
    filterDays,
    setFilterDays
  } = useFollowUp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTab, setSelectedTab] = useState('all');
  const [dismissDialogOpen, setDismissDialogOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<PatientWithFollowUpStatus | null>(null);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('appointment');
  const { toast } = useToast();

  // Filter patients by search term
  const searchResults = useMemo(() => {
    if (!searchTerm) return filteredPatients;
    
    return filteredPatients.filter(patient => 
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.patient_phone_numbers && patient.patient_phone_numbers.some(ph => 
        ph.number.includes(searchTerm)
      ))
    );
  }, [filteredPatients, searchTerm]);

  // Sort patients
  const sortedPatients = useMemo(() => {
    return [...searchResults].sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      } else {
        // Sort by days since last appointment
        const dateA = a.daysSinceLastAppointment || 0;
        const dateB = b.daysSinceLastAppointment || 0;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
  }, [searchResults, sortBy, sortOrder]);

  // Group patients by status
  const groupedPatients = useMemo(() => {
    return {
      all: sortedPatients,
      pending: sortedPatients.filter(p => p.followUpStatus === 'pending'),
      contacted: sortedPatients.filter(p => p.followUpStatus === 'contacted'),
      dismissed: sortedPatients.filter(p => p.followUpStatus === 'dismissed'),
    };
  }, [sortedPatients]);

  // Group patients by days range for display
  const rangePatients = useMemo(() => {
    return {
      '30-60 days': sortedPatients.filter(patient => 
        patient.daysSinceLastAppointment !== null && 
        patient.daysSinceLastAppointment >= 30 &&
        patient.daysSinceLastAppointment < 60
      ),
      '60-90 days': sortedPatients.filter(patient => 
        patient.daysSinceLastAppointment !== null && 
        patient.daysSinceLastAppointment >= 60 &&
        patient.daysSinceLastAppointment < 90
      ),
      '90+ days': sortedPatients.filter(patient => 
        patient.daysSinceLastAppointment !== null && 
        patient.daysSinceLastAppointment >= 90
      ),
    };
  }, [sortedPatients]);
  
  const handleRefresh = async () => {
    await refreshData();
  };

  const handleDismissRequest = (patient: PatientWithFollowUpStatus) => {
    setCurrentPatient(patient);
    setDismissDialogOpen(true);
  };
  
  const handleConfirmDismiss = (sendReviewRequest: boolean) => {
    if (!currentPatient) return;
    
    dismissPatient(currentPatient.id);
    setDismissDialogOpen(false);
    
    if (sendReviewRequest) {
      toast({
        title: "Review request sent",
        description: `Review request has been sent to ${currentPatient.first_name} ${currentPatient.last_name}`,
      });
    }
  };

  const handleSendSMS = (patient: PatientWithFollowUpStatus) => {
    setCurrentPatient(patient);
    setSmsModalOpen(true);
  };
  
  const handleConfirmSMS = () => {
    if (!currentPatient) return;
    
    markAsContacted(currentPatient.id);
    setSmsModalOpen(false);
    
    toast({
      title: "Follow-up SMS sent",
      description: `${selectedTemplate} template sent to ${currentPatient.first_name} ${currentPatient.last_name}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Follow-Ups</h1>
          <p className="text-gray-600">
            {filteredPatients.length} patients haven't returned in {filterDays}+ days
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh Data
          </Button>
          
          <Link to="/analytics">
            <Button variant="default" className="bg-cliniko-primary hover:bg-cliniko-accent flex items-center gap-1">
              <PieChart size={16} />
              Analytics
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Search & Filter Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Search size={18} className="mr-2" /> 
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Search by name or phone number..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter size={14} />
                Filters
                <ChevronDown size={14} className={isFilterOpen ? "transform rotate-180" : ""} />
              </Button>
              
              {searchTerm && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Search: {searchTerm}
                  <X 
                    size={14} 
                    className="ml-1 cursor-pointer" 
                    onClick={() => setSearchTerm('')}
                  />
                </Badge>
              )}
              
              <Badge variant="outline" className="flex items-center gap-1">
                Days: {filterDays}+
                <X 
                  size={14} 
                  className="ml-1 cursor-pointer" 
                  onClick={() => setFilterDays(30)}
                />
              </Badge>
              
              <Badge variant="outline" className="flex items-center gap-1">
                Sort: {sortBy === 'date' ? 'Date' : 'Name'} ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
              </Badge>
            </div>
            
            {isFilterOpen && (
              <div className="bg-gray-50 p-4 rounded-md grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                <div>
                  <p className="text-sm font-medium mb-2">Absence Period</p>
                  <div className="flex space-x-2">
                    <Button 
                      variant={filterDays === 30 ? "default" : "outline"}
                      onClick={() => setFilterDays(30)}
                      size="sm"
                      className="flex-1"
                    >
                      30+ Days
                    </Button>
                    <Button 
                      variant={filterDays === 60 ? "default" : "outline"}
                      onClick={() => setFilterDays(60)}
                      size="sm"
                      className="flex-1"
                    >
                      60+ Days
                    </Button>
                    <Button 
                      variant={filterDays === 90 ? "default" : "outline"}
                      onClick={() => setFilterDays(90)}
                      size="sm"
                      className="flex-1"
                    >
                      90+ Days
                    </Button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Sort By</p>
                  <div className="flex space-x-2">
                    <Button 
                      variant={sortBy === 'date' ? "default" : "outline"}
                      onClick={() => setSortBy('date')}
                      size="sm"
                      className="flex-1"
                    >
                      <Calendar size={14} className="mr-1" />
                      Date
                    </Button>
                    <Button 
                      variant={sortBy === 'name' ? "default" : "outline"}
                      onClick={() => setSortBy('name')}
                      size="sm"
                      className="flex-1"
                    >
                      Name
                    </Button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Sort Order</p>
                  <div className="flex space-x-2">
                    <Button 
                      variant={sortOrder === 'asc' ? "default" : "outline"}
                      onClick={() => setSortOrder('asc')}
                      size="sm"
                      className="flex-1"
                    >
                      Ascending
                    </Button>
                    <Button 
                      variant={sortOrder === 'desc' ? "default" : "outline"}
                      onClick={() => setSortOrder('desc')}
                      size="sm"
                      className="flex-1"
                    >
                      Descending
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Status Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Patient Status Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 p-3 rounded-md text-center">
                <div className="text-2xl font-bold text-blue-600">{groupedPatients.pending.length}</div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md text-center">
                <div className="text-2xl font-bold text-amber-500">{groupedPatients.contacted.length}</div>
                <div className="text-xs text-gray-600">Contacted</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md text-center">
                <div className="text-2xl font-bold text-gray-500">{groupedPatients.dismissed.length}</div>
                <div className="text-xs text-gray-600">Dismissed</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-semibold">{rangePatients['30-60 days'].length}</div>
                  <div className="text-xs text-gray-600">30-60 days</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{rangePatients['60-90 days'].length}</div>
                  <div className="text-xs text-gray-600">60-90 days</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{rangePatients['90+ days'].length}</div>
                  <div className="text-xs text-gray-600">90+ days</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}
      
      {isLoading ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <Tabs 
            defaultValue="all" 
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all" className="relative">
                All Patients
                <Badge className="ml-1 bg-gray-200 text-gray-700 rounded-full absolute top-0 right-1 transform -translate-y-1/2 translate-x-1/2">
                  {groupedPatients.all.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                Pending
                <Badge className="ml-1 bg-blue-500 text-white rounded-full absolute top-0 right-1 transform -translate-y-1/2 translate-x-1/2">
                  {groupedPatients.pending.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="contacted" className="relative">
                Contacted
                <Badge className="ml-1 bg-amber-500 text-white rounded-full absolute top-0 right-1 transform -translate-y-1/2 translate-x-1/2">
                  {groupedPatients.contacted.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="dismissed" className="relative">
                Dismissed
                <Badge className="ml-1 bg-gray-500 text-white rounded-full absolute top-0 right-1 transform -translate-y-1/2 translate-x-1/2">
                  {groupedPatients.dismissed.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {['all', 'pending', 'contacted', 'dismissed'].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-0">
                {groupedPatients[tab as keyof typeof groupedPatients].length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="rounded-full bg-gray-100 p-3 mb-4">
                        <Clock size={24} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-1">No patients found</h3>
                      <p className="text-gray-500 text-center max-w-md">
                        There are no patients in this category matching your current filters.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <PatientGroup 
                      title="30-60 Days"
                      description="Patients who haven't returned in 30-60 days"
                      patients={rangePatients['30-60 days'].filter(p => 
                        tab === 'all' || p.followUpStatus === tab
                      )}
                      onDismiss={handleDismissRequest}
                      onSendSMS={handleSendSMS}
                    />
                    
                    <PatientGroup 
                      title="60-90 Days"
                      description="Patients who haven't returned in 60-90 days"
                      patients={rangePatients['60-90 days'].filter(p => 
                        tab === 'all' || p.followUpStatus === tab
                      )}
                      onDismiss={handleDismissRequest}
                      onSendSMS={handleSendSMS}
                    />
                    
                    <PatientGroup 
                      title="90+ Days"
                      description="Patients who haven't returned in over 90 days"
                      patients={rangePatients['90+ days'].filter(p => 
                        tab === 'all' || p.followUpStatus === tab
                      )}
                      onDismiss={handleDismissRequest}
                      onSendSMS={handleSendSMS}
                    />
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
      
      {/* Dismiss Confirmation Dialog */}
      <Dialog open={dismissDialogOpen} onOpenChange={setDismissDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dismiss this patient?</DialogTitle>
            <DialogDescription>
              Would you like to dismiss this patient or send them a review request?
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Button
                variant="default"
                className="w-full bg-blue-500 hover:bg-blue-600"
                onClick={() => handleConfirmDismiss(true)}
              >
                Dismiss & Send Review Request
              </Button>
              
              <Button
                variant="outline" 
                className="w-full"
                onClick={() => handleConfirmDismiss(false)}
              >
                Just Dismiss
              </Button>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDismissDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SMS Template Selection Dialog */}
      <Dialog open={smsModalOpen} onOpenChange={setSmsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Follow-up SMS</DialogTitle>
            <DialogDescription>
              Select a template to send to {currentPatient?.first_name} {currentPatient?.last_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="template" className="text-sm font-medium">
                Template
              </label>
              <Select 
                value={selectedTemplate} 
                onValueChange={setSelectedTemplate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointment">Book Appointment</SelectItem>
                  <SelectItem value="checkup">Checkup Reminder</SelectItem>
                  <SelectItem value="discount">Special Offer</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-sm">
                  {selectedTemplate === 'appointment' && (
                    <>Hi {currentPatient?.first_name}, we noticed it's been a while since your last visit. Would you like to schedule a new appointment? Click here to book: [link]</>
                  )}
                  {selectedTemplate === 'checkup' && (
                    <>Hi {currentPatient?.first_name}, this is a friendly reminder that it's time for your regular checkup. Please call us at (123) 456-7890 to schedule.</>
                  )}
                  {selectedTemplate === 'discount' && (
                    <>Hi {currentPatient?.first_name}, we're offering a special 15% discount for returning patients this month! Book your appointment now: [link]</>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSmsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              className="bg-cliniko-primary hover:bg-cliniko-accent"
              onClick={handleConfirmSMS}
            >
              Send SMS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface PatientGroupProps {
  title: string;
  description: string;
  patients: PatientWithFollowUpStatus[];
  onDismiss: (patient: PatientWithFollowUpStatus) => void;
  onSendSMS: (patient: PatientWithFollowUpStatus) => void;
}

const PatientGroup: React.FC<PatientGroupProps> = ({ 
  title, 
  description, 
  patients, 
  onDismiss,
  onSendSMS
}) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant="outline" className="text-lg font-semibold">
            {patients.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto max-h-[500px] pt-0">
        {patients.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No patients in this category</p>
        ) : (
          <div className="space-y-4">
            {patients.map(patient => (
              <PatientCard 
                key={patient.id} 
                patient={patient}
                onDismiss={onDismiss}
                onSendSMS={onSendSMS}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface PatientCardProps {
  patient: PatientWithFollowUpStatus;
  onDismiss: (patient: PatientWithFollowUpStatus) => void;
  onSendSMS: (patient: PatientWithFollowUpStatus) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onDismiss, onSendSMS }) => {
  const lastAppointmentDate = patient.lastAppointmentDate 
    ? format(new Date(patient.lastAppointmentDate), 'PPP')
    : 'Unknown';

  const phoneNumbers = patient.patient_phone_numbers || [];
  const hasMobile = phoneNumbers.some(p => p.phone_type === 'Mobile');
  
  // Format phone number for display
  const primaryPhone = phoneNumbers.find(p => p.is_primary)?.number || 
                      phoneNumbers[0]?.number || 'No phone number';

  return (
    <Card className="overflow-hidden border-l-4 hover:shadow-md transition-shadow" style={{
      borderLeftColor: 
        patient.followUpStatus === 'pending' ? '#3b82f6' : 
        patient.followUpStatus === 'contacted' ? '#f59e0b' : 
        '#6b7280'
    }}>
      <div className="flex flex-col">
        <div className="flex justify-between items-start p-4">
          <div>
            <h3 className="text-xl font-medium">
              {patient.first_name} {patient.last_name}
            </h3>
            <div className="text-sm text-gray-500 mt-1 space-y-1">
              <p className="flex items-center gap-1">
                <Calendar size={14} />
                Last visit: {lastAppointmentDate}
              </p>
              <p className="flex items-center gap-1">
                <Clock size={14} />
                {patient.daysSinceLastAppointment || 'N/A'} days ago
              </p>
              <p className="flex items-center gap-1">
                <MessageSquare size={14} />
                {primaryPhone}
              </p>
            </div>
          </div>
          
          <Badge 
            className={cn(
              "whitespace-nowrap",
              patient.followUpStatus === 'contacted' && 'bg-amber-500', 
              patient.followUpStatus === 'dismissed' && 'bg-gray-500'
            )}
          >
            {patient.followUpStatus === 'pending' && 'Needs Follow-Up'}
            {patient.followUpStatus === 'contacted' && 'Contacted'}
            {patient.followUpStatus === 'dismissed' && 'Dismissed'}
          </Badge>
        </div>
        
        <div className="bg-gray-50 p-3 flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-800"
            onClick={() => onDismiss(patient)}
          >
            <Check size={16} className="mr-1" />
            <span>Dismiss</span>
          </Button>
          
          <Button
            variant="default"
            size="sm"
            className="bg-cliniko-primary hover:bg-cliniko-accent"
            disabled={!hasMobile || patient.followUpStatus === 'contacted'}
            onClick={() => onSendSMS(patient)}
          >
            <MessageSquare size={16} className="mr-1" />
            <span>Send SMS</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Dashboard;
