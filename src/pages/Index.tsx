
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/components/dashboard/Dashboard';
import { FollowUpProvider } from '@/contexts/FollowUpContext';

const Index = () => {
  return (
    <FollowUpProvider>
      <AppLayout>
        <Dashboard />
      </AppLayout>
    </FollowUpProvider>
  );
};

export default Index;
