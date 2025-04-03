
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface DashboardSearchProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

const DashboardSearch: React.FC<DashboardSearchProps> = ({
  searchTerm,
  setSearchTerm
}) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
      <Input 
        placeholder="Search by name, phone, or treatment notes..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-9 pr-8 w-full border-cliniko-muted focus-visible:ring-cliniko-primary"
      />
      {searchTerm && (
        <button 
          onClick={() => setSearchTerm('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default DashboardSearch;
