
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  CalendarX, 
  User, 
  UserCheck, 
  CalendarClock, 
  MessageSquare, 
  Check 
} from 'lucide-react';
import { mockPractitioners } from '@/data/mockPatients';

interface PatientFiltersProps {
  timeFilter: string;
  setTimeFilter: (filter: string) => void;
  practitionerFilter: number | null;
  setPractitionerFilter: (id: number | null) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

const PatientFilters: React.FC<PatientFiltersProps> = ({
  timeFilter,
  setTimeFilter,
  practitionerFilter,
  setPractitionerFilter,
  statusFilter,
  setStatusFilter
}) => {
  const [minDays, setMinDays] = React.useState(14);
  
  return (
    <Card className="border-beach-sand bg-gradient-to-r from-blue-50 to-cyan-50">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Time-based filters */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-1.5 text-gray-700">
              <Clock className="h-4 w-4 text-beach-ocean" />
              Time Since Last Visit
            </h3>
            
            <div className="space-y-2.5">
              <Select 
                value={timeFilter} 
                onValueChange={setTimeFilter}
              >
                <SelectTrigger className="w-full border-beach-coral/30 focus-visible:ring-beach-ocean">
                  <SelectValue placeholder="All time periods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time periods</SelectItem>
                  <SelectItem value="initial-2-weeks">Initial (2 weeks)</SelectItem>
                  <SelectItem value="last-30-days">Last 14-30 days</SelectItem>
                  <SelectItem value="last-90-days">Last 30-90 days</SelectItem>
                  <SelectItem value="90-plus-days">90+ days</SelectItem>
                </SelectContent>
              </Select>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-gray-500">Minimum Days Since Visit</Label>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs py-0 px-2">
                    {minDays}+ days
                  </Badge>
                </div>
                
                <Slider
                  defaultValue={[14]}
                  max={120}
                  min={7}
                  step={7}
                  value={[minDays]}
                  onValueChange={(val) => setMinDays(val[0])}
                />
                
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>7d</span>
                  <span>30d</span>
                  <span>60d</span>
                  <span>90d</span>
                  <span>120d</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Practitioner filters */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-1.5 text-gray-700">
              <User className="h-4 w-4 text-beach-ocean" />
              Practitioner
            </h3>
            
            <Select 
              value={practitionerFilter?.toString() || "all"} 
              onValueChange={(val) => setPractitionerFilter(val === "all" ? null : Number(val))}
            >
              <SelectTrigger className="border-beach-coral/30 focus-visible:ring-beach-ocean">
                <SelectValue placeholder="All practitioners" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All practitioners</SelectItem>
                {mockPractitioners.map(practitioner => (
                  <SelectItem key={practitioner.id} value={practitioner.id.toString()}>
                    Dr. {practitioner.first_name} {practitioner.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Separator className="my-2" />
            
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500">Highlight Patients</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between space-x-2 bg-blue-50 p-2 rounded">
                  <Label htmlFor="initial" className="text-xs text-blue-700 flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    Initial
                  </Label>
                  <Switch id="initial" />
                </div>
                
                <div className="flex items-center justify-between space-x-2 bg-red-50 p-2 rounded">
                  <Label htmlFor="cancelled" className="text-xs text-red-700 flex items-center gap-1">
                    <CalendarX className="h-3 w-3" />
                    Cancelled
                  </Label>
                  <Switch id="cancelled" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Status filters */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-1.5 text-gray-700">
              <CalendarClock className="h-4 w-4 text-beach-ocean" />
              Patient Status
            </h3>
            
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="border-beach-coral/30 focus-visible:ring-beach-ocean">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="cancelled">Recently cancelled</SelectItem>
                <SelectItem value="no-followup">No second booking</SelectItem>
                <SelectItem value="pending">Need follow-up</SelectItem>
                <SelectItem value="contacted">Already contacted</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            
            <Separator className="my-2" />
            
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500">Follow-up Status</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <Badge className="justify-start gap-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer">
                  <MessageSquare className="h-3 w-3" />
                  Pending
                </Badge>
                
                <Badge className="justify-start gap-1 bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer">
                  <Check className="h-3 w-3" />
                  Contacted
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        {/* Active filters display */}
        {(timeFilter !== 'all' || practitionerFilter !== null || statusFilter !== 'all') && (
          <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 self-center">Active filters:</span>
            
            {timeFilter !== 'all' && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                <Clock className="h-3 w-3" />
                {timeFilter === 'initial-2-weeks' ? 'Initial 2w' : 
                 timeFilter === 'last-30-days' ? '14-30 days' :
                 timeFilter === 'last-90-days' ? '30-90 days' : '90+ days'}
              </Badge>
            )}
            
            {practitionerFilter !== null && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 gap-1">
                <User className="h-3 w-3" />
                {mockPractitioners.find(p => p.id === practitionerFilter)?.first_name || 'Unknown'}
              </Badge>
            )}
            
            {statusFilter !== 'all' && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                {statusFilter === 'cancelled' && <CalendarX className="h-3 w-3" />}
                {statusFilter === 'no-followup' && <UserCheck className="h-3 w-3" />}
                {statusFilter === 'pending' && <MessageSquare className="h-3 w-3" />}
                {statusFilter === 'contacted' && <Check className="h-3 w-3" />}
                {statusFilter === 'dismissed' && <Check className="h-3 w-3" />}
                {statusFilter === 'cancelled' ? 'Cancelled' :
                 statusFilter === 'no-followup' ? 'No second booking' :
                 statusFilter === 'pending' ? 'Need follow-up' :
                 statusFilter === 'contacted' ? 'Contacted' : 'Dismissed'}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientFilters;
