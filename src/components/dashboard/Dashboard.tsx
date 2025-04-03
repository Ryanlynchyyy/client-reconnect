
import React, { useState, useMemo, useEffect } from 'react';
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
  BarChart,
  ThumbsUp,
  Bell,
  CalendarX2,
  UserX,
  ListFilter,
  CalendarCheck
} from 'lucide-react';
import { format, subWeeks, subDays, isWithinInterval, startOfDay } from 'date-fns';
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
import { Textarea } from '@/components/ui/textarea';
import { AppointmentList } from '../cancelled-appointments/AppointmentList';

interface DashboardProps {
  includeGapDetection?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ includeGapDetection = false }) => {
  const {
    filteredPatients,
    isLoading,
    error,
    refreshData,
    dismissPatient,
    markAsContacted,
    filterDays,
    setFilterDays,
    remindLater,
    practitioners,
    selectedPractitionerId,
    setSelectedPractitionerId
  } = useFollowUp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTab, setSelectedTab] = useState('pending');
  const [timeRange, setTimeRange] = useState<'all' | '2-weeks' | 'this-week' | 'today'>('all');
  const [appointmentCountFilter, setAppointmentCountFilter] = useState<'all' | '1-2'>('all');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<'all' | 'cancelled' | 'no-show'>('all');
  
  const [dismissDialogOpen, setDismissDialogOpen] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  
  const [currentPatient, setCurrentPatient] = useState<PatientWithFollowUpStatus | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('appointment');
  const [customMessage, setCustomMessage] = useState('');
  const { toast } = useToast();

  // Mock cancelled appointments data for demo
  const [cancelledAppointments, setCancelledAppointments] = useState([
    {
      id: 1,
      patientId: 101,
      patientName: "John Smith",
      lastAppointmentDate: new Date().toISOString(),
      gapDays: 5,
      status: "cancelled",
      appointmentType: "Standard consultation",
      phone: "0412 345 678",
      email: "john@example.com",
      practitionerId: 1,
      practitionerName: "Ben Smith"
    },
    {
      id: 2,
      patientId: 102,
      patientName: "Sarah Johnson",
      lastAppointmentDate: subDays(new Date(), 3).toISOString(),
      gapDays: 18,
      status: "missed",
      appointmentType: "Follow-up session",
      phone: "0423 456 789",
      email: "sarah@example.com",
      practitionerId: 2,
      practitionerName: "Josh Adams"
    },
    {
      id: 3,
      patientId: 103,
      patientName: "Michael Brown",
      lastAppointmentDate: subDays(new Date(), 14).toISOString(),
      gapDays: 14,
      status: "cancelled",
      appointmentType: "Initial assessment",
      phone: "0434 567 890",
      email: "michael@example.com",
      practitionerId: 1,
      practitionerName: "Ben Smith"
    },
    {
      id: 4,
      patientId: 104,
      patientName: "Lisa Williams",
      lastAppointmentDate: subDays(new Date(), 21).toISOString(),
      gapDays: 21,
      status: "missed",
      appointmentType: "Therapeutic session",
      phone: "0445 678 901",
      email: "lisa@example.com",
      practitionerId: 2,
      practitionerName: "Josh Adams"
    },
    {
      id: 5,
      patientId: 105,
      patientName: "David Jones",
      lastAppointmentDate: subDays(new Date(), 7).toISOString(),
      gapDays: 7,
      status: "large-gap",
      appointmentType: "Physiotherapy",
      phone: "0456 789 012",
      email: "david@example.com",
      practitionerId: 1, 
      practitionerName: "Ben Smith"
    }
  ]);

  const searchResults = useMemo(() => {
    if (!searchTerm) return filteredPatients;
    
    return filteredPatients.filter(patient => 
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.patient_phone_numbers && patient.patient_phone_numbers.some(ph => 
        ph.number.includes(searchTerm)
      ))
    );
  }, [filteredPatients, searchTerm]);

  // Apply time range filter
  const timeFilteredPatients = useMemo(() => {
    if (timeRange === 'all') return searchResults;
    
    const now = new Date();
    
    return searchResults.filter(patient => {
      if (!patient.lastAppointmentDate) return false;
      const lastVisit = new Date(patient.lastAppointmentDate);
      
      if (timeRange === '2-weeks') {
        return isWithinInterval(lastVisit, {
          start: subWeeks(now, 2),
          end: now
        });
      } else if (timeRange === 'this-week') {
        return isWithinInterval(lastVisit, {
          start: subDays(now, 7),
          end: now
        });
      } else if (timeRange === 'today') {
        return isWithinInterval(lastVisit, {
          start: startOfDay(now),
          end: now
        });
      }
      
      return true;
    });
  }, [searchResults, timeRange]);

  // Apply appointment count filter
  const countFilteredPatients = useMemo(() => {
    if (appointmentCountFilter === 'all') return timeFilteredPatients;
    
    // In a real implementation, we would check the actual appointment count
    // For demo purposes, we'll just use a random subset
    if (appointmentCountFilter === '1-2') {
      return timeFilteredPatients.filter(p => p.id % 3 !== 0); // Simple mock filter
    }
    
    return timeFilteredPatients;
  }, [timeFilteredPatients, appointmentCountFilter]);
  
  // Apply appointment status filter
  const statusFilteredPatients = useMemo(() => {
    if (appointmentStatusFilter === 'all') return countFilteredPatients;
    
    // In a real implementation, we would check the actual appointment status
    // For demo purposes, we'll filter based on patient ID
    if (appointmentStatusFilter === 'cancelled') {
      return countFilteredPatients.filter(p => p.id % 2 === 0); // Simple mock filter
    } else if (appointmentStatusFilter === 'no-show') {
      return countFilteredPatients.filter(p => p.id % 3 === 0); // Simple mock filter
    }
    
    return countFilteredPatients;
  }, [countFilteredPatients, appointmentStatusFilter]);

  const sortedPatients = useMemo(() => {
    return [...statusFilteredPatients].sort((a, b) => {
      if (selectedPractitionerId) {
        const aHasPractitioner = a.assignedPractitionerId === selectedPractitionerId;
        const bHasPractitioner = b.assignedPractitionerId === selectedPractitionerId;
        
        if (aHasPractitioner && !bHasPractitioner) return -1;
        if (!aHasPractitioner && bHasPractitioner) return 1;
      }
      
      if (sortBy === 'name') {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      } else {
        const dateA = a.daysSinceLastAppointment || 0;
        const dateB = b.daysSinceLastAppointment || 0;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
  }, [statusFilteredPatients, sortBy, sortOrder, selectedPractitionerId]);

  const groupedPatients = useMemo(() => {
    return {
      all: sortedPatients,
      pending: sortedPatients.filter(p => p.followUpStatus === 'pending'),
      contacted: sortedPatients.filter(p => p.followUpStatus === 'contacted'),
      dismissed: sortedPatients.filter(p => p.followUpStatus === 'dismissed'),
    };
  }, [sortedPatients]);

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
    const treatmentText = patient.treatmentNotes || 'your treatment';
    setCustomMessage(`Hi ${patient.first_name}, we hope you've been well since ${treatmentText}. Would you like to schedule a follow-up appointment?`);
    setSmsModalOpen(true);
  };
  
  const handleConfirmSMS = () => {
    if (!currentPatient) return;
    
    markAsContacted(currentPatient.id);
    setSmsModalOpen(false);
    
    toast({
      title: "Follow-up SMS sent",
      description: `Message sent to ${currentPatient.first_name} ${currentPatient.last_name}`,
    });
  };

  const handleSendMessageToGapPatient = (patientId: number, patientName: string) => {
    toast({
      title: "SMS scheduled",
      description: `Follow-up message will be sent to ${patientName}`,
    });
  };

  const handleRemindLater = (patient: PatientWithFollowUpStatus) => {
    setCurrentPatient(patient);
    setReminderDialogOpen(true);
  };
  
  const handleConfirmReminder = (days: number) => {
    if (!currentPatient) return;
    
    remindLater(currentPatient.id, days);
    setReminderDialogOpen(false);
    
    toast({
      title: "Reminder set",
      description: `You'll be reminded about ${currentPatient.first_name} ${currentPatient.last_name} in ${days} days`,
    });
  };

  const getPractitionerColor = (practitionerId?: number) => {
    if (!practitionerId) return "bg-gray-100 text-gray-800";
    switch (practitionerId) {
      case 1: return "bg-blue-100 text-blue-800 border-blue-300";
      case 2: return "bg-green-100 text-green-800 border-green-300";
      case 3: return "bg-purple-100 text-purple-800 border-purple-300";
      case 4: return "bg-amber-100 text-amber-800 border-amber-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-4">
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
      
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-800">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
              
              {selectedPractitionerId && (
                <Badge 
                  variant="outline" 
                  className={cn("cursor-pointer", getPractitionerColor(selectedPractitionerId))}
                  onClick={() => setSelectedPractitionerId(null)}
                >
                  {practitioners.find(p => p.id === selectedPractitionerId)?.first_name || 'Practitioner'} ×
                </Badge>
              )}

              {timeRange !== 'all' && (
                <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-300 cursor-pointer" onClick={() => setTimeRange('all')}>
                  {timeRange === '2-weeks' ? '2+ weeks' : timeRange === 'this-week' ? 'This week' : 'Today'} ×
                </Badge>
              )}
              
              {appointmentCountFilter !== 'all' && (
                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 cursor-pointer" onClick={() => setAppointmentCountFilter('all')}>
                  1-2 appointments ×
                </Badge>
              )}
              
              {appointmentStatusFilter !== 'all' && (
                <Badge variant="outline" className="bg-red-50 text-red-800 border-red-300 cursor-pointer" onClick={() => setAppointmentStatusFilter('all')}>
                  {appointmentStatusFilter === 'cancelled' ? 'Cancelled' : 'No Show'} ×
                </Badge>
              )}
              
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
                    <p className="text-sm font-medium mb-2">Practitioner</p>
                    <Select 
                      value={selectedPractitionerId?.toString() || "all"}
                      onValueChange={(value) => setSelectedPractitionerId(value === "all" ? null : parseInt(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All practitioners" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Practitioners</SelectItem>
                        {practitioners.map(practitioner => (
                          <SelectItem key={practitioner.id} value={practitioner.id.toString()}>
                            {practitioner.first_name} {practitioner.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Time Period</p>
                    <div className="flex flex-wrap gap-1">
                      <Button 
                        variant={timeRange === 'all' ? "default" : "outline"}
                        onClick={() => setTimeRange('all')}
                        size="sm"
                        className="flex-1"
                      >
                        All Time
                      </Button>
                      <Button 
                        variant={timeRange === '2-weeks' ? "default" : "outline"}
                        onClick={() => setTimeRange('2-weeks')}
                        size="sm"
                        className="flex-1"
                      >
                        2+ Weeks
                      </Button>
                      <Button 
                        variant={timeRange === 'this-week' ? "default" : "outline"}
                        onClick={() => setTimeRange('this-week')}
                        size="sm"
                        className="flex-1"
                      >
                        This Week
                      </Button>
                      <Button 
                        variant={timeRange === 'today' ? "default" : "outline"}
                        onClick={() => setTimeRange('today')}
                        size="sm"
                        className="flex-1"
                      >
                        Today
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Appointment Count</p>
                    <div className="flex space-x-1">
                      <Button 
                        variant={appointmentCountFilter === 'all' ? "default" : "outline"}
                        onClick={() => setAppointmentCountFilter('all')}
                        size="sm"
                        className="flex-1"
                      >
                        All
                      </Button>
                      <Button 
                        variant={appointmentCountFilter === '1-2' ? "default" : "outline"}
                        onClick={() => setAppointmentCountFilter('1-2')}
                        size="sm"
                        className="flex-1"
                      >
                        1-2 Visits
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Appointment Status</p>
                    <div className="flex space-x-1">
                      <Button 
                        variant={appointmentStatusFilter === 'all' ? "default" : "outline"}
                        onClick={() => setAppointmentStatusFilter('all')}
                        size="sm"
                        className="flex-1"
                      >
                        All
                      </Button>
                      <Button 
                        variant={appointmentStatusFilter === 'cancelled' ? "default" : "outline"}
                        onClick={() => setAppointmentStatusFilter('cancelled')}
                        size="sm"
                        className="flex-1"
                      >
                        <CalendarX2 className="mr-1 h-3 w-3" /> 
                        Cancelled
                      </Button>
                      <Button 
                        variant={appointmentStatusFilter === 'no-show' ? "default" : "outline"}
                        onClick={() => setAppointmentStatusFilter('no-show')}
                        size="sm"
                        className="flex-1"
                      >
                        <UserX className="mr-1 h-3 w-3" />
                        No Show
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
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
            
            <div className="mt-3 pt-3 border-t">
              <div className="grid grid-cols-3 gap-2 text-center">
                <StatusBadge count={cancelledAppointments.filter(a => a.status === "cancelled").length} 
                  label="Cancelled" color="bg-orange-50 text-orange-800" />
                <StatusBadge count={cancelledAppointments.filter(a => a.status === "missed").length} 
                  label="No Show" color="bg-red-50 text-red-800" />
                <StatusBadge 
                  count={appointmentCountFilter === '1-2' ? groupedPatients.all.filter(p => p.id % 3 !== 0).length : 0} 
                  label="1-2 Visits" 
                  color="bg-purple-50 text-purple-800" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <Tabs 
          defaultValue={includeGapDetection ? "follow-ups" : "pending"} 
          className="w-full"
        >
          <TabsList className="mb-4">
            {includeGapDetection && (
              <TabsTrigger value="follow-ups" className="flex items-center gap-2">
                <ListFilter size={14} />
                All Follow-Ups
              </TabsTrigger>
            )}
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Calendar size={14} />
              Pending
              <Badge className="bg-blue-500 text-white ml-1">{groupedPatients.pending.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="contacted" className="flex items-center gap-2">
              <MessageSquare size={14} />
              Contacted
              <Badge className="bg-amber-500 text-white ml-1">{groupedPatients.contacted.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex items-center gap-2">
              <CalendarX2 size={14} />
              Cancelled
              <Badge className="bg-orange-500 text-white ml-1">{cancelledAppointments.filter(a => a.status === "cancelled").length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="no-show" className="flex items-center gap-2">
              <UserX size={14} />
              No-Show
              <Badge className="bg-red-500 text-white ml-1">{cancelledAppointments.filter(a => a.status === "missed").length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="dismissed" className="flex items-center gap-2">
              <Check size={14} />
              Dismissed
              <Badge className="bg-gray-500 text-white ml-1">{groupedPatients.dismissed.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {includeGapDetection && (
            <TabsContent value="follow-ups" className="space-y-4">
              <DashboardSection 
                title="Weekly Follow-Ups"
                subtitle="Patients who haven't returned in 2+ weeks"
                patients={sortedPatients.filter(p => p.daysSinceLastAppointment && p.daysSinceLastAppointment >= 14)}
                icon={<CalendarCheck className="h-5 w-5 text-blue-600" />}
                accent="blue"
                onDismiss={handleDismissRequest}
                onSendSMS={handleSendSMS}
                onRemindLater={handleRemindLater}
                getPractitionerColor={getPractitionerColor}
              />
              
              <DashboardSection 
                title="New Patients (1-2 Visits Only)"
                subtitle="Patients who had only 1-2 appointments and stopped"
                patients={sortedPatients.filter(p => p.id % 3 !== 0).slice(0, 6)} // Mock filter for demo
                icon={<UserX className="h-5 w-5 text-purple-600" />}
                accent="purple"
                onDismiss={handleDismissRequest}
                onSendSMS={handleSendSMS}
                onRemindLater={handleRemindLater}
                getPractitionerColor={getPractitionerColor}
              />
              
              <DashboardSection 
                title="Cancellations & No-Shows"
                subtitle="Patients who cancelled or missed their appointments"
                patients={sortedPatients.filter(p => p.id % 2 === 0).slice(0, 6)} // Mock filter for demo
                icon={<CalendarX2 className="h-5 w-5 text-red-600" />}
                accent="red"
                onDismiss={handleDismissRequest}
                onSendSMS={handleSendSMS}
                onRemindLater={handleRemindLater}
                getPractitionerColor={getPractitionerColor}
              />
            </TabsContent>
          )}

          {/* Standard patient tabs */}
          {Object.entries(groupedPatients).map(([status, patients]) => (
            status !== 'all' && (
              <TabsContent key={status} value={status} className="space-y-4">
                {patients.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {status === 'pending' && (
                      <PatientGroup 
                        title="Priority Follow-Ups"
                        subtitle="Patients who need immediate attention"
                        patients={patients.filter(p => 
                          p.daysSinceLastAppointment && p.daysSinceLastAppointment > 90
                        )}
                        onDismiss={handleDismissRequest}
                        onSendSMS={handleSendSMS}
                        onRemindLater={handleRemindLater}
                        getPractitionerColor={getPractitionerColor}
                      />
                    )}
                    
                    <PatientGroup 
                      title="Patient List"
                      subtitle={`${patients.length} patient${patients.length !== 1 ? 's' : ''} in this category`}
                      patients={patients}
                      onDismiss={handleDismissRequest}
                      onSendSMS={handleSendSMS}
                      onRemindLater={handleRemindLater}
                      getPractitionerColor={getPractitionerColor}
                    />
                  </div>
                )}
              </TabsContent>
            )
          ))}
          
          {/* Cancelled appointments tab */}
          <TabsContent value="cancelled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cancelled Appointments</CardTitle>
                <CardDescription>
                  Patients who cancelled their appointments and may need follow-up
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AppointmentList 
                  gaps={cancelledAppointments.filter(a => a.status === "cancelled")} 
                  onSendMessage={handleSendMessageToGapPatient} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* No-show appointments tab */}
          <TabsContent value="no-show" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Missed Appointments</CardTitle>
                <CardDescription>
                  Patients who did not show up for their appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AppointmentList 
                  gaps={cancelledAppointments.filter(a => a.status === "missed")} 
                  onSendMessage={handleSendMessageToGapPatient} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      
      <Dialog open={dismissDialogOpen} onOpenChange={setDismissDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dismiss this patient?</DialogTitle>
            <DialogDescription>
              Would you like to dismiss this patient or send them a thank you and review request?
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Button
                variant="default"
                className="w-full bg-cliniko-primary hover:bg-cliniko-accent"
                onClick={() => handleConfirmDismiss(true)}
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                Send Thank You & Review Request
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

      <Dialog open={smsModalOpen} onOpenChange={setSmsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Follow-up SMS</DialogTitle>
            <DialogDescription>
              Select a template or customize your message for {currentPatient?.first_name} {currentPatient?.last_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="template" className="text-sm font-medium">
                Template
              </label>
              <Select 
                value={selectedTemplate} 
                onValueChange={(val) => {
                  setSelectedTemplate(val);
                  
                  if (currentPatient) {
                    const treatmentText = currentPatient.treatmentNotes || 'your treatment';
                    
                    if (val === 'appointment') {
                      setCustomMessage(`Hi ${currentPatient.first_name}, we hope you've been well since ${treatmentText}. Would you like to schedule a follow-up appointment?`);
                    } else if (val === 'checkup') {
                      setCustomMessage(`Hi ${currentPatient.first_name}, it's been a while since your ${treatmentText}. We recommend scheduling a checkup soon. Please call us to book.`);
                    } else if (val === 'discount') {
                      setCustomMessage(`Hi ${currentPatient.first_name}, as a valued patient who received ${treatmentText}, we're offering a special 15% discount for your next appointment!`);
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointment">Book Appointment</SelectItem>
                  <SelectItem value="checkup">Checkup Reminder</SelectItem>
                  <SelectItem value="discount">Special Offer</SelectItem>
                  <SelectItem value="custom">Custom Message</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="mt-4">
                <label htmlFor="customMessage" className="text-sm font-medium">
                  Message Preview/Edit
                </label>
                <Textarea
                  id="customMessage"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
                
                {currentPatient?.treatmentNotes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-md">
                    <p className="text-xs text-muted-foreground font-medium">Treatment Notes:</p>
                    <p className="text-sm">{currentPatient.treatmentNotes}</p>
                  </div>
                )}
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

      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Follow-up Reminder</DialogTitle>
            <DialogDescription>
              When would you like to be reminded about this patient?
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-3">
              <Button 
                variant="outline"
                onClick={() => handleConfirmReminder(7)}
                className="justify-start"
              >
                <Bell className="mr-2 h-4 w-4" /> Remind in 7 days
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleConfirmReminder(14)}
                className="justify-start"
              >
                <Bell className="mr-2 h-4 w-4" /> Remind in 14 days
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleConfirmReminder(30)}
                className="justify-start"
              >
                <Bell className="mr-2 h-4 w-4" /> Remind in 30 days
              </Button>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setReminderDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// New component for color-coded dashboard sections
interface DashboardSectionProps {
  title: string;
  subtitle: string;
  patients: PatientWithFollowUpStatus[];
  icon: React.ReactNode;
  accent: 'blue' | 'purple' | 'red' | 'green' | 'amber';
  onDismiss: (patient: PatientWithFollowUpStatus) => void;
  onSendSMS: (patient: PatientWithFollowUpStatus) => void;
  onRemindLater: (patient: PatientWithFollowUpStatus) => void;
  getPractitionerColor: (practitionerId?: number) => string;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  subtitle,
  patients,
  icon,
  accent,
  onDismiss,
  onSendSMS,
  onRemindLater,
  getPractitionerColor
}) => {
  const accentColors = {
    'blue': 'border-l-4 border-blue-500',
    'purple': 'border-l-4 border-purple-500',
    'red': 'border-l-4 border-red-500',
    'green': 'border-l-4 border-green-500',
    'amber': 'border-l-4 border-amber-500',
  };
  
  if (patients.length === 0) return null;
  
  return (
    <Card className={accentColors[accent]}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>{subtitle}</CardDescription>
            </div>
          </div>
          <Badge className={`bg-${accent}-100 text-${accent}-800 border-${accent}-300`}>
            {patients.length} patients
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {patients.slice(0, 5).map(patient => (
            <PatientCard 
              key={patient.id} 
              patient={patient}
              onDismiss={onDismiss}
              onSendSMS={onSendSMS}
              onRemindLater={onRemindLater}
              getPractitionerColor={getPractitionerColor}
            />
          ))}
        </div>
        {patients.length > 5 && (
          <div className="mt-3 text-center">
            <Button variant="ghost" size="sm">
              View {patients.length - 5} more patients
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

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
  onRemindLater: (patient: PatientWithFollowUpStatus) => void;
  getPractitionerColor: (practitionerId?: number) => string;
}

const PatientGroup: React.FC<PatientGroupProps> = ({ 
  title, 
  subtitle, 
  patients, 
  onDismiss,
  onSendSMS,
  onRemindLater,
  getPractitionerColor
}) => {
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
                onRemindLater={onRemindLater}
                getPractitionerColor={getPractitionerColor}
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
  onRemindLater: (patient: PatientWithFollowUpStatus) => void;
  getPractitionerColor: (practitionerId?: number) => string;
}

const PatientCard: React.FC<PatientCardProps> = ({ 
  patient, 
  onDismiss, 
  onSendSMS, 
  onRemindLater,
  getPractitionerColor 
}) => {
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
  
  const practitionerStyle = patient.assignedPractitionerId ? 
    `border-l-4 ${getPractitionerColor(patient.assignedPractitionerId)}` : 'border-l-4 border-gray-300';

  return (
    <div className={`bg-white rounded-lg ${practitionerStyle} ${statusColor} shadow-sm hover:shadow-md transition-shadow overflow-hidden`}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-lg">
                {patient.first_name} {patient.last_name}
              </h3>
              {patient.practitionerName && (
                <Badge className={getPractitionerColor(patient.assignedPractitionerId)}>
                  {patient.practitionerName}
                </Badge>
              )}
            </div>
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
          
          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemindLater(patient)}
              className="text-gray-600 hover:text-gray-800"
            >
              <Bell size={14} className="mr-1" />
              <span>Remind Later</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDismiss(patient)}
              className="text-gray-600 hover:text-gray-800"
            >
              <Check size={14} className="mr-1" />
              <span>Dismiss/Thank</span>
            </Button>
            
            <Button
              variant="default"
              size="sm"
              className="bg-cliniko-primary hover:bg-cliniko-accent"
              disabled={!hasMobile || patient.followUpStatus === 'contacted'}
              onClick={() => onSendSMS(patient)}
            >
              <MessageSquare size={14} className="mr-1" />
              <span>Send Message</span>
            </Button>
          </div>
        </div>
        
        {patient.treatmentNotes && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-medium text-muted-foreground mb-1">TREATMENT NOTES:</p>
            <p className="text-sm">{patient.treatmentNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
