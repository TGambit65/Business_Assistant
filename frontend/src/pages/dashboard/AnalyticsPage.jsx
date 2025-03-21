import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import EmailAnalytics from '../../components/dashboard/EmailAnalytics';
import { CalendarDays, Users, Clock, BarChart3, Sparkles, MousePointerSquare, Mail, Zap } from 'lucide-react';

const statCards = [
  {
    title: 'Total Emails Sent',
    value: '2,543',
    change: '+12.5%',
    positive: true,
    icon: <Mail className="h-5 w-5 text-blue-500" />,
    description: 'vs. previous month'
  },
  {
    title: 'Average Response Time',
    value: '3.2h',
    change: '-10.3%',
    positive: true,
    icon: <Clock className="h-5 w-5 text-orange-500" />,
    description: 'vs. previous month'
  },
  {
    title: 'AI Drafts Generated',
    value: '845',
    change: '+28.4%',
    positive: true,
    icon: <Sparkles className="h-5 w-5 text-purple-500" />,
    description: 'vs. previous month'
  },
  {
    title: 'Unique Recipients',
    value: '687',
    change: '+5.2%',
    positive: true,
    icon: <Users className="h-5 w-5 text-green-500" />,
    description: 'vs. previous month'
  }
];

// Sample best performing subject lines
const bestSubjectLines = [
  { subject: 'Quick question about our recent partnership', openRate: '78%', clickRate: '42%' },
  { subject: '[URGENT] Important update to our service terms', openRate: '75%', clickRate: '38%' },
  { subject: 'Exclusive invitation: Join our beta program', openRate: '72%', clickRate: '45%' },
  { subject: 'Your feedback requested: 5-minute survey', openRate: '68%', clickRate: '32%' },
  { subject: 'Your account summary for May 2023', openRate: '65%', clickRate: '28%' }
];

// Sample time to open data
const timeToOpenData = [
  { day: 'Monday', '9am-12pm': 45, '12pm-3pm': 55, '3pm-6pm': 68, 'After 6pm': 40 },
  { day: 'Tuesday', '9am-12pm': 55, '12pm-3pm': 58, '3pm-6pm': 60, 'After 6pm': 42 },
  { day: 'Wednesday', '9am-12pm': 60, '12pm-3pm': 62, '3pm-6pm': 58, 'After 6pm': 45 },
  { day: 'Thursday', '9am-12pm': 58, '12pm-3pm': 60, '3pm-6pm': 65, 'After 6pm': 48 },
  { day: 'Friday', '9am-12pm': 52, '12pm-3pm': 48, '3pm-6pm': 42, 'After 6pm': 35 }
];

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Email Analytics Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Insights and performance metrics for your email communications
        </p>
      </header>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className="border shadow-md dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                {stat.icon}
              </div>
              <div className="flex items-baseline">
                <h3 className="text-2xl font-bold">{stat.value}</h3>
                <span className={`ml-2 text-xs font-medium ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Email Analytics Component */}
        <div className="lg:col-span-2">
          <EmailAnalytics />
        </div>

        {/* Best Performing Subject Lines */}
        <Card className="border shadow-md dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Best Performing Subject Lines
            </CardTitle>
            <CardDescription>Subject lines with the highest open and click rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-2">Subject Line</th>
                    <th className="text-center py-3 px-2">Open Rate</th>
                    <th className="text-center py-3 px-2">Click Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {bestSubjectLines.map((item, index) => (
                    <tr 
                      key={index} 
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-2">{item.subject}</td>
                      <td className="text-center py-3 px-2">
                        <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                          {item.openRate}
                        </span>
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                          {item.clickRate}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Optimal Send Times */}
        <Card className="border shadow-md dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-indigo-500" />
              Optimal Email Send Times
            </CardTitle>
            <CardDescription>When your recipients are most likely to open emails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-2 font-medium text-xs">
                <div className="col-span-2">Day</div>
                <div className="text-center">9am-12pm</div>
                <div className="text-center">12pm-3pm</div>
                <div className="text-center">3pm-6pm</div>
                <div className="text-center">After 6pm</div>
              </div>
              
              {timeToOpenData.map((row, index) => (
                <div key={index} className="grid grid-cols-6 gap-2 text-sm">
                  <div className="col-span-2 font-medium">{row.day}</div>
                  {['9am-12pm', '12pm-3pm', '3pm-6pm', 'After 6pm'].map((time) => (
                    <div key={time} className="text-center">
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                          <div 
                            style={{ width: `${row[time]}%` }} 
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                              row[time] > 60 ? 'bg-green-500' : row[time] > 50 ? 'bg-blue-500' : 'bg-gray-400'
                            }`}
                          ></div>
                        </div>
                        <span className="text-xs mt-1 block">{row[time]}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
                <MousePointerSquare className="h-3 w-3 inline mr-1" />
                Higher percentages indicate better times to send emails for optimal open rates.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 