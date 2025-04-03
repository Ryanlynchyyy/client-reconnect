
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format, subDays } from 'date-fns';
import { Calendar, Send, CalendarX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCancelledAppointments } from '@/hooks/useCancelledAppointments';

interface RebookingTrackerDashboardProps {
  practitioners: Array<{id: number; first_name: string; last_name: string}>;
}

const RebookingTrackerDashboard: React.FC<RebookingTrackerDashboardProps> = ({ practitioners }) => {
  const { toast } = useToast();
  const { appointments } = useCancelledAppointments();
  
  const [selectedPractitionerId, setSelectedPractitionerId] = useState<string>("all");
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState<string>("all");

  // Get appointment types from the data
  const appointmentTypes = [...new Set(appointments.map(a => a.appointmentType))].filter(Boolean) as string[];

  // Filter the appointments based on selections
  const filteredAppointments = appointments.filter(appointment => {
    // Practitioner filter
    const practitionerMatch = selectedPractitionerId === "all" || 
      appointment.practitionerId.toString() === selectedPractitionerId;
    
    // Appointment type filter
    const typeMatch = selectedAppointmentType === "all" || 
      appointment.appointmentType === selectedAppointmentType;
    
    // Date range filter
    let dateMatch = true;
    const today = new Date();
    if (selectedDateRange === "30") {
      dateMatch = appointment.gapDays <= 30;
    } else if (selectedDateRange === "60") {
      dateMatch = appointment.gapDays > 30 && appointment.gapDays <= 60;
    } else if (selectedDateRange === "90") {
      dateMatch = appointment.gapDays > 60 && appointment.gapDays <= 90;
    } else if (selectedDateRange === "90plus") {
      dateMatch = appointment.gapDays > 90;
    }
    
    // Tab filter
    let tabMatch = true;
    if (selectedTab === "cancelled") {
      tabMatch = appointment.status === "cancelled";
    } else if (selectedTab === "no-second") {
      tabMatch = appointment.status === "no-followup";
    } else if (selectedTab === "gap") {
      tabMatch = appointment.status === "large-gap";
    }
    
    return practitionerMatch && typeMatch && dateMatch && tabMatch;
  });

  // Handle sending booking link
  const handleSendBookingLink = (patientId: number, patientName: string) => {
    toast({
      title: "Booking link sent",
      description: `Booking link has been sent to ${patientName}`,
    });
  };

  // Get the count for each tab
  const getCategoryCount = (category: string) => {
    if (category === "all") return appointments.length;
    if (category === "cancelled") return appointments.filter(a => a.status === "cancelled").length;
    if (category === "no-second") return appointments.filter(a => a.status === "no-followup").length;
    if (category === "gap") return appointments.filter(a => 
      a.status === "large-gap" || a.status === "missed"
    ).length;
    return 0;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <CalendarX className="h-5 w-5 text-orange-500" />
          Rebooking Tracker
        </CardTitle>
        <CardDescription>
          Track patients who haven't rebooked after cancellation, initial consultation, or haven't returned in a while
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <Select
            value={selectedPractitionerId}
            onValueChange={setSelectedPractitionerId}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Practitioner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Practitioners</SelectItem>
              {practitioners.map((practitioner) => (
                <SelectItem 
                  key={practitioner.id} 
                  value={practitioner.id.toString()}
                >
                  {practitioner.first_name} {practitioner.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedAppointmentType}
            onValueChange={setSelectedAppointmentType}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Appointment Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {appointmentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedDateRange}
            onValueChange={setSelectedDateRange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Last Visit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="60">30-60 Days</SelectItem>
              <SelectItem value="90">60-90 Days</SelectItem>
              <SelectItem value="90plus">90+ Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-2">
            <TabsTrigger value="all" className="flex items-center gap-1">
              All
              <Badge variant="secondary">{getCategoryCount('all')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex items-center gap-1">
              Cancelled
              <Badge variant="secondary">{getCategoryCount('cancelled')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="no-second" className="flex items-center gap-1">
              No 2nd Booking
              <Badge variant="secondary">{getCategoryCount('no-second')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="gap" className="flex items-center gap-1">
              Booking Gap
              <Badge variant="secondary">{getCategoryCount('gap')}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedTab} className="mt-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Gap</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Practitioner</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No patients found matching the selected criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          {appointment.patientName}
                        </TableCell>
                        <TableCell>
                          {format(new Date(appointment.lastAppointmentDate), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              appointment.gapDays > 90 
                                ? "bg-red-100 text-red-800 hover:bg-red-200" 
                                : appointment.gapDays > 60
                                ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            }
                          >
                            {appointment.gapDays} days
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {appointment.appointmentType || "N/A"}
                        </TableCell>
                        <TableCell>
                          {appointment.practitionerName}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm"
                            className="bg-cliniko-primary hover:bg-cliniko-accent"
                            onClick={() => handleSendBookingLink(appointment.patientId, appointment.patientName)}
                          >
                            <Send className="h-3.5 w-3.5 mr-1" />
                            Send Link
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RebookingTrackerDashboard;
