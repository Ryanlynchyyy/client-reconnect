
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/components/dashboard/Dashboard';
import { FollowUpProvider } from '@/contexts/FollowUpContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, ArrowUpRight, Waves, SunMedium, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  const [isExampleData, setIsExampleData] = useState(true);
  const [greeting, setGreeting] = useState('');
  
  useEffect(() => {
    const hasApiKey = !!localStorage.getItem('cliniko_api_key');
    setIsExampleData(!hasApiKey);
    
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
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-beach-ocean flex items-center">
                {greeting}, <span className="text-gray-800 ml-2">Joshua</span>
                <SunMedium className="w-6 h-6 ml-3 text-beach-sunset" />
              </h1>
              <p className="text-gray-500 mt-1">
                Body in Mind Physio | Patient Follow-up Dashboard
              </p>
            </div>
            <div className="flex items-center mt-4 md:mt-0 gap-2">
              <Button variant="outline" className="border-beach-coral/50 text-beach-coral gap-1 hidden md:flex">
                <Bell className="h-4 w-4" />
                <span>2</span> <span>Notifications</span>
              </Button>
              <div className="w-8 h-8 rounded-full bg-beach-ocean flex items-center justify-center text-white font-bold">
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
          
          <Dashboard includeGapDetection={true} />
        </div>
      </AppLayout>
    </FollowUpProvider>
  );
};

export default Index;
