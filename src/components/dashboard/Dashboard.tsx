
import React, { useState } from 'react';
import { useFollowUp } from '@/contexts/FollowUpContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PatientWithFollowUpStatus } from '@/types/clinikoTypes';
import { Check, Clock, MessageSquare, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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

  const searchResults = searchTerm ? 
    filteredPatients.filter(patient => 
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    ) : filteredPatients;

  const handleRefresh = async () => {
    await refreshData();
  };

  const handleSendSMS = (patient: PatientWithFollowUpStatus) => {
    console.log('Sending SMS to:', patient);
    markAsContacted(patient.id);
  };

  // Group patients by days since last appointment
  const groupedPatients = {
    '30-60 days': searchResults.filter(patient => 
      patient.daysSinceLastAppointment !== null && 
      patient.daysSinceLastAppointment >= 30 &&
      patient.daysSinceLastAppointment < 60
    ),
    '60-90 days': searchResults.filter(patient => 
      patient.daysSinceLastAppointment !== null && 
      patient.daysSinceLastAppointment >= 60 &&
      patient.daysSinceLastAppointment < 90
    ),
    '90+ days': searchResults.filter(patient => 
      patient.daysSinceLastAppointment !== null && 
      patient.daysSinceLastAppointment >= 90
    ),
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
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh Data
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Filter by Absence</CardTitle>
            <CardDescription>Show patients who haven't returned in:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Button 
                variant={filterDays === 30 ? "default" : "outline"}
                onClick={() => setFilterDays(30)}
                className="flex-1"
              >
                30+ Days
              </Button>
              <Button 
                variant={filterDays === 60 ? "default" : "outline"}
                onClick={() => setFilterDays(60)}
                className="flex-1"
              >
                60+ Days
              </Button>
              <Button 
                variant={filterDays === 90 ? "default" : "outline"}
                onClick={() => setFilterDays(90)}
                className="flex-1"
              >
                90+ Days
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Search Patients</CardTitle>
            <CardDescription>Find a specific patient:</CardDescription>
          </CardHeader>
          <CardContent>
            <Input 
              placeholder="Search by patient name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
      
      {isLoading && (
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
      )}
      
      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PatientGroup 
            title="30-60 Days"
            description="Patients who haven't returned in 30-60 days"
            patients={groupedPatients['30-60 days']}
            onDismiss={dismissPatient}
            onSendSMS={handleSendSMS}
          />
          
          <PatientGroup 
            title="60-90 Days"
            description="Patients who haven't returned in 60-90 days"
            patients={groupedPatients['60-90 days']}
            onDismiss={dismissPatient}
            onSendSMS={handleSendSMS}
          />
          
          <PatientGroup 
            title="90+ Days"
            description="Patients who haven't returned in over 90 days"
            patients={groupedPatients['90+ days']}
            onDismiss={dismissPatient}
            onSendSMS={handleSendSMS}
          />
        </div>
      )}
    </div>
  );
};

interface PatientGroupProps {
  title: string;
  description: string;
  patients: PatientWithFollowUpStatus[];
  onDismiss: (id: number) => void;
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
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto max-h-[500px]">
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
  onDismiss: (id: number) => void;
  onSendSMS: (patient: PatientWithFollowUpStatus) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onDismiss, onSendSMS }) => {
  const lastAppointmentDate = patient.lastAppointmentDate 
    ? format(new Date(patient.lastAppointmentDate), 'PPP')
    : 'Unknown';

  const phoneNumbers = patient.patient_phone_numbers || [];
  const hasMobile = phoneNumbers.some(p => p.phone_type === 'Mobile');

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-medium">
                {patient.first_name} {patient.last_name}
              </h3>
              <div className="text-sm text-gray-500 mt-1 space-y-1">
                <p>Last visit: {lastAppointmentDate}</p>
                <p>Days since last visit: {patient.daysSinceLastAppointment || 'N/A'}</p>
                <p>
                  Phone: {phoneNumbers.find(p => p.is_primary)?.number || 
                          phoneNumbers[0]?.number || 'No phone number'}
                </p>
              </div>
            </div>
            
            <Badge 
              className={cn(
                patient.followUpStatus === 'contacted' && 'bg-amber-500', 
                patient.followUpStatus === 'dismissed' && 'bg-gray-500'
              )}
            >
              {patient.followUpStatus === 'pending' && 'Needs Follow-Up'}
              {patient.followUpStatus === 'contacted' && 'Contacted'}
              {patient.followUpStatus === 'dismissed' && 'Dismissed'}
            </Badge>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 flex md:flex-col justify-end space-x-2 md:space-x-0 md:space-y-2 md:w-48">
          <Button
            variant="outline"
            className="flex items-center gap-1"
            onClick={() => onDismiss(patient.id)}
          >
            <Check size={16} />
            <span>Dismiss</span>
          </Button>
          
          <Button
            variant="default"
            className="bg-cliniko-primary hover:bg-cliniko-accent flex items-center gap-1"
            disabled={!hasMobile || patient.followUpStatus === 'contacted'}
            onClick={() => onSendSMS(patient)}
          >
            <MessageSquare size={16} />
            <span>Send SMS</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Dashboard;
