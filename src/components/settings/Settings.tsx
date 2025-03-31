
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { clinikoApi } from '@/services/clinikoApi';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, AlertCircle } from 'lucide-react';

const Settings: React.FC = () => {
  const { toast } = useToast();
  const [baseUrl, setBaseUrl] = useState(localStorage.getItem('cliniko_base_url') || 'https://api.au2.cliniko.com/v1');
  const [apiKey, setApiKey] = useState(localStorage.getItem('cliniko_api_key') || '');
  const [userAgent, setUserAgent] = useState(localStorage.getItem('cliniko_user_agent') || 'ClinikoFollowUp (ryan@ryflow.com.au)');
  const [isTestingApi, setIsTestingApi] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSaveSettings = () => {
    try {
      // Format API key if needed - API key should not include Basic prefix
      const formattedKey = apiKey.startsWith('Basic ') ? apiKey : apiKey;
      
      clinikoApi.updateCredentials(baseUrl, formattedKey, userAgent);
      setApiError(null);
      
      toast({
        title: "Settings saved",
        description: "Your Cliniko API settings have been saved.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your settings.",
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = async () => {
    setIsTestingApi(true);
    setApiError(null);
    
    try {
      console.log("Testing Cliniko API connection with:", {
        baseUrl,
        apiKeyLength: apiKey.length,
        userAgent
      });
      
      // Temporarily update credentials for testing
      clinikoApi.updateCredentials(baseUrl, apiKey, userAgent);
      
      // Try to fetch a single practitioner as a test
      const practitioners = await clinikoApi.getPractitioners();
      
      toast({
        title: "Connection successful",
        description: `Successfully connected to Cliniko API. Found ${practitioners.length} practitioners.`,
        variant: "default",
      });
    } catch (error) {
      console.error('API test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiError(errorMessage);
      
      toast({
        title: "Connection failed",
        description: "Could not connect to Cliniko API. Please check your settings.",
        variant: "destructive",
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your Cliniko API connection</p>
      </div>
      
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Make sure your API key matches the region in the Base URL (e.g., an API key ending with "-au2" should use the au2 region).
        </AlertDescription>
      </Alert>
      
      {apiError && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {apiError}
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Cliniko API Configuration</CardTitle>
          <CardDescription>
            Enter your Cliniko API credentials. You can find these in your Cliniko account under Settings &gt; API.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseUrl">API Base URL</Label>
            <Input
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.au2.cliniko.com/v1"
            />
            <p className="text-xs text-gray-500">
              The base URL depends on your region. Make sure to use 'au2' for AU2 region accounts.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
              placeholder="Your Cliniko API Key"
            />
            <p className="text-xs text-gray-500">
              Never share your API key with anyone. It provides full access to your Cliniko account.
              Make sure to paste the complete API key (e.g. MS-XXXXX-au2).
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="userAgent">User-Agent</Label>
            <Input
              id="userAgent"
              value={userAgent}
              onChange={(e) => setUserAgent(e.target.value)}
              placeholder="ClinikoFollowUp (ryan@ryflow.com.au)"
            />
            <p className="text-xs text-gray-500">
              Cliniko requires a User-Agent header with your app name and email.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3 items-center">
          <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
            Save Settings
          </Button>
          <Button 
            variant="outline" 
            onClick={handleTestConnection}
            disabled={isTestingApi}
            className="w-full sm:w-auto"
          >
            {isTestingApi ? 'Testing...' : 'Test Connection'}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>SMS Configuration</CardTitle>
          <CardDescription>
            Configure SMS sending capabilities (to be implemented).
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-gray-500">
            SMS functionality will be implemented in a future update using Twilio or a similar service.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
