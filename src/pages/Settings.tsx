
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import SettingsComponent from '@/components/settings/Settings';
import { FollowUpProvider } from '@/contexts/FollowUpContext';

const Settings = () => {
  return (
    <FollowUpProvider>
      <AppLayout>
        <SettingsComponent />
      </AppLayout>
    </FollowUpProvider>
  );
};

export default Settings;
