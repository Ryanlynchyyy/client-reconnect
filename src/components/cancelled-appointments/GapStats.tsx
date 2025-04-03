
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CalendarX2, UserX, CalendarClock, CalendarCheck } from 'lucide-react';

interface GapStatsProps {
  getStatusCount: (status: string) => number;
}

export function GapStats({ getStatusCount }: GapStatsProps) {
  return (
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
  );
}
