
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import SmsTemplates from '@/components/sms/SmsTemplates';
import { FollowUpProvider } from '@/contexts/FollowUpContext';

const SMSTemplatesPage = () => {
  return (
    <FollowUpProvider>
      <AppLayout>
        <SmsTemplates />
      </AppLayout>
    </FollowUpProvider>
  );
};

export default SMSTemplatesPage;
