
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/components/dashboard/Dashboard';
import { FollowUpProvider } from '@/contexts/FollowUpContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
        <div className="space-y-6">
          {isExampleData && (
            <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200 mb-4 shadow-sm">
              <div className="flex items-center">
                <InfoIcon className="h-4 w-4 mr-2" />
                <div className="flex-1">
                  <AlertTitle className="font-semibold">Example Data Mode</AlertTitle>
                  <AlertDescription className="mt-1">
                    You're currently viewing example data. Connect your Cliniko API key in Settings to use real data.
                  </AlertDescription>
                </div>
                <Link to="/settings">
                  <Button variant="outline" size="sm" className="border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-800">
                    Connect <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </Alert>
          )}
          
          <Dashboard includeGapDetection={true} />
        </div>
      </AppLayout>
    </FollowUpProvider>
  );
};

export default Index;
