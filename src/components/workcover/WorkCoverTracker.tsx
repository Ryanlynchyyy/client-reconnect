import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ClipboardList,
  FileDown,
  FileText,
  Filter,
  Plus,
  Search,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const mockReferrals = [
  {
    id: 1,
    patientId: 101,
    patientName: "John Smith",
    referralDate: "2025-03-01",
    referralNumber: "WC-2025-1001",
    approvedSessions: 8,
    usedSessions: 6,
    practitionerId: 1,
    practitionerName: "Ben Johnson",
    status: "active",
    nextReviewDate: "2025-04-15",
    notes: "Lower back injury - L4/L5 disc bulge"
  },
  {
    id: 2,
    patientId: 102,
    patientName: "Sarah Williams",
    referralDate: "2025-03-05",
    referralNumber: "WC-2025-1002",
    approvedSessions: 8,
    usedSessions: 8,
    practitionerId: 2,
    practitionerName: "Josh Miller",
    status: "active",
    nextReviewDate: "2025-04-10",
    notes: "Rotator cuff tear - right shoulder"
  },
  {
    id: 3,
    patientId: 103,
    patientName: "Michael Brown",
    referralDate: "2025-02-15",
    referralNumber: "WC-2025-1003",
    approvedSessions: 16,
    usedSessions: 12,
    practitionerId: 1,
    practitionerName: "Ben Johnson",
    status: "active",
    nextReviewDate: "2025-04-05",
    notes: "Knee reconstruction rehab - ACL"
  },
  {
    id: 4,
    patientId: 104,
    patientName: "Jessica Taylor",
    referralDate: "2025-03-10",
    referralNumber: "WC-2025-1004",
    approvedSessions: 8,
    usedSessions: 2,
    practitionerId: 2,
    practitionerName: "Josh Miller",
    status: "active",
    nextReviewDate: "2025-05-01",
    notes: "Cervical spine strain - whiplash"
  },
  {
    id: 5,
    patientId: 105,
    patientName: "David Wilson",
    referralDate: "2025-02-20",
    referralNumber: "WC-2025-1005",
    approvedSessions: 8,
    usedSessions: 7,
    practitionerId: 1,
    practitionerName: "Ben Johnson",
    status: "active",
    nextReviewDate: "2025-04-10",
    notes: "Lumbar strain - manual handling injury"
  },
];

export function WorkCoverTracker() {
  const { toast } = useToast();
  const [referrals, setReferrals] = useState(mockReferrals);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPractitioner, setSelectedPractitioner] = useState<number | null>(null);
  const [showAddReferral, setShowAddReferral] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  
  const practitioners = [
    { id: 1, name: "Ben Johnson" },
    { id: 2, name: "Josh Miller" },
  ];

  const filteredReferrals = referrals.filter(referral => {
    const matchesSearch = !searchTerm || 
      referral.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referralNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPractitioner = !selectedPractitioner || 
      referral.practitionerId === selectedPractitioner;
    
    return matchesSearch && matchesPractitioner;
  });

  const priorityReferrals = filteredReferrals.filter(
    ref => ref.usedSessions >= 6 && ref.usedSessions < ref.approvedSessions
  );

  const warningReferrals = filteredReferrals.filter(
    ref => ref.usedSessions >= ref.approvedSessions
  );

  const handleNewReferral = () => {
    setShowAddReferral(false);
    
    toast({
      title: "Referral Added",
      description: "The WorkCover referral has been successfully added",
    });
  };

  const handleShowAHTRForm = (referral: any) => {
    setSelectedReferral(referral);
    setShowFormDialog(true);
  };

  const handleSubmitForm = () => {
    setShowFormDialog(false);
    
    toast({
      title: "AHTR Form Generated",
      description: `Form for patient ${selectedReferral.patientName} has been prepared for submission`,
    });
  };

  const getPractitionerColor = (practitionerId: number) => {
    switch (practitionerId) {
      case 1: return "bg-blue-100 text-blue-800 border-blue-300";
      case 2: return "bg-green-100 text-green-800 border-green-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusColor = (usedSessions: number, approvedSessions: number) => {
    const ratio = usedSessions / approvedSessions;
    if (ratio >= 1) return "bg-red-100 text-red-800 border-red-300";
    if (ratio >= 0.75) return "bg-amber-100 text-amber-800 border-amber-300";
    if (ratio >= 0.5) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-green-100 text-green-800 border-green-300";
  };

  const getProgressColor = (usedSessions: number, approvedSessions: number) => {
    const ratio = usedSessions / approvedSessions;
    if (ratio >= 1) return "bg-red-500";
    if (ratio >= 0.75) return "bg-amber-500";
    if (ratio >= 0.5) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WorkCover Automation</h1>
        <p className="text-muted-foreground">
          Track and manage WorkCover referrals, sessions and approvals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">
              {filteredReferrals.length}
            </CardTitle>
            <CardDescription>Active WorkCover Referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ClipboardList className="h-8 w-8 text-blue-500 mr-2" />
              <p className="text-sm text-muted-foreground">
                Track all active WorkCover patient referrals
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-amber-800">
              {priorityReferrals.length}
            </CardTitle>
            <CardDescription className="text-amber-700">Approaching Limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-amber-500 mr-2" />
              <p className="text-sm text-amber-700">
                Patients with 6+ sessions used (need review soon)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-red-800">
              {warningReferrals.length}
            </CardTitle>
            <CardDescription className="text-red-700">Requiring Extension</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-red-500 mr-2" />
              <p className="text-sm text-red-700">
                Patients who have used all approved sessions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>WorkCover Referrals</CardTitle>
              <CardDescription>Track referrals and approved sessions</CardDescription>
            </div>
            <Button onClick={() => setShowAddReferral(true)} className="bg-cliniko-primary hover:bg-cliniko-accent">
              <Plus className="mr-1 h-4 w-4" /> Add Referral
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="relative w-full sm:w-auto sm:min-w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients or referrals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <Select
              value={selectedPractitioner?.toString() || ""}
              onValueChange={(value) => setSelectedPractitioner(value ? parseInt(value) : null)}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by Practitioner" />
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

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Practitioner</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Review</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferrals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No referrals found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReferrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{referral.patientName}</div>
                          <div className="text-sm text-muted-foreground">{referral.referralNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPractitionerColor(referral.practitionerId)}>
                          {referral.practitionerName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {referral.usedSessions} of {referral.approvedSessions} used
                          </div>
                          <Progress 
                            value={(referral.usedSessions / referral.approvedSessions) * 100}
                            className={`h-2 ${getProgressColor(referral.usedSessions, referral.approvedSessions)}`}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(referral.usedSessions, referral.approvedSessions)}>
                          {referral.usedSessions >= referral.approvedSessions 
                            ? "Need Approval" 
                            : referral.usedSessions >= referral.approvedSessions - 2 
                              ? "Critical"
                              : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(referral.nextReviewDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleShowAHTRForm(referral)}
                          className="ml-2"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          AHTR Form
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddReferral} onOpenChange={setShowAddReferral}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New WorkCover Referral</DialogTitle>
            <DialogDescription>
              Enter the referral details to start tracking WorkCover sessions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="patient" className="text-sm font-medium">Patient Name</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="101">John Smith</SelectItem>
                    <SelectItem value="106">Emma Johnson</SelectItem>
                    <SelectItem value="107">Robert Davis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="practitioner" className="text-sm font-medium">Practitioner</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select practitioner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Ben Johnson</SelectItem>
                    <SelectItem value="2">Josh Miller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="referralNumber" className="text-sm font-medium">Referral Number</label>
                <Input id="referralNumber" placeholder="e.g. WC-2025-1006" />
              </div>
              <div className="space-y-2">
                <label htmlFor="approvedSessions" className="text-sm font-medium">Approved Sessions</label>
                <Select defaultValue="8">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8 Sessions</SelectItem>
                    <SelectItem value="16">16 Sessions</SelectItem>
                    <SelectItem value="24">24 Sessions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Treatment Notes</label>
              <Textarea id="notes" placeholder="Enter treatment details and notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddReferral(false)}>Cancel</Button>
            <Button onClick={handleNewReferral} className="bg-cliniko-primary hover:bg-cliniko-accent">
              Save Referral
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>AHTR Request Form</DialogTitle>
            <DialogDescription>
              {selectedReferral && (
                <>Allied Health Treatment Request for {selectedReferral.patientName}</>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedReferral && (
            <div className="space-y-4 py-4">
              <div className="border rounded-md p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Patient</p>
                    <p>{selectedReferral.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Claim Number</p>
                    <p>{selectedReferral.referralNumber}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Practitioner</p>
                    <p>{selectedReferral.practitionerName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Sessions</p>
                    <p>{selectedReferral.usedSessions} of {selectedReferral.approvedSessions}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Treatment Notes</p>
                  <p>{selectedReferral.notes}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Request Additional Sessions</label>
                <Select defaultValue="8">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8 Sessions</SelectItem>
                    <SelectItem value="16">16 Sessions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Treatment Progress</label>
                <Textarea placeholder="Describe the patient's progress and ongoing needs" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormDialog(false)}>Cancel</Button>
            <Button 
              variant="outline"
              className="border-cliniko-primary text-cliniko-primary hover:bg-cliniko-muted"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button onClick={handleSubmitForm} className="bg-cliniko-primary hover:bg-cliniko-accent">
              Complete & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
