import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { FollowUpProvider } from '@/contexts/FollowUpContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Pie, PieChart, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { 
  Users, PieChart as PieChartIcon, BarChart as BarChartIcon, 
  LineChart as LineChartIcon, Calendar 
} from 'lucide-react';

const statusChartConfig = {
  pending: { color: '#3b82f6', label: 'Pending' },
  contacted: { color: '#f59e0b', label: 'Contacted' },
  dismissed: { color: '#6b7280', label: 'Dismissed' },
  futureAppt: { color: '#10b981', label: 'Future Appointment' },
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

const Analytics = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const statusChartData = [
    { name: 'Pending', value: 120, color: '#3b82f6' },
    { name: 'Contacted', value: 85, color: '#f59e0b' },
    { name: 'Dismissed', value: 40, color: '#6b7280' },
    { name: 'Future Appointment', value: 65, color: '#10b981' },
  ];

  const daysSinceChartData = [
    { name: '0-30 days', value: 45, color: '#10b981' },
    { name: '30-60 days', value: 67, color: '#3b82f6' },
    { name: '60-90 days', value: 87, color: '#f59e0b' },
    { name: '90-180 days', value: 65, color: '#ef4444' },
    { name: '180+ days', value: 43, color: '#6b7280' },
  ];
  
  const mockConversionRates = [
    { name: 'Rebooked', rate: 38, color: '#10b981' },
    { name: 'Left Review', rate: 15, color: '#3b82f6' },
    { name: 'No Response', rate: 47, color: '#6b7280' },
  ];
  
  const mockTimeSeriesData = [
    { month: 'Jan', contacted: 65, rebooked: 28, reviews: 12 },
    { month: 'Feb', contacted: 59, rebooked: 24, reviews: 10 },
    { month: 'Mar', contacted: 80, rebooked: 36, reviews: 15 },
    { month: 'Apr', contacted: 81, rebooked: 35, reviews: 14 },
    { month: 'May', contacted: 56, rebooked: 25, reviews: 11 },
    { month: 'Jun', contacted: 55, rebooked: 27, reviews: 9 },
    { month: 'Jul', contacted: 40, rebooked: 20, reviews: 8 },
  ];

  const summaryStats = [
    { 
      title: 'Total Patients', 
      value: '310', 
      description: 'Patients in follow-up system',
      icon: <Users className="h-6 w-6 text-blue-500" />
    },
    { 
      title: 'Conversion Rate', 
      value: '38%', 
      description: 'Patients who rebooked',
      icon: <Calendar className="h-6 w-6 text-green-500" />
    },
    { 
      title: 'Review Rate', 
      value: '15%', 
      description: 'Patients who left reviews',
      icon: <PieChartIcon className="h-6 w-6 text-yellow-500" />
    },
    { 
      title: 'Response Rate', 
      value: '53%', 
      description: 'Patients who responded',
      icon: <BarChartIcon className="h-6 w-6 text-purple-500" />
    }
  ];

  return (
    <FollowUpProvider>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Track patient follow-up performance and trends
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {summaryStats.map((stat, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-gray-100 p-3">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <h2 className="text-3xl font-bold">{stat.value}</h2>
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="patients">Patient Status</TabsTrigger>
              <TabsTrigger value="conversion">Conversion</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Status Overview</CardTitle>
                    <CardDescription>Current patient follow-up status</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ChartContainer config={statusChartConfig} className="h-full">
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
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
                        <Legend />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Metrics</CardTitle>
                    <CardDescription>Patient response to follow-ups</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ChartContainer config={conversionChartConfig} className="h-full">
                      <PieChart>
                        <Pie
                          data={mockConversionRates}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
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
                        <Legend />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                  <CardDescription>Follow-up performance over time</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ChartContainer config={timeSeriesChartConfig} className="h-full">
                    <LineChart data={mockTimeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="contacted" stroke="#3b82f6" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="rebooked" stroke="#10b981" />
                      <Line type="monotone" dataKey="reviews" stroke="#f59e0b" />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patients" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Follow-up Status</CardTitle>
                    <CardDescription>Current patient follow-up stats</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ChartContainer config={statusChartConfig} className="h-full">
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
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
                        <Legend />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Time Since Last Appointment</CardTitle>
                    <CardDescription>How long since patients' last visit</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ChartContainer config={daysSinceChartConfig} className="h-full">
                      <BarChart data={daysSinceChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#3b82f6">
                          {daysSinceChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="conversion" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Rates</CardTitle>
                    <CardDescription>Outcomes from follow-up messages</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ChartContainer config={conversionChartConfig} className="h-full">
                      <PieChart>
                        <Pie
                          data={mockConversionRates}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
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
                        <Legend />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Conversion Trend</CardTitle>
                    <CardDescription>Changes in conversion rates over time</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ChartContainer config={timeSeriesChartConfig} className="h-full">
                      <LineChart data={mockTimeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="rebooked" stroke="#10b981" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="reviews" stroke="#f59e0b" />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>Follow-up trends over time</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <ChartContainer config={timeSeriesChartConfig} className="h-full">
                    <LineChart data={mockTimeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="contacted" stroke="#3b82f6" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="rebooked" stroke="#10b981" />
                      <Line type="monotone" dataKey="reviews" stroke="#f59e0b" />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </FollowUpProvider>
  );
};

export default Analytics;
