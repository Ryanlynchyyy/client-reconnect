
import React, { useState, useMemo } from 'react';
import { useFollowUp } from '@/contexts/FollowUpContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PatientWithFollowUpStatus } from '@/types/clinikoTypes';
import { 
  Check, 
  MessageSquare, 
  RefreshCw, 
  Search, 
  X, 
  Calendar, 
  Clock, 
  Filter,
  ChevronDown,
  BarChart
} from 'lucide-react';
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
  const [selectedTab, setSelectedTab] = useState('pending');
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

  // Group patients by days range
  const rangePatients = useMemo(() => {
    const ranges = {
      '30-60': sortedPatients.filter(p => 
        p.daysSinceLastAppointment !== null && 
        p.daysSinceLastAppointment >= 30 &&
        p.daysSinceLastAppointment < 60
      ),
      '60-90': sortedPatients.filter(p => 
        p.daysSinceLastAppointment !== null && 
        p.daysSinceLastAppointment >= 60 &&
        p.daysSinceLastAppointment < 90
      ),
      '90+': sortedPatients.filter(p => 
        p.daysSinceLastAppointment !== null && 
        p.daysSinceLastAppointment >= 90
      ),
    };
    
    return ranges;
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Patient Follow-Ups</h2>
          <p className="text-muted-foreground">
            {filteredPatients.length} patients haven't returned in {filterDays}+ days
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          <Link to="/analytics">
            <Button variant="default" className="bg-cliniko-primary hover:bg-cliniko-accent flex items-center gap-1">
              <BarChart size={16} />
              <span className="hidden sm:inline">Analytics</span>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-800">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Search & Status Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Search */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                placeholder="Search by name or phone number..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-8 w-full"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter size={14} />
                Filters
                <ChevronDown size={14} className={cn(isFilterOpen && "transform rotate-180")} />
              </Button>
              
              <Badge variant="outline" className="flex items-center gap-1">
                Days: {filterDays}+
              </Badge>
              
              {isFilterOpen && (
                <div className="w-full mt-2 bg-gray-50 p-3 rounded-md grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Days Since Last Visit</p>
                    <div className="flex space-x-1">
                      <Button 
                        variant={filterDays === 30 ? "default" : "outline"}
                        onClick={() => setFilterDays(30)}
                        size="sm"
                        className="flex-1"
                      >
                        30+
                      </Button>
                      <Button 
                        variant={filterDays === 60 ? "default" : "outline"}
                        onClick={() => setFilterDays(60)}
                        size="sm"
                        className="flex-1"
                      >
                        60+
                      </Button>
                      <Button 
                        variant={filterDays === 90 ? "default" : "outline"}
                        onClick={() => setFilterDays(90)}
                        size="sm"
                        className="flex-1"
                      >
                        90+
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Sort By</p>
                    <div className="flex space-x-1">
                      <Button 
                        variant={sortBy === 'date' ? "default" : "outline"}
                        onClick={() => setSortBy('date')}
                        size="sm"
                        className="flex-1"
                      >
                        <Calendar size={14} className="mr-1 inline" />
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
                    <p className="text-sm font-medium mb-2">Order</p>
                    <div className="flex space-x-1">
                      <Button 
                        variant={sortOrder === 'asc' ? "default" : "outline"}
                        onClick={() => setSortOrder('asc')}
                        size="sm"
                        className="flex-1"
                      >
                        A-Z
                      </Button>
                      <Button 
                        variant={sortOrder === 'desc' ? "default" : "outline"}
                        onClick={() => setSortOrder('desc')}
                        size="sm"
                        className="flex-1"
                      >
                        Z-A
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Status Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Patient Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center">
              <StatusBadge count={groupedPatients.pending.length} label="Pending" color="bg-blue-100 text-blue-800" />
              <StatusBadge count={groupedPatients.contacted.length} label="Contacted" color="bg-amber-100 text-amber-800" />
              <StatusBadge count={groupedPatients.dismissed.length} label="Dismissed" color="bg-gray-100 text-gray-800" />
            </div>
            
            <div className="mt-3 pt-3 border-t">
              <div className="grid grid-cols-3 gap-2 text-center">
                <StatusBadge count={rangePatients['30-60'].length} label="30-60 days" color="bg-blue-50 text-blue-800" />
                <StatusBadge count={rangePatients['60-90'].length} label="60-90 days" color="bg-amber-50 text-amber-800" />
                <StatusBadge count={rangePatients['90+'].length} label="90+ days" color="bg-red-50 text-red-800" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Patient Lists */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              Pending
              <Badge className="bg-blue-500 text-white ml-1">{groupedPatients.pending.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="contacted" className="flex items-center gap-2">
              Contacted
              <Badge className="bg-amber-500 text-white ml-1">{groupedPatients.contacted.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="dismissed" className="flex items-center gap-2">
              Dismissed
              <Badge className="bg-gray-500 text-white ml-1">{groupedPatients.dismissed.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              All
              <Badge className="bg-gray-200 text-gray-700 ml-1">{groupedPatients.all.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {Object.entries(groupedPatients).map(([status, patients]) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {patients.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {status === 'all' || status === 'pending' ? (
                    <PatientGroup 
                      title="Priority Follow-Ups"
                      subtitle="Patients who need immediate attention"
                      patients={patients.filter(p => 
                        p.daysSinceLastAppointment && p.daysSinceLastAppointment > 90
                      )}
                      onDismiss={handleDismissRequest}
                      onSendSMS={handleSendSMS}
                    />
                  ) : null}
                  
                  <PatientGroup 
                    title="Patient List"
                    subtitle={`${patients.length} patient${patients.length !== 1 ? 's' : ''} in this category`}
                    patients={patients}
                    onDismiss={handleDismissRequest}
                    onSendSMS={handleSendSMS}
                  />
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
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
                className="w-full bg-cliniko-primary hover:bg-cliniko-accent"
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

// Helper Components
const StatusBadge: React.FC<{count: number, label: string, color: string}> = ({count, label, color}) => (
  <div className={`p-2 rounded-md ${color}`}>
    <div className="text-lg font-semibold">{count}</div>
    <div className="text-xs">{label}</div>
  </div>
);

const LoadingSkeleton = () => (
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
);

const EmptyState = () => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center py-10">
      <div className="rounded-full bg-gray-100 p-3 mb-4">
        <Clock size={24} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold mb-1">No patients found</h3>
      <p className="text-muted-foreground text-center max-w-md">
        There are no patients in this category matching your current filters.
      </p>
    </CardContent>
  </Card>
);

interface PatientGroupProps {
  title: string;
  subtitle?: string;
  patients: PatientWithFollowUpStatus[];
  onDismiss: (patient: PatientWithFollowUpStatus) => void;
  onSendSMS: (patient: PatientWithFollowUpStatus) => void;
}

const PatientGroup: React.FC<PatientGroupProps> = ({ 
  title, 
  subtitle, 
  patients, 
  onDismiss,
  onSendSMS
}) => {
  // Only show up to 10 patients and indicate there are more
  const displayPatients = patients.slice(0, 10);
  const hasMore = patients.length > 10;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-0">
        {displayPatients.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No patients in this category</p>
        ) : (
          <div className="space-y-3">
            {displayPatients.map(patient => (
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
      {hasMore && (
        <CardFooter className="pt-0 pb-3 flex justify-center">
          <Button variant="ghost" size="sm">
            View {patients.length - 10} more patients
          </Button>
        </CardFooter>
      )}
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
    ? format(new Date(patient.lastAppointmentDate), 'MMM d, yyyy')
    : 'Unknown';

  const phoneNumbers = patient.patient_phone_numbers || [];
  const hasMobile = phoneNumbers.some(p => p.phone_type === 'Mobile');
  const primaryPhone = phoneNumbers.find(p => p.is_primary)?.number || 
                      phoneNumbers[0]?.number || 'No phone number';
  
  const statusColor = {
    'pending': 'border-blue-400',
    'contacted': 'border-amber-400',
    'dismissed': 'border-gray-400'
  }[patient.followUpStatus];

  return (
    <div className={`flex flex-col sm:flex-row justify-between bg-white rounded-lg border-l-4 ${statusColor} shadow-sm hover:shadow-md transition-shadow overflow-hidden`}>
      <div className="p-3 flex-1">
        <h3 className="font-medium text-lg">
          {patient.first_name} {patient.last_name}
        </h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {lastAppointmentDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {patient.daysSinceLastAppointment || 'N/A'} days ago
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={14} />
            {primaryPhone}
          </span>
        </div>
      </div>
      
      <div className="flex sm:flex-col justify-end p-2 bg-gray-50 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-gray-600 hover:text-gray-800"
          onClick={() => onDismiss(patient)}
        >
          <Check size={14} className="mr-1" />
          <span>Dismiss</span>
        </Button>
        
        <Button
          variant="default"
          size="sm"
          className="bg-cliniko-primary hover:bg-cliniko-accent"
          disabled={!hasMobile || patient.followUpStatus === 'contacted'}
          onClick={() => onSendSMS(patient)}
        >
          <MessageSquare size={14} className="mr-1" />
          <span>SMS</span>
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
