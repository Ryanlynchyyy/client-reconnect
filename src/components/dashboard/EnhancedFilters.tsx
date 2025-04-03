
import React from 'react';
import { Calendar, Clock, Filter, Search, User, ScrollText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

interface PractitionerOption {
  id: number;
  name: string;
}

interface FilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  practitioners: PractitionerOption[];
  selectedPractitioner: number | null;
  setSelectedPractitioner: (id: number | null) => void;
  minGapDays: number;
  setMinGapDays: (days: number) => void;
  statusFilters: Record<string, boolean>;
  setStatusFilters: (filters: Record<string, boolean>) => void;
  appointmentTypes: string[];
  selectedAppointmentTypes: string[];
  setSelectedAppointmentTypes: (types: string[]) => void;
}

const EnhancedFilters: React.FC<FilterProps> = ({
  searchTerm,
  setSearchTerm,
  practitioners,
  selectedPractitioner,
  setSelectedPractitioner,
  minGapDays, 
  setMinGapDays,
  statusFilters,
  setStatusFilters,
  appointmentTypes,
  selectedAppointmentTypes,
  setSelectedAppointmentTypes
}) => {
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  
  const handleStatusFilterChange = (status: string, checked: boolean) => {
    setStatusFilters({
      ...statusFilters,
      [status]: checked
    });
  };
  
  const handleAppointmentTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedAppointmentTypes([...selectedAppointmentTypes, type]);
    } else {
      setSelectedAppointmentTypes(selectedAppointmentTypes.filter(t => t !== type));
    }
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPractitioner(null);
    setMinGapDays(14);
    setStatusFilters({
      cancelled: true,
      'no-followup': true,
      'large-gap': true
    });
    setSelectedAppointmentTypes([]);
  };
  
  return (
    <Card className="bg-beach-foam shadow-sm border-beach-sand">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <div className="w-full sm:max-w-md relative">
            <Input
              placeholder="Search patients, notes or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-beach-coral/30 focus-visible:ring-beach-ocean"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-beach-coral h-4 w-4" />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Select
              value={selectedPractitioner?.toString() || ""}
              onValueChange={(value) => setSelectedPractitioner(value ? parseInt(value) : null)}
            >
              <SelectTrigger className="w-full sm:w-[180px] border-beach-coral/30">
                <User className="h-4 w-4 mr-2 text-beach-coral" />
                <SelectValue placeholder="All Practitioners" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Practitioners</SelectItem>
                {practitioners.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-beach-ocean/50 text-beach-ocean hover:bg-beach-ocean/10 gap-1.5"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-beach-ocean" />
                        Minimum Gap Days
                      </Label>
                      <span className="text-sm font-medium text-beach-ocean bg-beach-foam px-2 py-0.5 rounded-full">
                        {minGapDays}+ days
                      </span>
                    </div>
                    <Slider
                      defaultValue={[minGapDays]}
                      max={90}
                      min={14}
                      step={1}
                      className="mt-2"
                      onValueChange={(values) => setMinGapDays(values[0])}
                    />
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>14d</span>
                      <span>30d</span>
                      <span>60d</span>
                      <span>90d</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-beach-ocean" />
                      Status Types
                    </Label>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(statusFilters).map(([status, checked]) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={checked}
                            onCheckedChange={(checked) => 
                              handleStatusFilterChange(status, !!checked)
                            }
                          />
                          <Label htmlFor={`status-${status}`} className="text-sm capitalize">
                            {status === 'no-followup' ? 'No Follow-up' : 
                             status === 'large-gap' ? 'Large Gap' : status}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <ScrollText className="h-4 w-4 text-beach-ocean" />
                      Appointment Types
                    </Label>
                    <div className="grid grid-cols-1 gap-2">
                      {appointmentTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={selectedAppointmentTypes.includes(type)}
                            onCheckedChange={(checked) => 
                              handleAppointmentTypeChange(type, !!checked)
                            }
                          />
                          <Label htmlFor={`type-${type}`} className="text-sm">
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => {
                      clearFilters();
                      setFiltersOpen(false);
                    }}
                  >
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Clear All Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedFilters;
