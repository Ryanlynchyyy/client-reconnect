
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  ChevronDown, 
  Calendar, 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DashboardFiltersProps {
  filterDays: number;
  setFilterDays: (days: number) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sortBy: 'name' | 'date';
  setSortBy: React.Dispatch<React.SetStateAction<'name' | 'date'>>;
  sortOrder: 'asc' | 'desc';
  setSortOrder: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
  timeRange: 'all' | '2-weeks' | 'this-week' | 'today';
  setTimeRange: React.Dispatch<React.SetStateAction<'all' | '2-weeks' | 'this-week' | 'today'>>;
  appointmentCountFilter: 'all' | '1-2';
  setAppointmentCountFilter: React.Dispatch<React.SetStateAction<'all' | '1-2'>>;
  appointmentStatusFilter: 'all' | 'cancelled' | 'no-show';
  setAppointmentStatusFilter: React.Dispatch<React.SetStateAction<'all' | 'cancelled' | 'no-show'>>;
  selectedPractitionerId: number | null;
  setSelectedPractitionerId: React.Dispatch<React.SetStateAction<number | null>>;
  practitioners: Array<{id: number; first_name: string; last_name: string}>;
  getPractitionerColor: (practitionerId?: number) => string;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filterDays,
  setFilterDays,
  isFilterOpen,
  setIsFilterOpen,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  timeRange,
  setTimeRange,
  appointmentCountFilter,
  setAppointmentCountFilter,
  appointmentStatusFilter,
  setAppointmentStatusFilter,
  selectedPractitionerId,
  setSelectedPractitionerId,
  practitioners,
  getPractitionerColor,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button 
        variant="outline" 
        size="sm"
        className="flex items-center gap-1 border-cliniko-muted text-cliniko-primary"
        onClick={() => setIsFilterOpen(!isFilterOpen)}
      >
        <Filter size={14} />
        Filters
        <ChevronDown size={14} className={cn(isFilterOpen && "transform rotate-180")} />
      </Button>
      
      <Badge variant="outline" className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border-indigo-200">
        {filterDays}+ days since last visit
      </Badge>
      
      {selectedPractitionerId && (
        <Badge 
          variant="outline" 
          className={cn("cursor-pointer", getPractitionerColor(selectedPractitionerId))}
          onClick={() => setSelectedPractitionerId(null)}
        >
          {practitioners.find(p => p.id === selectedPractitionerId)?.first_name || 'Practitioner'} ×
        </Badge>
      )}

      {timeRange !== 'all' && (
        <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-300 cursor-pointer" onClick={() => setTimeRange('all')}>
          {timeRange === '2-weeks' ? '2+ weeks' : timeRange === 'this-week' ? 'This week' : 'Today'} ×
        </Badge>
      )}
      
      {appointmentCountFilter !== 'all' && (
        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 cursor-pointer" onClick={() => setAppointmentCountFilter('all')}>
          1-2 appointments ×
        </Badge>
      )}
      
      {appointmentStatusFilter !== 'all' && (
        <Badge variant="outline" className="bg-red-50 text-red-800 border-red-300 cursor-pointer" onClick={() => setAppointmentStatusFilter('all')}>
          {appointmentStatusFilter === 'cancelled' ? 'Cancelled' : 'No Show'} ×
        </Badge>
      )}
      
      {isFilterOpen && (
        <div className="w-full mt-4 bg-gray-50 p-4 rounded-md border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium mb-2 text-gray-700">Days Since Last Visit</p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={filterDays === 30 ? "default" : "outline"}
                  onClick={() => setFilterDays(30)}
                  size="sm"
                  className={filterDays === 30 ? 
                    "bg-cliniko-primary hover:bg-cliniko-accent" : 
                    "hover:bg-cliniko-muted hover:text-cliniko-primary"
                  }
                >
                  30+ days
                </Button>
                <Button 
                  variant={filterDays === 60 ? "default" : "outline"}
                  onClick={() => setFilterDays(60)}
                  size="sm"
                  className={filterDays === 60 ? 
                    "bg-cliniko-primary hover:bg-cliniko-accent" : 
                    "hover:bg-cliniko-muted hover:text-cliniko-primary"
                  }
                >
                  60+ days
                </Button>
                <Button 
                  variant={filterDays === 90 ? "default" : "outline"}
                  onClick={() => setFilterDays(90)}
                  size="sm"
                  className={filterDays === 90 ? 
                    "bg-cliniko-primary hover:bg-cliniko-accent" : 
                    "hover:bg-cliniko-muted hover:text-cliniko-primary"
                  }
                >
                  90+ days
                </Button>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2 text-gray-700">Sort By</p>
              <div className="flex space-x-2">
                <Button 
                  variant={sortBy === 'date' ? "default" : "outline"}
                  onClick={() => {
                    setSortBy('date');
                    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                  }}
                  size="sm"
                  className={sortBy === 'date' ? 
                    "bg-cliniko-primary hover:bg-cliniko-accent flex-1" : 
                    "hover:bg-cliniko-muted hover:text-cliniko-primary flex-1"
                  }
                >
                  <Calendar size={14} className="mr-1 inline" />
                  Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Button>
                <Button 
                  variant={sortBy === 'name' ? "default" : "outline"}
                  onClick={() => {
                    setSortBy('name');
                    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                  }}
                  size="sm"
                  className={sortBy === 'name' ? 
                    "bg-cliniko-primary hover:bg-cliniko-accent flex-1" : 
                    "hover:bg-cliniko-muted hover:text-cliniko-primary flex-1"
                  }
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Button>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2 text-gray-700">Practitioner</p>
              <Select 
                value={selectedPractitionerId?.toString() || "all"}
                onValueChange={(value) => {
                  setSelectedPractitionerId(value === "all" ? null : Number(value));
                }}
              >
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="All practitioners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Practitioners</SelectItem>
                  {practitioners.map(practitioner => (
                    <SelectItem key={practitioner.id} value={practitioner.id.toString()}>
                      {practitioner.first_name} {practitioner.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-sm font-medium mb-2 text-gray-700">Time Period</p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={timeRange === 'all' ? "default" : "outline"}
                  onClick={() => setTimeRange('all')}
                  size="sm"
                  className={timeRange === 'all' ? 
                    "bg-cliniko-primary hover:bg-cliniko-accent" : 
                    "hover:bg-cliniko-muted hover:text-cliniko-primary"
                  }
                >
                  All Time
                </Button>
                <Button 
                  variant={timeRange === '2-weeks' ? "default" : "outline"}
                  onClick={() => setTimeRange('2-weeks')}
                  size="sm"
                  className={timeRange === '2-weeks' ? 
                    "bg-cliniko-primary hover:bg-cliniko-accent" : 
                    "hover:bg-cliniko-muted hover:text-cliniko-primary"
                  }
                >
                  2+ Weeks
                </Button>
                <Button 
                  variant={timeRange === 'this-week' ? "default" : "outline"}
                  onClick={() => setTimeRange('this-week')}
                  size="sm"
                  className={timeRange === 'this-week' ? 
                    "bg-cliniko-primary hover:bg-cliniko-accent" : 
                    "hover:bg-cliniko-muted hover:text-cliniko-primary"
                  }
                >
                  This Week
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-medium mb-2 text-gray-700">Appointment Count</p>
              <div className="flex space-x-2">
                <Button 
                  variant={appointmentCountFilter === 'all' ? "default" : "outline"}
                  onClick={() => setAppointmentCountFilter('all')}
                  size="sm"
                  className={appointmentCountFilter === 'all' ? 
                    "bg-cliniko-primary hover:bg-cliniko-accent flex-1" : 
                    "hover:bg-cliniko-muted hover:text-cliniko-primary flex-1"
                  }
                >
                  All Patients
                </Button>
                <Button 
                  variant={appointmentCountFilter === '1-2' ? "default" : "outline"}
                  onClick={() => setAppointmentCountFilter('1-2')}
                  size="sm" 
                  className={appointmentCountFilter === '1-2' ? 
                    "bg-cliniko-primary hover:bg-cliniko-accent flex-1" : 
                    "hover:bg-cliniko-muted hover:text-cliniko-primary flex-1"
                  }
                >
                  1-2 Appointments
                </Button>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2 text-gray-700">Appointment Status</p>
              <div className="flex space-x-2">
                <Button 
                  variant={appointmentStatusFilter === 'all' ? "default" : "outline"}
                  onClick={() => setAppointmentStatusFilter('all')} 
                  size="sm"
                  className={appointmentStatusFilter === 'all' ? 
                    "bg-cliniko-primary hover:bg-cliniko-accent flex-1" : 
                    "hover:bg-cliniko-muted hover:text-cliniko-primary flex-1"
                  }
                >
                  All Status
                </Button>
                <Button 
                  variant={appointmentStatusFilter === 'cancelled' ? "default" : "outline"}
                  onClick={() => setAppointmentStatusFilter('cancelled')} 
                  size="sm"
                  className={appointmentStatusFilter === 'cancelled' ? 
                    "bg-cliniko-primary hover:bg-cliniko-accent flex-1" : 
                    "hover:bg-cliniko-muted hover:text-cliniko-primary flex-1"
                  }
                >
                  Cancelled
                </Button>
                <Button 
                  variant={appointmentStatusFilter === 'no-show' ? "default" : "outline"}
                  onClick={() => setAppointmentStatusFilter('no-show')} 
                  size="sm"
                  className={appointmentStatusFilter === 'no-show' ? 
                    "bg-cliniko-primary hover:bg-cliniko-accent flex-1" : 
                    "hover:bg-cliniko-muted hover:text-cliniko-primary flex-1"
                  }
                >
                  No Show
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFilters;
