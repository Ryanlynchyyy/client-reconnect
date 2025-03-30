
import React, { useState } from 'react';
import { useFollowUp } from '@/contexts/FollowUpContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { MessageSquare, Check } from 'lucide-react';

const Patients: React.FC = () => {
  const { patients, isLoading, error, dismissPatient, markAsContacted } = useFollowUp();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter patients by search term
  const filteredPatients = searchTerm ? 
    patients.filter(patient => 
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    ) : patients;
  
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
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
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
                        >
                          <Check size={16} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-cliniko-primary text-white"
                          onClick={() => markAsContacted(patient.id)}
                        >
                          <MessageSquare size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
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
