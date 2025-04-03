
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
  ArrowUpDown,
  Send,
  CalendarPlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GapStats } from './GapStats';
import { AppointmentList } from './AppointmentList';

// Mock data - in a real app this would come from your context or API
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

export function CancelledAppointmentsView() {
  const { toast } = useToast();
  const [gaps, setGaps] = useState(mockGaps);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPractitioner, setSelectedPractitioner] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [minGapDays, setMinGapDays] = useState(30);
  const [sortField, setSortField] = useState<'date' | 'name'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
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

  // Sort the filtered gaps
  const sortedGaps = [...filteredGaps].sort((a, b) => {
    if (sortField === 'date') {
      return sortDirection === 'asc' 
        ? a.gapDays - b.gapDays 
        : b.gapDays - a.gapDays;
    } else {
      return sortDirection === 'asc'
        ? a.patientName.localeCompare(b.patientName)
        : b.patientName.localeCompare(a.patientName);
    }
  });

  const handleSendMessage = (patientId: number, patientName: string) => {
    toast({
      title: "Message Sent",
      description: `Booking reminder sent to ${patientName}`,
    });
  };

  const handleToggleSort = (field: 'date' | 'name') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusCount = (status: string) => {
    return gaps.filter(g => status === "all" ? true : g.status === status).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cancelled Appointments</h1>
          <p className="text-muted-foreground">
            Find patients who've cancelled, missed appointments, or have large booking gaps
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <CalendarPlus className="h-4 w-4" /> 
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button 
            className="bg-cliniko-primary hover:bg-cliniko-accent flex items-center gap-1"
            size="sm"
            onClick={() => toast({ title: "Sending reminders", description: "Sending booking reminders to all patients with cancelled appointments" })}
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Bulk Send</span>
          </Button>
        </div>
      </div>

      <GapStats getStatusCount={getStatusCount} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Appointment Management</CardTitle>
          <CardDescription>Track and follow up on patients who need rebooking</CardDescription>
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
                value={selectedPractitioner?.toString() || "all"}
                onValueChange={(value) => setSelectedPractitioner(value === "all" ? null : parseInt(value))}
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                  <div className="space-y-1 w-full sm:w-auto">
                    <label className="text-sm font-medium">Sort by</label>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={`flex items-center gap-1 ${sortField === 'date' ? 'bg-muted' : ''}`}
                        onClick={() => handleToggleSort('date')}
                      >
                        Date
                        {sortField === 'date' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={`flex items-center gap-1 ${sortField === 'name' ? 'bg-muted' : ''}`}
                        onClick={() => handleToggleSort('name')}
                      >
                        Name
                        {sortField === 'name' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
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
              <AppointmentList 
                gaps={sortedGaps} 
                onSendMessage={handleSendMessage} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
