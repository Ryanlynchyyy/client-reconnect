import React, { useState } from 'react';
import { useFollowUp } from '@/contexts/FollowUpContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { MessageSquare, Check, CalendarX, Calendar, Clock } from 'lucide-react';
import { TimeBasedFilters, TimeFilterType, AppointmentStatusType } from '@/components/dashboard/TimeBasedFilters';
import { Input } from '@/components/ui/input';

const Patients: React.FC = () => {
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
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('all');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<AppointmentStatusType>('all');
  const [showFiltersExpanded, setShowFiltersExpanded] = useState(false);
  
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = !searchTerm || 
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPractitioner = !selectedPractitionerId || 
      patient.assignedPractitionerId === selectedPractitionerId;
    
    let matchesTimeFilter = true;
    if (timeFilter === 'initial-2-weeks') {
      matchesTimeFilter = Boolean(patient.isInitialAppointment && 
        patient.daysSinceFirstAppointment && 
        patient.daysSinceFirstAppointment <= 14);
    } else if (timeFilter === 'last-30-days') {
      matchesTimeFilter = Boolean(patient.daysSinceLastAppointment && 
        patient.daysSinceLastAppointment <= 30);
    } else if (timeFilter === 'last-90-days') {
      matchesTimeFilter = Boolean(patient.daysSinceLastAppointment && 
        patient.daysSinceLastAppointment <= 90);
    }

    let matchesStatus = true;
    if (appointmentStatusFilter === 'cancelled') {
      matchesStatus = Boolean(patient.hasRecentCancellation);
    } else if (appointmentStatusFilter === 'active') {
      matchesStatus = !patient.hasRecentCancellation;
    }
    
    return matchesSearch && matchesPractitioner && matchesTimeFilter && matchesStatus;
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Patients</h1>
        <p className="text-gray-600">
          View and manage all patients from your Cliniko database
        </p>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      <TimeBasedFilters
        selectedTimeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        appointmentStatusFilter={appointmentStatusFilter}
        onAppointmentStatusChange={setAppointmentStatusFilter}
        showFiltersExpanded={showFiltersExpanded}
        setShowFiltersExpanded={setShowFiltersExpanded}
      />
      
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}
      
      <Card className="overflow-hidden border-beach-sand shadow-md">
        <CardHeader className="bg-beach-foam border-b border-beach-sand px-6 py-4">
          <CardTitle className="flex items-center justify-between">
            <span className="text-xl font-semibold text-beach-ocean">Patient List</span>
            <div className="flex space-x-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {filteredPatients.length} Patients
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
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
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cliniko-primary"></div>
                      <span className="text-sm text-muted-foreground">Loading patient data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <TableRow key={patient.id} className="hover:bg-beach-foam/50 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{patient.first_name} {patient.last_name}</span>
                        {patient.isInitialAppointment && (
                          <Badge variant="outline" className="mt-1 max-w-max text-xs bg-green-50 text-green-700 border-green-200">
                            Initial
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {patient.hasRecentCancellation ? (
                          <CalendarX className="h-4 w-4 text-red-500" />
                        ) : (
                          <Calendar className="h-4 w-4 text-gray-500" />
                        )}
                        <span>{patient.lastAppointmentDate 
                          ? format(new Date(patient.lastAppointmentDate), 'PPP')
                          : 'No appointments'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{patient.daysSinceLastAppointment || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {patient.practitionerName ? (
                        <Badge className={`${
                          patient.assignedPractitionerId === 1 ? "bg-blue-100 text-blue-800 border-blue-200" :
                          patient.assignedPractitionerId === 2 ? "bg-green-100 text-green-800 border-green-200" :
                          patient.assignedPractitionerId === 3 ? "bg-purple-100 text-purple-800 border-purple-200" :
                          patient.assignedPractitionerId === 4 ? "bg-amber-100 text-amber-800 border-amber-200" :
                          "bg-gray-100 text-gray-800 border-gray-200"
                        } px-2 py-1 rounded-full text-xs font-medium`}>
                          {patient.practitionerName}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {patient.hasFutureAppointment ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Future Appointment</Badge>
                      ) : patient.hasRecentCancellation ? (
                        <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
                      ) : (
                        <Badge 
                          variant={
                            patient.followUpStatus === 'pending' ? 'default' :
                            patient.followUpStatus === 'contacted' ? 'outline' : 'secondary'
                          }
                          className={
                            patient.followUpStatus === 'pending' ? 'bg-beach-ocean text-white' :
                            patient.followUpStatus === 'contacted' ? 'text-beach-ocean border-beach-ocean bg-beach-foam' :
                            'bg-gray-100 text-gray-700'
                          }
                        >
                          {patient.followUpStatus === 'pending' && 'Needs Follow-Up'}
                          {patient.followUpStatus === 'contacted' && 'Contacted'}
                          {patient.followUpStatus === 'dismissed' && 'Dismissed'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => dismissPatient(patient.id)}
                          title="Dismiss patient"
                          className="border-gray-200 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Check size={16} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-cliniko-primary text-white hover:bg-cliniko-accent"
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
                    <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-gray-300 mb-2">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" x2="16" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="2" y2="6" />
                        <line x1="3" x2="21" y1="10" y2="10" />
                      </svg>
                      <span className="text-lg font-medium">No patients found</span>
                      <p className="text-sm max-w-md">Try adjusting your filters or search term to find what you're looking for.</p>
                    </div>
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

export default Patients;
