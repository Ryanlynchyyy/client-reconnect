
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import SmsReplies from '@/components/sms/SmsReplies';
import { FollowUpProvider } from '@/contexts/FollowUpContext';

const SMSRepliesPage = () => {
  return (
    <FollowUpProvider>
      <AppLayout>
        <SmsReplies />
      </AppLayout>
    </FollowUpProvider>
  );
};

export default SMSRepliesPage;
