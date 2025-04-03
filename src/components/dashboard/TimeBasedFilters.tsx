
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  CalendarX, 
  Filter,
  ChevronDown,
  X
} from 'lucide-react';

export type TimeFilterType = 'all' | 'initial-2-weeks' | 'last-30-days' | 'last-90-days';
export type AppointmentStatusType = 'all' | 'cancelled' | 'active';

interface TimeBasedFiltersProps {
  selectedTimeFilter: TimeFilterType;
  onTimeFilterChange: (filter: TimeFilterType) => void;
  appointmentStatusFilter: AppointmentStatusType;
  onAppointmentStatusChange: (status: AppointmentStatusType) => void;
  showFiltersExpanded: boolean;
  setShowFiltersExpanded: (show: boolean) => void;
}

export function TimeBasedFilters({
  selectedTimeFilter,
  onTimeFilterChange,
  appointmentStatusFilter,
  onAppointmentStatusChange,
  showFiltersExpanded,
  setShowFiltersExpanded
}: TimeBasedFiltersProps) {
  
  const clearFilters = () => {
    onTimeFilterChange('all');
    onAppointmentStatusChange('all');
  };

  const FilterLabel = ({ count }: { count: number }) => (
    count > 0 ? <Badge variant="secondary" className="ml-2 text-xs">{count}</Badge> : null
  );
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setShowFiltersExpanded(!showFiltersExpanded)}
          >
            <Filter className="h-4 w-4" />
            Filter Views
            <ChevronDown className={`h-4 w-4 transform transition-transform ${showFiltersExpanded ? 'rotate-180' : ''}`} />
          </Button>
          
          {selectedTimeFilter !== 'all' && (
            <Badge 
              variant="outline" 
              className="flex items-center gap-1 bg-blue-50 text-blue-800 border-blue-200"
            >
              {selectedTimeFilter === 'initial-2-weeks' 
                ? '2 weeks since initial' 
                : selectedTimeFilter === 'last-30-days' 
                  ? '30 days since last' 
                  : '90 days since last'}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onTimeFilterChange('all')}
              />
            </Badge>
          )}
          
          {appointmentStatusFilter !== 'all' && (
            <Badge 
              variant="outline" 
              className="flex items-center gap-1 bg-red-50 text-red-800 border-red-200"
            >
              {appointmentStatusFilter === 'cancelled' ? 'Cancelled' : 'Active'}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onAppointmentStatusChange('all')}
              />
            </Badge>
          )}
          
          {(selectedTimeFilter !== 'all' || appointmentStatusFilter !== 'all') && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>
      
      {showFiltersExpanded && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-blue-600" />
                Time Period
              </h3>
              <Tabs 
                value={selectedTimeFilter} 
                onValueChange={(v) => onTimeFilterChange(v as TimeFilterType)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="all">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="initial-2-weeks">
                    Initial 2w
                  </TabsTrigger>
                  <TabsTrigger value="last-30-days">
                    Last 30d
                  </TabsTrigger>
                  <TabsTrigger value="last-90-days">
                    Last 90d
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                <CalendarX className="h-4 w-4 text-red-600" />
                Appointment Status
              </h3>
              <Tabs 
                value={appointmentStatusFilter} 
                onValueChange={(v) => onAppointmentStatusChange(v as AppointmentStatusType)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="all">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="cancelled">
                    Cancelled
                  </TabsTrigger>
                  <TabsTrigger value="active">
                    Active
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
