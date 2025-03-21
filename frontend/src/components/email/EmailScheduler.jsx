import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Switch } from '../ui/switch';
import { CalendarDays, Clock, Send, Calculator, Zap, Sun, Moon, Globe } from 'lucide-react';
import { format } from 'date-fns';

// Sample optimal times data
const optimalTimes = {
  Monday: ['10:00 AM', '2:00 PM', '4:30 PM'],
  Tuesday: ['9:30 AM', '1:00 PM', '3:30 PM'],
  Wednesday: ['10:30 AM', '2:30 PM', '4:00 PM'],
  Thursday: ['9:00 AM', '1:30 PM', '4:00 PM'],
  Friday: ['10:00 AM', '1:00 PM', '3:00 PM'],
  Saturday: ['11:00 AM', '2:00 PM'],
  Sunday: ['12:00 PM', '7:00 PM']
};

// Time zone options
const timeZoneOptions = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
];

export default function EmailScheduler({ onSchedule, onClose }) {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('');
  const [timeZone, setTimeZone] = useState('America/New_York');
  const [useOptimalTime, setUseOptimalTime] = useState(false);
  const [useRecipientTimeZone, setUseRecipientTimeZone] = useState(false);
  
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
  const optimalTimesForSelectedDay = optimalTimes[dayOfWeek] || [];
  
  const handleSelectOptimalTime = (selectedTime) => {
    setTime(selectedTime);
    setUseOptimalTime(true);
  };
  
  const handleSchedule = () => {
    if (!time) {
      alert('Please select a time');
      return;
    }
    
    const scheduledDateTime = new Date(date);
    const [hours, minutes] = time.includes('PM') 
      ? [parseInt(time.split(':')[0]) + 12, parseInt(time.split(':')[1])] 
      : [parseInt(time.split(':')[0]), parseInt(time.split(':')[1])];
    
    scheduledDateTime.setHours(hours, minutes, 0, 0);
    
    onSchedule({
      dateTime: scheduledDateTime,
      timeZone: useRecipientTimeZone ? 'recipient' : timeZone,
      useOptimalTime
    });
  };
  
  return (
    <Card className="w-full max-w-lg shadow-lg border dark:border-gray-700">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center text-xl font-bold">
          <CalendarDays className="mr-2 h-5 w-5" />
          Schedule Email Delivery
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {format(date, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Time</label>
            <div className="relative">
              <Input
                type="time"
                value={time.includes('AM') || time.includes('PM') ? '' : time}
                onChange={(e) => {
                  setTime(e.target.value);
                  setUseOptimalTime(false);
                }}
                placeholder="HH:MM"
                className="w-full"
              />
              <Clock className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Time Zone</label>
          <Select
            value={timeZone}
            onValueChange={setTimeZone}
            disabled={useRecipientTimeZone}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select time zone" />
            </SelectTrigger>
            <SelectContent>
              {timeZoneOptions.map((zone) => (
                <SelectItem key={zone.value} value={zone.value}>
                  {zone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="recipient-timezone"
            checked={useRecipientTimeZone}
            onCheckedChange={setUseRecipientTimeZone}
          />
          <label
            htmlFor="recipient-timezone"
            className="text-sm font-medium cursor-pointer flex items-center"
          >
            <Globe className="mr-1 h-4 w-4 text-blue-500" /> 
            Use recipient's time zone when available
          </label>
        </div>
        
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Optimal Delivery Times for {dayOfWeek}</h3>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {optimalTimesForSelectedDay.length > 0 ? (
              optimalTimesForSelectedDay.map((optimalTime, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className={`${time === optimalTime ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' : ''} flex items-center`}
                  onClick={() => handleSelectOptimalTime(optimalTime)}
                >
                  {optimalTime.includes('AM') ? (
                    <Sun className="mr-1 h-3 w-3 text-amber-500" />
                  ) : (
                    <Moon className="mr-1 h-3 w-3 text-indigo-500" />
                  )}
                  {optimalTime}
                </Button>
              ))
            ) : (
              <p className="text-sm text-gray-500">No optimal times available for this day.</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Switch
              id="use-optimal"
              checked={useOptimalTime}
              onCheckedChange={setUseOptimalTime}
            />
            <label
              htmlFor="use-optimal"
              className="text-sm font-medium cursor-pointer flex items-center"
            >
              <Calculator className="mr-1 h-4 w-4 text-green-500" /> 
              Use AI to determine the optimal send time
            </label>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between bg-gray-50 dark:bg-gray-800 rounded-b-lg p-4">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="default"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleSchedule}
        >
          <Send className="mr-2 h-4 w-4" />
          Schedule Email
        </Button>
      </CardFooter>
    </Card>
  );
} 