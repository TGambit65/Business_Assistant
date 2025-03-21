import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

// Sample data - In a real application, this would come from an API
const weeklyData = [
  { name: 'Mon', sent: 12, opened: 8, replied: 4 },
  { name: 'Tue', sent: 19, opened: 15, replied: 7 },
  { name: 'Wed', sent: 15, opened: 10, replied: 5 },
  { name: 'Thu', sent: 22, opened: 18, replied: 9 },
  { name: 'Fri', sent: 18, opened: 14, replied: 6 },
  { name: 'Sat', sent: 8, opened: 6, replied: 2 },
  { name: 'Sun', sent: 5, opened: 3, replied: 1 },
];

const monthlyData = [
  { name: 'Jan', sent: 120, opened: 90, replied: 45 },
  { name: 'Feb', sent: 140, opened: 105, replied: 52 },
  { name: 'Mar', sent: 158, opened: 110, replied: 58 },
  { name: 'Apr', sent: 175, opened: 120, replied: 65 },
  { name: 'May', sent: 188, opened: 140, replied: 72 },
  { name: 'Jun', sent: 195, opened: 150, replied: 78 },
];

const responseTimeData = [
  { name: '< 1 hour', value: 35 },
  { name: '1-6 hours', value: 40 },
  { name: '6-24 hours', value: 15 },
  { name: '> 24 hours', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const engagementData = [
  { name: 'Monday', rate: 65 },
  { name: 'Tuesday', rate: 72 },
  { name: 'Wednesday', rate: 68 },
  { name: 'Thursday', rate: 78 },
  { name: 'Friday', rate: 74 },
  { name: 'Saturday', rate: 58 },
  { name: 'Sunday', rate: 52 },
];

export default function EmailAnalytics() {
  const [timeRange, setTimeRange] = useState('week');

  const data = timeRange === 'week' ? weeklyData : monthlyData;

  const calculateTotals = (data) => {
    return data.reduce(
      (acc, item) => {
        acc.sent += item.sent;
        acc.opened += item.opened;
        acc.replied += item.replied;
        return acc;
      },
      { sent: 0, opened: 0, replied: 0 }
    );
  };

  const totals = calculateTotals(data);
  const openRate = ((totals.opened / totals.sent) * 100).toFixed(1);
  const replyRate = ((totals.replied / totals.opened) * 100).toFixed(1);

  return (
    <Card className="w-full shadow-md border dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Email Analytics</CardTitle>
            <CardDescription>Track your email performance metrics</CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">Last 6 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Sent</p>
            <h4 className="text-2xl font-bold">{totals.sent}</h4>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">Open Rate</p>
            <h4 className="text-2xl font-bold">{openRate}%</h4>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Reply Rate</p>
            <h4 className="text-2xl font-bold">{replyRate}%</h4>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="response">Response Time</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="pt-4">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#8884d8" name="Sent" />
                  <Bar dataKey="opened" fill="#82ca9d" name="Opened" />
                  <Bar dataKey="replied" fill="#ffc658" name="Replied" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="engagement" className="pt-4">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="rate" stroke="#FF6B6B" name="Engagement Rate (%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="response" className="pt-4">
            <div className="w-full h-64 flex justify-center">
              <ResponsiveContainer width="80%" height="100%">
                <PieChart>
                  <Pie
                    data={responseTimeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {responseTimeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="pt-4">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sent" stroke="#8884d8" name="Sent" />
                  <Line type="monotone" dataKey="opened" stroke="#82ca9d" name="Opened" />
                  <Line type="monotone" dataKey="replied" stroke="#ffc658" name="Replied" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 