
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PatientsComponent from '@/components/patients/Patients';
import { FollowUpProvider } from '@/contexts/FollowUpContext';

const Patients = () => {
  return (
    <FollowUpProvider>
      <AppLayout>
        <PatientsComponent />
      </AppLayout>
    </FollowUpProvider>
  );
};

export default Patients;
