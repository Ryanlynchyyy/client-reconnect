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

  const groupedPatients = searchResults.reduce<Record<string, PatientWithFollowUpStatus[]>>(
    (acc, patient) => {
      if (patient.daysSinceLastAppointment === null) return acc;
      
      let key = '30-60 days';
      if (patient.daysSinceLastAppointment > 90) key = '90+ days';
      else if (patient.daysSinceLastAppointment > 60) key = '60-90 days';
      
      if (!acc[key]) acc[key] = [];
      acc[key].push(patient);
      return acc;
    }, 
    {}
  );

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
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Patients</TabsTrigger>
            {Object.keys(groupedPatients).map(group => (
              <TabsTrigger key={group} value={group}>
                {group} ({groupedPatients[group]?.length || 0})
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {searchResults.length > 0 ? (
              searchResults.map(patient => (
                <PatientCard 
                  key={patient.id} 
                  patient={patient} 
                  onDismiss={dismissPatient}
                  onSendSMS={handleSendSMS}
                />
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500">No patients match your criteria</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {Object.keys(groupedPatients).map(group => (
            <TabsContent key={group} value={group} className="space-y-4">
              {groupedPatients[group]?.map(patient => (
                <PatientCard 
                  key={patient.id} 
                  patient={patient}
                  onDismiss={dismissPatient}
                  onSendSMS={handleSendSMS}
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
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
