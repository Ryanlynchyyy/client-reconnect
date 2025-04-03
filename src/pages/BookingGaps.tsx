
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { FollowUpProvider } from '@/contexts/FollowUpContext';
import { BookingGapDetection } from '@/components/booking-gaps/BookingGapDetection';

const BookingGaps = () => {
  return (
    <FollowUpProvider>
      <AppLayout>
        <BookingGapDetection />
      </AppLayout>
    </FollowUpProvider>
  );
};

export default BookingGaps;
