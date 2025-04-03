
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Users, Hourglass, MessageSquare, CalendarX2, Bell } from 'lucide-react';
import { PatientWithFollowUpStatus } from '@/types/clinikoTypes';

interface StatCardsProps {
  filteredPatients: PatientWithFollowUpStatus[];
  groupedPatients: {
    all: PatientWithFollowUpStatus[];
    pending: PatientWithFollowUpStatus[];
    contacted: PatientWithFollowUpStatus[];
    dismissed: PatientWithFollowUpStatus[];
  };
  rangePatients: {
    '30-60': PatientWithFollowUpStatus[];
    '60-90': PatientWithFollowUpStatus[];
    '90+': PatientWithFollowUpStatus[];
  };
  cancelledAppointments: Array<{
    id: number;
    status: string;
  }>;
  filterDays: number;
}

const StatCards: React.FC<StatCardsProps> = ({
  filteredPatients,
  groupedPatients,
  rangePatients,
  cancelledAppointments,
  filterDays
}) => {
  // Calculate pending percentage as a number
  const pendingPercentage = Math.min(100, (groupedPatients.pending.length / Math.max(1, filteredPatients.length)) * 100);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 hover:border-indigo-300 transition-colors">
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Total Patients</p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-bold">{filteredPatients.length}</h3>
                <span className="text-sm text-muted-foreground">
                  {filterDays}+ days
                </span>
              </div>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
              <Users size={24} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0 pb-3">
          <div className="grid grid-cols-2 gap-2 w-full">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Priority</p>
              <p className="font-semibold text-amber-600">
                {rangePatients['90+'].length}
              </p>
            </div>
            <div className="text-center border-l border-gray-100">
              <p className="text-xs text-muted-foreground">Recent</p>
              <p className="font-semibold text-green-600">
                {rangePatients['30-60'].length}
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>

      <Card className="bg-gradient-to-br from-sky-50 to-white border-sky-100 hover:border-sky-300 transition-colors">
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Pending Follow-ups</p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-bold">{groupedPatients.pending.length}</h3>
                <span className="text-sm text-muted-foreground">
                  patients
                </span>
              </div>
            </div>
            <div className="h-12 w-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-700">
              <Hourglass size={24} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0 pb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-full bg-sky-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-sky-500 rounded-full" 
                style={{ 
                  width: `${pendingPercentage}%` 
                }}
              ></div>
            </div>
            <span className="text-xs font-medium">
              {pendingPercentage.toFixed(0)}%
            </span>
          </div>
        </CardFooter>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100 hover:border-amber-300 transition-colors">
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Contacted Patients</p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-bold">{groupedPatients.contacted.length}</h3>
                <span className="text-sm text-muted-foreground">
                  awaiting response
                </span>
              </div>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-700">
              <MessageSquare size={24} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0 pb-3">
          <div className="flex items-center gap-1 text-sm">
            <Bell size={14} className="text-amber-600" />
            <span className="text-muted-foreground">
              {groupedPatients.contacted.length > 0 ? 
                `${groupedPatients.contacted.length} follow-up${groupedPatients.contacted.length !== 1 ? 's' : ''} in progress` : 
                'No active follow-ups'}
            </span>
          </div>
        </CardFooter>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-white border-red-100 hover:border-red-300 transition-colors">
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Missed Appointments</p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-bold">
                  {cancelledAppointments.filter(a => a.status === "missed" || a.status === "cancelled").length}
                </h3>
                <span className="text-sm text-muted-foreground">
                  need attention
                </span>
              </div>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-700">
              <CalendarX2 size={24} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0 pb-3">
          <div className="grid grid-cols-2 gap-2 w-full">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">No-shows</p>
              <p className="font-semibold text-red-600">
                {cancelledAppointments.filter(a => a.status === "missed").length}
              </p>
            </div>
            <div className="text-center border-l border-gray-100">
              <p className="text-xs text-muted-foreground">Cancelled</p>
              <p className="font-semibold text-orange-600">
                {cancelledAppointments.filter(a => a.status === "cancelled").length}
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StatCards;
