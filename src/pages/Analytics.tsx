
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { FollowUpProvider } from '@/contexts/FollowUpContext';
import PatientAnalytics from '@/components/analytics/PatientAnalytics';

const Analytics = () => {
  return (
    <FollowUpProvider>
      <AppLayout>
        <PatientAnalytics />
      </AppLayout>
    </FollowUpProvider>
  );
};

export default Analytics;
