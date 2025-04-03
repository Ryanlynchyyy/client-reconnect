
import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import AppLayout from '@/components/layout/AppLayout';
import { FollowUpProvider } from '@/contexts/FollowUpContext';
import { WorkCoverTracker } from '@/components/workcover/WorkCoverTracker';

const WorkCover = () => {
  return (
    <FollowUpProvider>
      <AppLayout>
        <WorkCoverTracker />
      </AppLayout>
    </FollowUpProvider>
  );
};

export default WorkCover;
