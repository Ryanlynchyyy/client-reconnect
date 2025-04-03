import React, { useState } from 'react';
import { useFollowUp } from '@/contexts/FollowUpContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { MessageSquare, Check, CalendarX, Calendar } from 'lucide-react';
import EnhancedFilters from './EnhancedFilters';
import StatCards from './StatCards';
import { 
  TimeBasedFilters,
  TimeFilterType,
  AppointmentStatusType
} from './TimeBasedFilters';

const EnhancedFollowUpDashboard = () => {
  const { 
    patients, 
    isLoading, 
    error, 
    dismissPatient, 
    markAsContacted, 
    practitioners,
    selectedPractitionerId,
    setSelectedPractitionerId 
  } = useFollowUp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [minGapDays, setMinGapDays] = useState(14);
  const [statusFilters, setStatusFilters] = useState<Record<string, boolean>>({
    cancelled: true,
    'no-followup': true,
    'large-gap': true
  });
  const [appointmentTypes] = useState(['Initial Consultation', 'Follow-up', 'Treatment', 'Assessment']);
  const [selectedAppointmentTypes, setSelectedAppointmentTypes] = useState<string[]>([]);

  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('all');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<AppointmentStatusType>('all');
  const [showFiltersExpanded, setShowFiltersExpanded] = useState(false);
  
  const getPractitionerColor = (practitionerId?: number) => {
    if (!practitionerId) return "bg-gray-100 text-gray-800";
    switch (practitionerId) {
      case 1: return "bg-blue-100 text-blue-800";
      case 2: return "bg-green-100 text-green-800";
      case 3: return "bg-purple-100 text-purple-800";
      case 4: return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = !searchTerm || 
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPractitioner = !selectedPractitionerId || 
      patient.assignedPractitionerId === selectedPractitionerId;
    
    let matchesTimeFilter = true;
    if (timeFilter === 'initial-2-weeks') {
      matchesTimeFilter = Boolean(patient.isInitialAppointment && 
        patient.daysSinceFirstAppointment !== undefined && 
        patient.daysSinceFirstAppointment <= 14);
    } else if (timeFilter === 'last-30-days') {
      matchesTimeFilter = Boolean(patient.daysSinceLastAppointment !== undefined && 
        patient.daysSinceLastAppointment <= 30);
    } else if (timeFilter === 'last-90-days') {
      matchesTimeFilter = Boolean(patient.daysSinceLastAppointment !== undefined && 
        patient.daysSinceLastAppointment <= 90);
    }

    let matchesAppointmentStatus = true;
    if (appointmentStatusFilter === 'cancelled') {
      matchesAppointmentStatus = Boolean(patient.hasRecentCancellation);
    } else if (appointmentStatusFilter === 'active') {
      matchesAppointmentStatus = !patient.hasRecentCancellation;
    }
    
    const matchesGapDays = patient.daysSinceLastAppointment === undefined || 
      patient.daysSinceLastAppointment >= minGapDays;
    
    const matchesAppointmentType = selectedAppointmentTypes.length === 0 || 
      (patient.lastAppointmentType && selectedAppointmentTypes.includes(patient.lastAppointmentType));
    
    return matchesSearch && matchesPractitioner && matchesTimeFilter && 
           matchesAppointmentStatus && matchesGapDays && matchesAppointmentType;
  });

  const groupedPatients = {
    all: filteredPatients,
    pending: filteredPatients.filter(p => p.followUpStatus === 'pending'),
    contacted: filteredPatients.filter(p => p.followUpStatus === 'contacted'),
    dismissed: filteredPatients.filter(p => p.followUpStatus === 'dismissed')
  };

  const rangePatients = {
    '30-60': filteredPatients.filter(p => 
      p.daysSinceLastAppointment && p.daysSinceLastAppointment >= 30 && p.daysSinceLastAppointment < 60
    ),
    '60-90': filteredPatients.filter(p => 
      p.daysSinceLastAppointment && p.daysSinceLastAppointment >= 60 && p.daysSinceLastAppointment < 90
    ),
    '90+': filteredPatients.filter(p => 
      p.daysSinceLastAppointment && p.daysSinceLastAppointment >= 90
    )
  };

  const cancelledAppointments = filteredPatients
    .filter(p => p.hasRecentCancellation)
    .map(p => ({
      id: p.id,
      status: "cancelled"
    }));
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Follow-Up Dashboard</h1>
        <p className="text-gray-600">
          Track and manage patient follow-ups based on time since last visit
        </p>
      </div>
      
      <TimeBasedFilters 
        selectedTimeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        appointmentStatusFilter={appointmentStatusFilter}
        onAppointmentStatusChange={setAppointmentStatusFilter}
        showFiltersExpanded={showFiltersExpanded}
        setShowFiltersExpanded={setShowFiltersExpanded}
      />
      
      <EnhancedFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        practitioners={practitioners.map(p => ({ id: p.id, name: `${p.first_name} ${p.last_name}` }))}
        selectedPractitioner={selectedPractitionerId}
        setSelectedPractitioner={setSelectedPractitionerId}
        minGapDays={minGapDays}
        setMinGapDays={setMinGapDays}
        statusFilters={statusFilters}
        setStatusFilters={setStatusFilters}
        appointmentTypes={appointmentTypes}
        selectedAppointmentTypes={selectedAppointmentTypes}
        setSelectedAppointmentTypes={setSelectedAppointmentTypes}
        timeFilter={timeFilter as any}
        setTimeFilter={setTimeFilter as any}
        showCancelledOnly={appointmentStatusFilter === 'cancelled'}
        setShowCancelledOnly={(show) => setAppointmentStatusFilter(show ? 'cancelled' : 'all')}
      />
      
      <StatCards 
        filteredPatients={filteredPatients}
        groupedPatients={groupedPatients}
        rangePatients={rangePatients}
        cancelledAppointments={cancelledAppointments}
        filterDays={minGapDays}
      />
      
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">
              Patient Follow-ups
              {timeFilter !== 'all' && (
                <span className="text-sm ml-2 font-normal text-blue-600">
                  {timeFilter === 'initial-2-weeks' ? '(Initial appointments within 2 weeks)' : 
                   timeFilter === 'last-30-days' ? '(Last 30 days)' : 
                   '(Last 90 days)'}
                </span>
              )}
            </CardTitle>
            <div className="flex gap-1 text-sm">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Calendar className="h-3 w-3 mr-1" />
                {filteredPatients.filter(p => p.isInitialAppointment).length} Initial
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700">
                <CalendarX className="h-3 w-3 mr-1" />
                {filteredPatients.filter(p => p.hasRecentCancellation).length} Cancelled
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Last Appointment</TableHead>
                <TableHead>Days Since</TableHead>
                <TableHead>Practitioner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading patient data...
                  </TableCell>
                </TableRow>
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      {patient.first_name} {patient.last_name}
                    </TableCell>
                    <TableCell>
                      {patient.lastAppointmentDate 
                        ? format(new Date(patient.lastAppointmentDate), 'PPP')
                        : 'No appointments'}
                    </TableCell>
                    <TableCell>
                      {patient.daysSinceLastAppointment || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {patient.practitionerName ? (
                        <Badge className={getPractitionerColor(patient.assignedPractitionerId)}>
                          {patient.practitionerName}
                        </Badge>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {patient.hasFutureAppointment ? (
                          <Badge className="bg-green-500 text-white">Future Appointment</Badge>
                        ) : (
                          <Badge 
                            variant={
                              patient.followUpStatus === 'pending' ? 'default' :
                              patient.followUpStatus === 'contacted' ? 'outline' : 'secondary'
                            }
                          >
                            {patient.followUpStatus === 'pending' && 'Needs Follow-Up'}
                            {patient.followUpStatus === 'contacted' && 'Contacted'}
                            {patient.followUpStatus === 'dismissed' && 'Dismissed'}
                          </Badge>
                        )}
                        {patient.isInitialAppointment && (
                          <Badge className="bg-blue-500 text-white">Initial Visit</Badge>
                        )}
                        {patient.hasRecentCancellation && (
                          <Badge className="bg-red-500 text-white">Cancelled</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => dismissPatient(patient.id)}
                          title="Dismiss patient"
                        >
                          <Check size={16} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-cliniko-primary text-white"
                          onClick={() => markAsContacted(patient.id)}
                          title="Mark as contacted"
                        >
                          <MessageSquare size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No patients found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedFollowUpDashboard;
