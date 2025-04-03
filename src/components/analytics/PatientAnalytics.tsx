import React, { useMemo } from 'react';
import { useFollowUp } from '@/contexts/FollowUpContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, ArrowUpRight } from 'lucide-react';
import { ChartContainer } from '@/components/ui/chart';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie,
  LineChart, Line
} from 'recharts';

const PatientAnalytics: React.FC = () => {
  const { patients, isLoading, error } = useFollowUp();

  const stats = useMemo(() => {
    if (!patients.length) return null;

    // Count by status
    const statusCount = {
      pending: patients.filter(p => p.followUpStatus === 'pending').length,
      contacted: patients.filter(p => p.followUpStatus === 'contacted').length,
      dismissed: patients.filter(p => p.followUpStatus === 'dismissed').length,
      withFutureAppointment: patients.filter(p => p.hasFutureAppointment).length,
    };

    // Count by days since last appointment
    const daysSinceCount = {
      '0-30': patients.filter(p => p.daysSinceLastAppointment !== null && p.daysSinceLastAppointment < 30).length,
      '30-60': patients.filter(p => p.daysSinceLastAppointment !== null && p.daysSinceLastAppointment >= 30 && p.daysSinceLastAppointment < 60).length,
      '60-90': patients.filter(p => p.daysSinceLastAppointment !== null && p.daysSinceLastAppointment >= 60 && p.daysSinceLastAppointment < 90).length,
      '90-180': patients.filter(p => p.daysSinceLastAppointment !== null && p.daysSinceLastAppointment >= 90 && p.daysSinceLastAppointment < 180).length,
      '180+': patients.filter(p => p.daysSinceLastAppointment !== null && p.daysSinceLastAppointment >= 180).length,
    };

    // For demonstration purposes, generate mock conversion metrics
    const totalContacted = statusCount.contacted;
    const mockRebooked = Math.round(totalContacted * 0.38); // 38% mock rebooking rate
    const mockReviews = Math.round(totalContacted * 0.15); // 15% mock review rate

    return {
      statusCount,
      daysSinceCount,
      totalPatients: patients.length,
      responseRate: {
        rebooked: mockRebooked,
        reviewsLeft: mockReviews,
        contacted: totalContacted
      }
    };
  }, [patients]);

  // Prepare chart data
  const statusChartData = stats ? [
    { name: 'Pending', value: stats.statusCount.pending, color: '#3b82f6' },
    { name: 'Contacted', value: stats.statusCount.contacted, color: '#f59e0b' },
    { name: 'Dismissed', value: stats.statusCount.dismissed, color: '#6b7280' },
    { name: 'Future Appt', value: stats.statusCount.withFutureAppointment, color: '#10b981' },
  ] : [];

  const daysSinceChartData = stats ? [
    { name: '0-30', value: stats.daysSinceCount['0-30'], color: '#10b981' },
    { name: '30-60', value: stats.daysSinceCount['30-60'], color: '#3b82f6' },
    { name: '60-90', value: stats.daysSinceCount['60-90'], color: '#f59e0b' },
    { name: '90-180', value: stats.daysSinceCount['90-180'], color: '#ef4444' },
    { name: '180+', value: stats.daysSinceCount['180+'], color: '#6b7280' },
  ] : [];

  // Mock time series data (for demonstration)
  const mockTimeSeriesData = [
    { month: 'Jan', contacted: 12, rebooked: 5, reviews: 2 },
    { month: 'Feb', contacted: 19, rebooked: 8, reviews: 3 },
    { month: 'Mar', contacted: 17, rebooked: 6, reviews: 2 },
    { month: 'Apr', contacted: 23, rebooked: 9, reviews: 4 },
    { month: 'May', contacted: 29, rebooked: 11, reviews: 5 },
    { month: 'Jun', contacted: 21, rebooked: 8, reviews: 3 },
  ];

  const mockConversionRates = [
    { name: 'Rebooked', rate: 38, color: '#10b981' },
    { name: 'Left Review', rate: 15, color: '#3b82f6' },
    { name: 'No Response', rate: 47, color: '#6b7280' },
  ];
  
  // Create proper chart config objects that follow the required type structure
  const statusChartConfig = {
    pending: { color: '#3b82f6', label: 'Pending' },
    contacted: { color: '#f59e0b', label: 'Contacted' },
    dismissed: { color: '#6b7280', label: 'Dismissed' },
    futureAppt: { color: '#10b981', label: 'Future Appt' },
  };
  
  const daysSinceChartConfig = {
    '0-30': { color: '#10b981', label: '0-30 days' },
    '30-60': { color: '#3b82f6', label: '30-60 days' },
    '60-90': { color: '#f59e0b', label: '60-90 days' },
    '90-180': { color: '#ef4444', label: '90-180 days' },
    '180+': { color: '#6b7280', label: '180+ days' },
  };
  
  const conversionChartConfig = {
    rebooked: { color: '#10b981', label: 'Rebooked' },
    review: { color: '#3b82f6', label: 'Left Review' },
    noResponse: { color: '#6b7280', label: 'No Response' },
  };
  
  const timeSeriesChartConfig = {
    contacted: { color: '#3b82f6', label: 'Contacted' },
    rebooked: { color: '#10b981', label: 'Rebooked' },
    reviews: { color: '#f59e0b', label: 'Reviews' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient Analytics</h1>
        <p className="text-gray-600">
          Track follow-up effectiveness and patient engagement metrics
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error loading data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Patients</CardTitle>
                <CardDescription>Overall patient count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.totalPatients}</div>
                <div className="flex justify-between mt-4">
                  <Badge variant="outline" className="bg-blue-50">Active: {stats.totalPatients - stats.statusCount.dismissed}</Badge>
                  <Badge variant="outline" className="bg-gray-50">Dismissed: {stats.statusCount.dismissed}</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Contacted Rate</CardTitle>
                <CardDescription>Follow-up success metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {stats.statusCount.contacted} 
                  <span className="text-lg font-normal text-gray-500 ml-2">
                    patients
                  </span>
                </div>
                <div className="flex justify-between mt-4">
                  <Badge variant="outline" className="bg-amber-50">
                    {Math.round((stats.statusCount.contacted / stats.totalPatients) * 100)}% of all patients
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Conversion Rate</CardTitle>
                <CardDescription>Patients who rebooked after contact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  38% 
                  <span className="text-lg font-normal text-gray-500 ml-2">
                    rebooking rate
                  </span>
                </div>
                <div className="flex justify-between mt-4">
                  <Badge variant="outline" className="bg-green-50">
                    {stats.responseRate.rebooked} rebooked
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50">
                    {stats.responseRate.reviewsLeft} reviews
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Patient Overview</TabsTrigger>
              <TabsTrigger value="followup">Follow-up Performance</TabsTrigger>
              <TabsTrigger value="trends">Time Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Status Distribution</CardTitle>
                    <CardDescription>Current status of all patients</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-80">
                      <ChartContainer config={statusChartConfig} className="h-full">
                        <PieChart>
                          <Pie
                            data={statusChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {statusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Days Since Last Visit</CardTitle>
                    <CardDescription>Patient absence periods</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-80">
                      <ChartContainer config={daysSinceChartConfig} className="h-full">
                        <BarChart data={daysSinceChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" name="Patients">
                            {daysSinceChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="followup" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Follow-up Conversion Rates</CardTitle>
                    <CardDescription>Patient response to follow-up attempts</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-80">
                      <ChartContainer config={conversionChartConfig} className="h-full">
                        <PieChart>
                          <Pie
                            data={mockConversionRates}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="rate"
                            nameKey="name"
                            label={({ name, rate }) => `${name}: ${rate}%`}
                          >
                            {mockConversionRates.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>Follow-up effectiveness</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Rebooking Rate</span>
                          <span className="text-sm font-medium text-green-600">38%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '38%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Review Rate</span>
                          <span className="text-sm font-medium text-blue-600">15%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Response Rate</span>
                          <span className="text-sm font-medium text-amber-600">53%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: '53%' }}></div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-md">
                        <h3 className="text-lg font-medium mb-2 flex items-center">
                          <InfoIcon size={18} className="mr-2 text-blue-500" />
                          Key Insights
                        </h3>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>38% of contacted patients rebooked appointments</li>
                          <li>15% left reviews after follow-up</li>
                          <li>53% overall engagement rate</li>
                          <li>Best response from patients in the 30-60 day range</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Engagement Trends</CardTitle>
                  <CardDescription>Follow-up performance over time</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[400px]">
                    <ChartContainer config={timeSeriesChartConfig} className="h-full">
                      <LineChart data={mockTimeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="contacted" 
                          stroke="#3b82f6" 
                          name="Contacted"
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="rebooked" 
                          stroke="#10b981" 
                          name="Rebooked"
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="reviews" 
                          stroke="#f59e0b" 
                          name="Reviews"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                </CardContent>
                <div className="px-6 pb-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Trend Analysis</h3>
                    <p className="text-sm text-gray-600">
                      Follow-up effectiveness is improving month-over-month, with May showing the 
                      highest engagement rates. The rebooking conversion rate has increased from 33% in January
                      to 38% in June.
                    </p>
                    <Button className="mt-4 flex items-center gap-1" variant="outline">
                      <span>View detailed report</span>
                      <ArrowUpRight size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
          
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <AlertTitle className="text-amber-800">Note about analytics data</AlertTitle>
            <AlertDescription className="text-amber-700">
              This analytics page includes some mock data for demonstration purposes. In a production environment, 
              this would be replaced with actual tracking of SMS clicks, appointment bookings, and review submissions.
            </AlertDescription>
          </Alert>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <InfoIcon size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No analytics data available</h3>
            <p className="text-gray-500 text-center max-w-md">
              Start by adding patients and sending follow-up messages to generate analytics data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientAnalytics;
