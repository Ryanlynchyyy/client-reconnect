import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CalendarClock,
  CalendarX2,
  UserX,
  Search,
  X,
  Filter,
  Phone,
  CalendarCheck,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mockGaps = [
  {
    id: 1,
    patientId: 201,
    patientName: "Emily Johnson",
    lastAppointmentDate: "2025-03-15",
    gapDays: 35,
    status: "cancelled",
    appointmentType: "Initial Consultation",
    phone: "0412 345 678",
    email: "emily.johnson@example.com",
    practitionerId: 1,
    practitionerName: "Ben Johnson"
  },
  {
    id: 2,
    patientId: 202,
    patientName: "Thomas Wilson",
    lastAppointmentDate: "2025-03-01",
    gapDays: 49,
    status: "large-gap",
    appointmentType: "Follow-up",
    phone: "0423 456 789",
    email: "thomas.wilson@example.com",
    practitionerId: 2,
    practitionerName: "Josh Miller"
  },
  {
    id: 3,
    patientId: 203,
    patientName: "Sophia Martinez",
    lastAppointmentDate: "2025-02-20",
    gapDays: 58,
    status: "missed",
    appointmentType: "Treatment",
    phone: "0434 567 890",
    email: "sophia.martinez@example.com",
    practitionerId: 1,
    practitionerName: "Ben Johnson"
  },
  {
    id: 4,
    patientId: 204,
    patientName: "Alexander Brown",
    lastAppointmentDate: "2025-03-10",
    gapDays: 40,
    status: "no-followup",
    appointmentType: "Initial Consultation",
    phone: "0445 678 901",
    email: "alex.brown@example.com",
    practitionerId: 2,
    practitionerName: "Josh Miller"
  },
  {
    id: 5,
    patientId: 205,
    patientName: "Olivia Taylor",
    lastAppointmentDate: "2025-02-15",
    gapDays: 63,
    status: "cancelled",
    appointmentType: "Follow-up",
    phone: "0456 789 012",
    email: "olivia.taylor@example.com",
    practitionerId: 1,
    practitionerName: "Ben Johnson"
  },
];

export function BookingGapDetection() {
  const { toast } = useToast();
  const [gaps, setGaps] = useState(mockGaps);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPractitioner, setSelectedPractitioner] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [minGapDays, setMinGapDays] = useState(30);
  
  const practitioners = [
    { id: 1, name: "Ben Johnson" },
    { id: 2, name: "Josh Miller" },
  ];

  const filteredGaps = gaps.filter(gap => {
    const matchesSearch = !searchTerm || 
      gap.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gap.phone.includes(searchTerm);
    
    const matchesPractitioner = !selectedPractitioner || 
      gap.practitionerId === selectedPractitioner;
    
    const matchesStatus = selectedTab === "all" || 
      gap.status === selectedTab;
    
    const matchesMinGap = gap.gapDays >= minGapDays;
    
    return matchesSearch && matchesPractitioner && matchesStatus && matchesMinGap;
  });

  const handleSendMessage = (patientId: number, patientName: string) => {
    toast({
      title: "Message Sent",
      description: `Booking reminder sent to ${patientName}`,
    });
  };

  const getPractitionerColor = (practitionerId: number) => {
    switch (practitionerId) {
      case 1: return "bg-blue-100 text-blue-800";
      case 2: return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "cancelled": return "bg-orange-100 text-orange-800";
      case "missed": return "bg-red-100 text-red-800";
      case "large-gap": return "bg-yellow-100 text-yellow-800";
      case "no-followup": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "cancelled": return <CalendarX2 className="h-4 w-4 mr-1" />;
      case "missed": return <UserX className="h-4 w-4 mr-1" />;
      case "large-gap": return <CalendarClock className="h-4 w-4 mr-1" />;
      case "no-followup": return <CalendarCheck className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  const getStatusCount = (status: string) => {
    return gaps.filter(g => status === "all" ? true : g.status === status).length;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Booking Gap Detection</h1>
        <p className="text-muted-foreground">
          Find patients with booking gaps, cancellations, or who haven't returned
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-orange-800">
              {getStatusCount('cancelled')}
            </CardTitle>
            <CardDescription className="text-orange-700">Cancelled Appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CalendarX2 className="h-8 w-8 text-orange-500 mr-2" />
              <p className="text-sm text-muted-foreground">
                Cancelled and never rebooked
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-red-800">
              {getStatusCount('missed')}
            </CardTitle>
            <CardDescription className="text-red-700">DNA/No-shows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-red-500 mr-2" />
              <p className="text-sm text-muted-foreground">
                Missed appointments without reschedule
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-yellow-800">
              {getStatusCount('large-gap')}
            </CardTitle>
            <CardDescription className="text-yellow-700">Large Booking Gaps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CalendarClock className="h-8 w-8 text-yellow-500 mr-2" />
              <p className="text-sm text-muted-foreground">
                Long gaps between appointments
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-purple-800">
              {getStatusCount('no-followup')}
            </CardTitle>
            <CardDescription className="text-purple-700">No Second Booking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CalendarCheck className="h-8 w-8 text-purple-500 mr-2" />
              <p className="text-sm text-muted-foreground">
                Initial consult without follow-up
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Booking Gap Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="relative w-full sm:w-auto sm:min-w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients or phone numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>
              <Select
                value={selectedPractitioner?.toString() || ""}
                onValueChange={(value) => setSelectedPractitioner(value ? parseInt(value) : null)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Practitioners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Practitioners</SelectItem>
                  {practitioners.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showFilters && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4 pb-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="space-y-1 w-full sm:w-auto">
                    <label className="text-sm font-medium">Min Gap (Days)</label>
                    <Select 
                      value={minGapDays.toString()} 
                      onValueChange={(val) => setMinGapDays(parseInt(val))}
                    >
                      <SelectTrigger className="w-full sm:w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="45">45 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-2">
              <TabsTrigger value="all" className="flex items-center gap-1">
                All Gaps
                <Badge variant="secondary">{getStatusCount('all')}</Badge>
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex items-center gap-1">
                Cancelled
                <Badge variant="secondary">{getStatusCount('cancelled')}</Badge>
              </TabsTrigger>
              <TabsTrigger value="missed" className="flex items-center gap-1">
                Missed
                <Badge variant="secondary">{getStatusCount('missed')}</Badge>
              </TabsTrigger>
              <TabsTrigger value="large-gap" className="flex items-center gap-1">
                Large Gap
                <Badge variant="secondary">{getStatusCount('large-gap')}</Badge>
              </TabsTrigger>
              <TabsTrigger value="no-followup" className="flex items-center gap-1">
                No Follow-up
                <Badge variant="secondary">{getStatusCount('no-followup')}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-0">
              {filteredGaps.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No booking gaps found matching your criteria</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredGaps.map((gap) => (
                    <Card key={gap.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-medium">{gap.patientName}</h3>
                              <Badge className={getPractitionerColor(gap.practitionerId)}>
                                {gap.practitionerName}
                              </Badge>
                              <Badge className={getStatusColor(gap.status)} variant="secondary">
                                {getStatusIcon(gap.status)}
                                {gap.status === "cancelled" && "Cancelled"}
                                {gap.status === "missed" && "Missed Appointment"}
                                {gap.status === "large-gap" && `${gap.gapDays} Day Gap`}
                                {gap.status === "no-followup" && "No Follow-up"}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                              <span>Last Appointment: {format(new Date(gap.lastAppointmentDate), "PPP")}</span>
                              <span>{gap.appointmentType}</span>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <Phone className="h-4 w-4" />
                              {gap.phone}
                            </Button>
                            <Button
                              className="bg-cliniko-primary hover:bg-cliniko-accent"
                              onClick={() => handleSendMessage(gap.patientId, gap.patientName)}
                            >
                              Send Booking Link
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
