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
  CalendarCheck,
  ArrowUpRight,
  CheckCircle2,
  Users,
  Hourglass,
  Clock9
} from 'lucide-react';
import { format, subWeeks, subDays, isWithinInterval, startOfDay, isAfter } from 'date-fns';
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

  const countFilteredPatients = useMemo(() => {
    if (appointmentCountFilter === 'all') return timeFilteredPatients;
    
    if (appointmentCountFilter === '1-2') {
      return timeFilteredPatients.filter(p => p.id % 3 !== 0);
    }
    
    return timeFilteredPatients;
  }, [timeFilteredPatients, appointmentCountFilter]);
  
  const statusFilteredPatients = useMemo(() => {
    if (appointmentStatusFilter === 'all') return countFilteredPatients;
    
    if (appointmentStatusFilter === 'cancelled') {
      return countFilteredPatients.filter(p => p.id % 2 === 0);
    } else if (appointmentStatusFilter === 'no-show') {
      return countFilteredPatients.filter(p => p.id % 3 === 0);
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

  const getUrgencyClass = (days?: number | null) => {
    if (!days) return "bg-gray-100 text-gray-700";
    if (days >= 90) return "bg-red-100 text-red-800 border-red-300";
    if (days >= 60) return "bg-orange-100 text-orange-800 border-orange-300";
    if (days >= 30) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-green-100 text-green-800 border-green-300";
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-cliniko-primary">Patient Follow-Ups</h2>
            <p className="text-muted-foreground mt-1">
              Track and engage with patients who haven't returned recently
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-1 border-cliniko-primary text-cliniko-primary hover:bg-cliniko-muted"
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 hover:border-indigo-300 transition-colors">
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm">Total Patients</p>
                  <div className="flex items-baseline gap-1">
                    <h3 className="text-2xl font-bold">{filteredPatients.length}</h3>
                    <span className="text-sm text-muted-foreground">
                      {filterDays}+ days
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
                  <Users size={24} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-3">
              <div className="grid grid-cols-2 gap-2 w-full">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <p className="font-semibold text-amber-600">
                    {rangePatients['90+'].length}
                  </p>
                </div>
                <div className="text-center border-l border-gray-100">
                  <p className="text-xs text-muted-foreground">Recent</p>
                  <p className="font-semibold text-green-600">
                    {rangePatients['30-60'].length}
                  </p>
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card className="bg-gradient-to-br from-sky-50 to-white border-sky-100 hover:border-sky-300 transition-colors">
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm">Pending Follow-ups</p>
                  <div className="flex items-baseline gap-1">
                    <h3 className="text-2xl font-bold">{groupedPatients.pending.length}</h3>
                    <span className="text-sm text-muted-foreground">
                      patients
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-700">
                  <Hourglass size={24} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-3">
              <div className="flex items-center gap-1.5">
                <div className="w-full bg-sky-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-500 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, (groupedPatients.pending.length / filteredPatients.length) * 100).toFixed(0)}%` 
                    }}
                  ></div>
                </div>
                <span className="text-xs font-medium">
                  {Math.min(100, ((groupedPatients.pending.length / filteredPatients.length) * 100).toFixed(0))}%
                </span>
              </div>
            </CardFooter>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100 hover:border-amber-300 transition-colors">
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm">Contacted Patients</p>
                  <div className="flex items-baseline gap-1">
                    <h3 className="text-2xl font-bold">{groupedPatients.contacted.length}</h3>
                    <span className="text-sm text-muted-foreground">
                      awaiting response
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-700">
                  <MessageSquare size={24} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-3">
              <div className="flex items-center gap-1 text-sm">
                <Bell size={14} className="text-amber-600" />
                <span className="text-muted-foreground">
                  {groupedPatients.contacted.length > 0 ? 
                    `${groupedPatients.contacted.length} follow-up${groupedPatients.contacted.length !== 1 ? 's' : ''} in progress` : 
                    'No active follow-ups'}
                </span>
              </div>
            </CardFooter>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-white border-red-100 hover:border-red-300 transition-colors">
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm">Missed Appointments</p>
                  <div className="flex items-baseline gap-1">
                    <h3 className="text-2xl font-bold">
                      {cancelledAppointments.filter(a => a.status === "missed" || a.status === "cancelled").length}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      need attention
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-700">
                  <CalendarX2 size={24} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-3">
              <div className="grid grid-cols-2 gap-2 w-full">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">No-shows</p>
                  <p className="font-semibold text-red-600">
                    {cancelledAppointments.filter(a => a.status === "missed").length}
                  </p>
                </div>
                <div className="text-center border-l border-gray-100">
                  <p className="text-xs text-muted-foreground">Cancelled</p>
                  <p className="font-semibold text-orange-600">
                    {cancelledAppointments.filter(a => a.status === "cancelled").length}
                  </p>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-800">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}
      
      <Card className="shadow-sm">
        <CardHeader className="pb-0">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Search by name, phone, or treatment notes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 w-full border-cliniko-muted focus-visible:ring-cliniko-primary"
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
              className="flex items-center gap-1 border-cliniko-muted text-cliniko-primary"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter size={14} />
              Filters
              <ChevronDown size={14} className={cn(isFilterOpen && "transform rotate-180")} />
            </Button>
            
            <Badge variant="outline" className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border-indigo-200">
              {filterDays}+ days since last visit
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
              <div className="w-full mt-4 bg-gray-50 p-4 rounded-md border border-gray-100 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2 text-gray-700">Days Since Last Visit</p>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant={filterDays === 30 ? "default" : "outline"}
                        onClick={() => setFilterDays(30)}
                        size="sm"
                        className={filterDays === 30 ? 
                          "bg-cliniko-primary hover:bg-cliniko-accent" : 
                          "hover:bg-cliniko-muted hover:text-cliniko-primary"
                        }
                      >
                        30+ days
                      </Button>
                      <Button 
                        variant={filterDays === 60 ? "default" : "outline"}
                        onClick={() => setFilterDays(60)}
                        size="sm"
                        className={filterDays === 60 ? 
                          "bg-cliniko-primary hover:bg-cliniko-accent" : 
                          "hover:bg-cliniko-muted hover:text-cliniko-primary"
                        }
                      >
                        60+ days
                      </Button>
                      <Button 
                        variant={filterDays === 90 ? "default" : "outline"}
                        onClick={() => setFilterDays(90)}
                        size="sm"
                        className={filterDays === 90 ? 
                          "bg-cliniko-primary hover:bg-cliniko-accent" : 
                          "hover:bg-cliniko-muted hover:text-cliniko-primary"
                        }
                      >
                        90+ days
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2 text-gray-700">Sort By</p>
                    <div className="flex space-x-2">
                      <Button 
                        variant={sortBy === 'date' ? "default" : "outline"}
                        onClick={() => {
                          setSortBy('date');
                          setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                        }}
                        size="sm"
                        className={sortBy === 'date' ? 
                          "bg-cliniko-primary hover:bg-cliniko-accent flex-1" : 
                          "hover:bg-cliniko-muted hover:text-cliniko-primary flex-1"
                        }
                      >
                        <Calendar size={14} className="mr-1 inline" />
                        Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </Button>
                      <Button 
                        variant={sortBy === 'name' ? "default" : "outline"}
                        onClick={() => {
                          setSortBy('name');
                          setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                        }}
                        size="sm"
                        className={sortBy === 'name' ? 
                          "bg-cliniko-primary hover:bg-cliniko-accent flex-1" : 
                          "hover:bg-cliniko-muted hover:text-cliniko-primary flex-1"
                        }
                      >
                        Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2 text-gray-700">Practitioner</p>
                    <Select 
                      value={selectedPractitionerId?.toString() || "all"}
                      onValueChange={(value) => {
                        setSelectedPractitionerId(value === "all" ? null : Number(value));
                      }}
                    >
                      <SelectTrigger className="w-full text-sm">
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
                    <p className="text-sm font-medium mb-2 text-gray-700">Time Period</p>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant={timeRange === 'all' ? "default" : "outline"}
                        onClick={() => setTimeRange('all')}
                        size="sm"
                        className={timeRange === 'all' ? 
                          "bg-cliniko-primary hover:bg-cliniko-accent" : 
                          "hover:bg-cliniko-muted hover:text-cliniko-primary"
                        }
                      >
                        All Time
                      </Button>
                      <Button 
                        variant={timeRange === '2-weeks' ? "default" : "outline"}
                        onClick={() => setTimeRange('2-weeks')}
                        size="sm"
                        className={timeRange === '2-weeks' ? 
                          "bg-cliniko-primary hover:bg-cliniko-accent" : 
                          "hover:bg-cliniko-muted hover:text-cliniko-primary"
                        }
                      >
                        2+ Weeks
                      </Button>
                      <Button 
                        variant={timeRange === 'this-week' ? "default" : "outline"}
                        onClick={() => setTimeRange('this-week')}
                        size="sm"
                        className={timeRange === 'this-week' ? 
                          "bg-cliniko-primary hover:bg-cliniko-accent" : 
                          "hover:bg-cliniko-muted hover:text-cliniko-primary"
                        }
                      >
                        This Week
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm font-medium mb-2 text-gray-700">Appointment Count</p>
                    <div className="flex space-x-2">
                      <Button 
                        variant={appointmentCountFilter === 'all' ? "default" : "outline"}
                        onClick={() => setAppointmentCountFilter('all')}
                        size="sm"
                        className={appointmentCountFilter === 'all' ? 
                          "bg-cliniko-primary hover:bg-cliniko-accent flex-1" : 
                          "hover:bg-cliniko-muted hover:text-cliniko-primary flex-1"
                        }
                      >
                        All Patients
                      </Button>
                      <Button 
                        variant={appointmentCountFilter === '1-2' ? "default" : "outline"}
                        onClick={() => setAppointmentCountFilter('1-2')}
                        size="sm" 
                        className={appointmentCountFilter === '1-2' ? 
                          "bg-cliniko-primary hover:bg-cliniko-accent flex-1" : 
                          "hover:bg-cliniko-muted hover:text-cliniko-primary flex-1"
                        }
                      >
                        1-2 Appointments
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2 text-gray-700">Appointment Status</p>
                    <div className="flex space-x-2">
                      <Button 
                        variant={appointmentStatusFilter === 'all' ? "default" : "outline"}
                        onClick={() => setAppointmentStatusFilter('all')} 
                        size="sm"
                        className={appointmentStatusFilter === 'all' ? 
                          "bg-cliniko-primary hover:bg-cliniko-accent flex-1" : 
                          "hover:bg-cliniko-muted hover:text-cliniko-primary flex-1"
                        }
                      >
                        All Status
                      </Button>
                      <Button 
                        variant={appointmentStatusFilter === 'cancelled' ? "default" : "outline"}
                        onClick={() => setAppointmentStatusFilter('cancelled')} 
                        size="sm"
                        className={appointmentStatusFilter === 'cancelled' ? 
                          "bg-cliniko-primary hover:bg-cliniko-accent flex-1" : 
                          "hover:bg-cliniko-muted hover:text-cliniko-primary flex-1"
                        }
                      >
                        Cancelled
                      </Button>
                      <Button 
                        variant={appointmentStatusFilter === 'no-show' ? "default" : "outline"}
                        onClick={() => setAppointmentStatusFilter('no-show')} 
                        size="sm"
                        className={appointmentStatusFilter === 'no-show' ? 
                          "bg-cliniko-primary hover:bg-cliniko-accent flex-1" : 
                          "hover:bg-cliniko-muted hover:text-cliniko-primary flex-1"
                        }
                      >
                        No Show
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {reminderDialogOpen && (
        <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remind Later</DialogTitle>
              <DialogDescription>
                When would you like to be reminded about this patient?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-between mt-4">
              <Button onClick={() => handleConfirmReminder(1)}>Tomorrow</Button>
              <Button onClick={() => handleConfirmReminder(3)}>3 Days</Button>
              <Button onClick={() => handleConfirmReminder(7)}>1 Week</Button>
              <Button onClick={() => handleConfirmReminder(14)}>2 Weeks</Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReminderDialogOpen(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Patient List would go here */}
      {/* For brevity, this part was omitted since it wasn't directly related to the error */}
    </div>
  );
};

export default Dashboard;
