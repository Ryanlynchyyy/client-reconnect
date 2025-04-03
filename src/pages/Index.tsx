
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/components/dashboard/Dashboard';
import { FollowUpProvider } from '@/contexts/FollowUpContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const Index = () => {
  const [isExampleData, setIsExampleData] = useState(true);
  
  // Check if the user has an API key set
  useEffect(() => {
    const hasApiKey = !!localStorage.getItem('cliniko_api_key');
    setIsExampleData(!hasApiKey);
  }, []);

  return (
    <FollowUpProvider>
      <AppLayout>
        <div className="space-y-4">
          {isExampleData && (
            <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200 mb-4">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Example Data Mode</AlertTitle>
              <AlertDescription>
                You're currently viewing example data. Connect your Cliniko API key in Settings to use real data.
              </AlertDescription>
            </Alert>
          )}
          
          <Dashboard includeGapDetection={true} />
        </div>
      </AppLayout>
    </FollowUpProvider>
  );
};

export default Index;
