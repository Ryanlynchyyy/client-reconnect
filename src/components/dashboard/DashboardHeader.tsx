
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  handleRefresh: () => Promise<void>;
  isLoading: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  handleRefresh,
  isLoading
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-cliniko-primary">Patient Follow-Ups</h2>
        <p className="text-muted-foreground mt-1">
          Track and engage with patients who haven't returned recently
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          className="flex items-center gap-1 border-cliniko-primary text-cliniko-primary hover:bg-cliniko-muted"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
        
        <Link to="/analytics">
          <Button variant="default" className="bg-cliniko-primary hover:bg-cliniko-accent flex items-center gap-1">
            <BarChart size={16} />
            <span className="hidden sm:inline">Analytics</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardHeader;
