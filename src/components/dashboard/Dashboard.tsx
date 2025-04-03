import React, { useState, useEffect } from 'react';
import DashboardSearch from './DashboardSearch';
import EnhancedFollowUpDashboard from './EnhancedFollowUpDashboard';

interface DashboardProps {
  includeGapDetection?: boolean;
}

const Dashboard = ({ includeGapDetection = false }: DashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Use our new EnhancedFollowUpDashboard component instead of RebookingTrackerDashboard */}
      {includeGapDetection && (
        <div className="pt-4">
          <EnhancedFollowUpDashboard />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
