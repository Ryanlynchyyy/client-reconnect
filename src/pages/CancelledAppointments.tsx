
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { FollowUpProvider } from '@/contexts/FollowUpContext';
import { CancelledAppointmentsView } from '@/components/cancelled-appointments/CancelledAppointmentsView';

const CancelledAppointments = () => {
  return (
    <FollowUpProvider>
      <AppLayout>
        <CancelledAppointmentsView />
      </AppLayout>
    </FollowUpProvider>
  );
};

export default CancelledAppointments;
