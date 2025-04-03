
import React, { useState } from 'react';
import { useFollowUp } from '@/contexts/FollowUpContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { MessageSquare, Check, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [showFilters, setShowFilters] = useState(false);
  
  // Get practitioner color based on ID
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
  
  // Filter patients by search term and practitioner
  const filteredPatients = patients.filter(patient => {
    // Filter by search term
    const matchesSearch = !searchTerm || 
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by practitioner
    const matchesPractitioner = !selectedPractitionerId || 
      patient.assignedPractitionerId === selectedPractitionerId;
    
    return matchesSearch && matchesPractitioner;
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Patients</h1>
        <p className="text-gray-600">
          View and manage all patients from your Cliniko database
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Patient Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter size={16} />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              
              {selectedPractitionerId && (
                <Badge 
                  variant="outline" 
                  className="ml-2 cursor-pointer"
                  onClick={() => setSelectedPractitionerId(null)}
                >
                  Filtered by practitioner × 
                </Badge>
              )}
            </div>
            
            {showFilters && (
              <div className="pt-2 pb-1 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter by Practitioner</label>
                  <Select 
                    value={selectedPractitionerId?.toString() || ""}
                    onValueChange={(value) => setSelectedPractitionerId(value ? parseInt(value) : null)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a practitioner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Practitioners</SelectItem>
                      {practitioners.map(practitioner => (
                        <SelectItem key={practitioner.id} value={practitioner.id.toString()}>
                          {practitioner.first_name} {practitioner.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Error state */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Patients table */}
      <Card>
        <CardContent className="pt-6">
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

export default Patients;
