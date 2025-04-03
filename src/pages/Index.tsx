
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/components/dashboard/Dashboard';
import { FollowUpProvider } from '@/contexts/FollowUpContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, ArrowUpRight, Wave, SunMedium } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  const [isExampleData, setIsExampleData] = useState(true);
  const [greeting, setGreeting] = useState('');
  
  // Check if the user has an API key set
  useEffect(() => {
    const hasApiKey = !!localStorage.getItem('cliniko_api_key');
    setIsExampleData(!hasApiKey);
    
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  return (
    <FollowUpProvider>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-beach-ocean flex items-center">
                {greeting}, <span className="text-gray-800 ml-2">Joshua</span>
                <SunMedium className="w-6 h-6 ml-3 text-beach-sunset" />
              </h1>
              <p className="text-gray-500 mt-1">
                Body in Mind Physio | Patient Follow-up Dashboard
              </p>
            </div>
            <div className="flex items-center mt-4 md:mt-0">
              <div className="w-8 h-8 rounded-full bg-beach-ocean flex items-center justify-center text-white font-bold mr-2">
                JB
              </div>
            </div>
          </div>
          
          {isExampleData && (
            <Alert 
              variant="default" 
              className="bg-beach-sand text-beach-ocean border-beach-coral mb-6 shadow-sm wave-bottom"
            >
              <div className="flex items-center">
                <InfoIcon className="h-5 w-5 mr-2 text-beach-ocean" />
                <div className="flex-1">
                  <AlertTitle className="font-semibold text-beach-ocean">Example Data Mode</AlertTitle>
                  <AlertDescription className="mt-1 text-gray-700">
                    You're currently viewing example data. Connect your Cliniko API key in Settings to use real patient data.
                  </AlertDescription>
                </div>
                <Link to="/settings">
                  <Button className="bg-beach-ocean hover:bg-beach-ocean/90 text-white">
                    Connect <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </Alert>
          )}
          
          <div className="bg-white bg-opacity-80 backdrop-blur-sm p-4 rounded-lg border border-beach-sand shadow-sm">
            <h2 className="text-lg font-medium text-beach-ocean mb-3 flex items-center">
              <Wave className="w-5 h-5 mr-2 text-beach-coral" />
              Body in Mind Follow-Up System
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Welcome to the Body in Mind patient follow-up system. This dashboard helps you track and manage patient follow-ups, appointments, and communications.
            </p>
          </div>
          
          <Dashboard includeGapDetection={true} />
        </div>
      </AppLayout>
    </FollowUpProvider>
  );
};

export default Index;
