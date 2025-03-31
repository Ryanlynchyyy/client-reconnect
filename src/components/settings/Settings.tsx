
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { clinikoApi } from '@/services/clinikoApi';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, AlertCircle, HelpCircle, ExternalLink } from 'lucide-react';

const Settings: React.FC = () => {
  const { toast } = useToast();
  const [baseUrl, setBaseUrl] = useState(localStorage.getItem('cliniko_base_url') || 'https://api.au2.cliniko.com/v1');
  const [apiKey, setApiKey] = useState(localStorage.getItem('cliniko_api_key') || '');
  const [userAgent, setUserAgent] = useState(localStorage.getItem('cliniko_user_agent') || 'ClinikoFollowUp (ryan@ryflow.com.au)');
  const [isTestingApi, setIsTestingApi] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [corsError, setCorsError] = useState<boolean>(false);

  const handleSaveSettings = () => {
    try {
      // Clear any API errors when saving
      setApiError(null);
      setCorsError(false);
      
      // Make sure the API key doesn't contain "Basic " prefix (user might copy from elsewhere)
      let formattedKey = apiKey;
      if (formattedKey.startsWith('Basic ')) {
        formattedKey = formattedKey.substring(6);
      }
      
      clinikoApi.updateCredentials(baseUrl, formattedKey, userAgent);
      
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
    setCorsError(false);
    
    try {
      console.log("Testing Cliniko API connection with:", {
        baseUrl,
        apiKeyLength: apiKey.length,
        userAgent
      });
      
      // Temporarily update credentials for testing
      let formattedKey = apiKey;
      if (formattedKey.startsWith('Basic ')) {
        formattedKey = formattedKey.substring(6);
      }
      
      clinikoApi.updateCredentials(baseUrl, formattedKey, userAgent);
      
      // Use the new testConnection method
      const result = await clinikoApi.testConnection();
      
      if (result.success) {
        toast({
          title: "Connection successful",
          description: result.message,
          variant: "default",
        });
      } else {
        setApiError(result.message);
        
        // Check if it's a CORS error
        if (result.message.includes("CORS Error")) {
          setCorsError(true);
        }
        
        toast({
          title: "Connection failed",
          description: "Could not connect to Cliniko API. Please check the error details below.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('API test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiError(errorMessage);
      
      // Check if it's a CORS error
      if (errorMessage.includes("CORS Error")) {
        setCorsError(true);
      }
      
      toast({
        title: "Connection failed",
        description: "Could not connect to Cliniko API. Please check your settings and the error details below.",
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
          <br />
          Your API key should look like: <code className="bg-gray-100 px-1 py-0.5 rounded">MS-XXXXX-au2</code> (NOT prefixed with "Basic").
        </AlertDescription>
      </Alert>
      
      {corsError && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            <div className="font-bold mb-2">CORS Error: Cannot access Cliniko API directly from a browser</div>
            <p className="mb-3">
              The Cliniko API blocks direct requests from web browsers due to Cross-Origin Resource Sharing (CORS) restrictions.
            </p>
            <div className="mt-2 text-sm">
              <p className="font-semibold mb-1">To fix this issue:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Create a backend proxy or serverless function to make API requests to Cliniko</li>
                <li>Update this application to call your proxy instead of the Cliniko API directly</li>
                <li>Your API key and credentials will still work - they just need to be used from a server environment</li>
              </ul>
              <p className="mt-3">
                <a 
                  href="https://developer.cliniko.com/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-700 hover:text-blue-900 font-medium"
                >
                  Cliniko API Documentation <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {apiError && !corsError && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {apiError}
            <div className="mt-2 text-sm">
              <p>Common issues:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Make sure your API key is correct and active</li>
                <li>Check that the region in your API key matches your base URL (au2)</li>
                <li>Ensure your account has API access enabled</li>
              </ul>
            </div>
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
              Enter the raw API key (e.g., MS-XXXXX-au2) without any "Basic" prefix.
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
