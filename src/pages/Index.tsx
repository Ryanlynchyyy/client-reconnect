
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/components/dashboard/Dashboard';
import { FollowUpProvider } from '@/contexts/FollowUpContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const Index = () => {
  return (
    <FollowUpProvider>
      <AppLayout>
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Example Data Mode</AlertTitle>
          <AlertDescription>
            You're currently viewing example data to demonstrate how the application works. Connect your Cliniko API key in Settings to use with real data.
          </AlertDescription>
        </Alert>
        <Dashboard />
      </AppLayout>
    </FollowUpProvider>
  );
};

export default Index;
