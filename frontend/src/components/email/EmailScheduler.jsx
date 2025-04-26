import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'; // Removed CardFooter
// import { Button } from '../ui/button'; // Button is used
// import { Input } from '../ui/input'; // Input is used
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'; // Select components are not used
// import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'; // Popover components are not used
import { Calendar, Clock, ChevronDown, Check, X } from 'lucide-react';
// import { format } from 'date-fns'; // format is not used

// Sample optimal times data
// const optimalTimes = {
  // Monday: ['10:00 AM', '2:00 PM', '4:30 PM'],
  // Tuesday: ['9:30 AM', '1:00 PM', '3:30 PM'],
  // Wednesday: ['10:30 AM', '2:30 PM', '4:00 PM'],
  // Thursday: ['9:00 AM', '1:30 PM', '4:00 PM'],
  // Friday: ['10:00 AM', '1:00 PM', '3:00 PM'],
  // Saturday: ['11:00 AM', '2:00 PM'],
  // Sunday: ['12:00 PM', '7:00 PM']
// };

// Time zone options
// const timeZoneOptions = [ // Removed unused variable
//   { value: 'America/New_York', label: 'Eastern Time (ET)' },
//   { value: 'America/Chicago', label: 'Central Time (CT)' },
//   { value: 'America/Denver', label: 'Mountain Time (MT)' },
//   { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
//   { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
//   { value: 'Europe/Paris', label: 'Central European Time (CET)' },
//   { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
//   { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
// ];

/**
 * EmailScheduler component for scheduling emails to be sent at a later time
 */
const EmailScheduler = ({ onSchedule, onCancel }) => {
  // Get current date and time
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0); // Set to 9:00 AM tomorrow
  
  // State
  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [time, /*setTime*/] = useState(''); // setTime is unused
  const [timeZone, /*setTimeZone*/] = useState('America/New_York'); // setTimeZone is unused
  const [useOptimalTime, /*setUseOptimalTime*/] = useState(false); // setUseOptimalTime is unused
  const [useRecipientTimeZone, /*setUseRecipientTimeZone*/] = useState(false); // setUseRecipientTimeZone is unused
  
  // const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDate.getDay()];
  // const optimalTimesForSelectedDay = optimalTimes[dayOfWeek] || []; // Removed unused variable
  
  // Generate date options
  const dateOptions = [
    { label: 'Later today', value: 'today', date: getEndOfDay(now) },
    { label: 'Tomorrow morning', value: 'tomorrow', date: getTomorrowMorning() },
    { label: 'Tomorrow afternoon', value: 'tomorrow-afternoon', date: getTomorrowAfternoon() },
    { label: 'This weekend', value: 'weekend', date: getNextWeekend() },
    { label: 'Next week', value: 'next-week', date: getNextMonday() },
    { label: 'Custom date', value: 'custom', date: null },
  ];
  
  // Generate time options
  const timeOptions = [
    { label: '8:00 AM', value: '8:00' },
    { label: '9:00 AM', value: '9:00' },
    { label: '10:00 AM', value: '10:00' },
    { label: '12:00 PM', value: '12:00' },
    { label: '2:00 PM', value: '14:00' },
    { label: '4:00 PM', value: '16:00' },
    { label: '6:00 PM', value: '18:00' },
  ];
  
  // Helper functions to get dates
  function getEndOfDay(date) {
    const endOfDay = new Date(date);
    endOfDay.setHours(17, 0, 0, 0); // 5:00 PM
    return endOfDay;
  }
  
  function getTomorrowMorning() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 9:00 AM
    return tomorrow;
  }
  
  function getTomorrowAfternoon() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // 2:00 PM
    return tomorrow;
  }
  
  function getNextWeekend() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    const daysToWeekend = dayOfWeek === 0 ? 6 : 6 - dayOfWeek; // If today is Sunday, next weekend is 6 days away
    
    const weekend = new Date(today);
    weekend.setDate(today.getDate() + daysToWeekend);
    weekend.setHours(10, 0, 0, 0); // 10:00 AM
    return weekend;
  }
  
  function getNextMonday() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday
    const daysToMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek; // If today is Sunday, next Monday is tomorrow
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysToMonday);
    monday.setHours(9, 0, 0, 0); // 9:00 AM
    return monday;
  }
  
  // Handle selecting a predefined date
  const handleSelectDateOption = (option) => {
    if (option.value === 'custom') {
      setShowDatePicker(true);
    } else {
      setSelectedDate(option.date);
      setShowDatePicker(false);
    }
  };
  
  // Handle selecting a time
  const handleSelectTime = (timeOption) => {
    const [hours, minutes] = timeOption.value.split(':').map(num => parseInt(num, 10));
    
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes, 0, 0);
    
    setSelectedDate(newDate);
    setShowTimePicker(false);
  };
  
  // Handle custom date selection
  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    const newDate = new Date(selectedDate);
    
    newDate.setFullYear(date.getFullYear());
    newDate.setMonth(date.getMonth());
    newDate.setDate(date.getDate());
    
    setSelectedDate(newDate);
  };
  
  // Format date for display
  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Format time for display
  const formatTime = (date) => {
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return date.toLocaleTimeString('en-US', options);
  };
  
  // Format date for input
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Handle schedule button click
  const handleSchedule = () => {
    if (!time) {
      alert('Please select a time');
      return;
    }
    
    const scheduledDateTime = new Date(selectedDate);
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
          <Calendar className="mr-2 h-5 w-5" />
          Schedule Email Delivery
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Schedule Email</h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Date selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Send on
            </label>
            <div className="space-y-2">
              {dateOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full flex justify-between items-center py-2 px-3 text-left border rounded-md ${
                    (option.date && option.date.toDateString() === selectedDate.toDateString()) || 
                    (option.value === 'custom' && showDatePicker)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-700 hover:bg-muted dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleSelectDateOption(option)}
                >
                  <span>{option.label}</span>
                  {(option.date && option.date.toDateString() === selectedDate.toDateString()) || 
                   (option.value === 'custom' && showDatePicker) ? (
                    <Check size={16} className="text-blue-500" />
                  ) : null}
                </button>
              ))}
            </div>
            
            {/* Custom date picker */}
            {showDatePicker && (
              <div className="mt-2">
                <input
                  type="date"
                  value={formatDateForInput(selectedDate)}
                  onChange={handleDateChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background dark:bg-gray-800"
                  min={formatDateForInput(now)}
                />
              </div>
            )}
          </div>
          
          {/* Time selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Send at
            </label>
            <div className="relative">
              <button
                type="button"
                className="w-full flex justify-between items-center p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background dark:bg-gray-800"
                onClick={() => setShowTimePicker(!showTimePicker)}
              >
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-gray-500" />
                  <span>{formatTime(selectedDate)}</span>
                </div>
                <ChevronDown size={16} className={`transition-transform duration-200 ${showTimePicker ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Time dropdown */}
              {showTimePicker && (
                <div className="absolute z-10 mt-1 w-full bg-background dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                  {timeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSelectTime(option)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Summary */}
          <div className="py-3 px-4 bg-muted dark:bg-gray-800 rounded-md border border-border dark:border-gray-700">
            <div className="flex items-center mb-1">
              <Calendar size={16} className="mr-2 text-gray-500" />
              <span className="text-sm font-medium">{formatDate(selectedDate)}</span>
            </div>
            <div className="flex items-center">
              <Clock size={16} className="mr-2 text-gray-500" />
              <span className="text-sm font-medium">{formatTime(selectedDate)}</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-muted dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSchedule}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Schedule
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

EmailScheduler.propTypes = {
  onSchedule: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default EmailScheduler; 