
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/components/dashboard/Dashboard';
import { FollowUpProvider } from '@/contexts/FollowUpContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Follow-Up Dashboard</h1>
            <p className="text-muted-foreground">
              Manage patient follow-ups and send reminder messages
            </p>
          </div>
          
          {isExampleData && (
            <Alert className="mb-6">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Example Data Mode</AlertTitle>
              <AlertDescription>
                You're currently viewing example data to demonstrate how the application works. 
                Connect your Cliniko API key in Settings to use with real data.
              </AlertDescription>
            </Alert>
          )}
          
          <Dashboard />
        </div>
      </AppLayout>
    </FollowUpProvider>
  );
};

export default Index;
