
import React, { useState } from 'react';
import { useFollowUp } from '@/contexts/FollowUpContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { MessageSquare, Check } from 'lucide-react';
import EnhancedFilters from './EnhancedFilters';
import StatCards from './StatCards';

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
  const [timeFilter, setTimeFilter] = useState<'all' | 'initial-2-weeks' | 'last-30-days' | 'last-90-days'>('all');
  const [showCancelledOnly, setShowCancelledOnly] = useState(false);
  
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
    
    // Time filter condition
    let matchesTimeFilter = true;
    if (timeFilter === 'initial-2-weeks') {
      // Filter for patients within 2 weeks of their initial appointment
      matchesTimeFilter = Boolean(patient.isInitialAppointment && 
        patient.daysSinceFirstAppointment && 
        patient.daysSinceFirstAppointment <= 14);
    } else if (timeFilter === 'last-30-days') {
      // Filter for patients seen in the last 30 days
      matchesTimeFilter = Boolean(patient.daysSinceLastAppointment && 
        patient.daysSinceLastAppointment <= 30);
    } else if (timeFilter === 'last-90-days') {
      // Filter for patients seen in the last 90 days
      matchesTimeFilter = Boolean(patient.daysSinceLastAppointment && 
        patient.daysSinceLastAppointment <= 90);
    }

    // Cancelled appointment condition
    const matchesCancelled = !showCancelledOnly || 
      Boolean(patient.hasRecentCancellation);
    
    // Gap days condition
    const matchesGapDays = !patient.daysSinceLastAppointment || 
      patient.daysSinceLastAppointment >= minGapDays;
    
    // Appointment type filtering
    const matchesAppointmentType = selectedAppointmentTypes.length === 0 || 
      (patient.lastAppointmentType && selectedAppointmentTypes.includes(patient.lastAppointmentType));
    
    return matchesSearch && matchesPractitioner && matchesTimeFilter && 
           matchesCancelled && matchesGapDays && matchesAppointmentType;
  });

  // Group patients by follow-up status for the stats cards
  const groupedPatients = {
    all: filteredPatients,
    pending: filteredPatients.filter(p => p.followUpStatus === 'pending'),
    contacted: filteredPatients.filter(p => p.followUpStatus === 'contacted'),
    dismissed: filteredPatients.filter(p => p.followUpStatus === 'dismissed')
  };

  // Group patients by time ranges for the stats cards
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

  // Collect cancelled appointments for the stats
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
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        showCancelledOnly={showCancelledOnly}
        setShowCancelledOnly={setShowCancelledOnly}
      />
      
      {/* Add stat cards to show filtered patient counts */}
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
          <CardTitle>Patient Follow-ups</CardTitle>
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
                      {patient.hasFutureAppointment ? (
                        <Badge className="bg-green-500">Future Appointment</Badge>
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
                        <Badge className="ml-2 bg-blue-500">Initial Visit</Badge>
                      )}
                      {patient.hasRecentCancellation && (
                        <Badge className="ml-2 bg-red-500">Cancelled</Badge>
                      )}
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
                    No patients found
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
