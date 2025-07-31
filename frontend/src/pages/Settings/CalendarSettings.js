import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, Link as LinkIcon, Unlink, Sync, Settings } from 'lucide-react';

const CalendarSettings = () => {
  const { user, updateUser } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendars, setSelectedCalendars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setIsConnected(user?.calendarIntegration?.googleCalendar?.connected || false);
    if (user?.calendarIntegration?.googleCalendar?.connected) {
      fetchCalendars();
    }
  }, [user]);

  const fetchCalendars = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/calendar/google/calendars');
      setCalendars(response.data.calendars);
      setSelectedCalendars(user?.calendarIntegration?.googleCalendar?.calendarIds || []);
    } catch (error) {
      console.error('Error fetching calendars:', error);
      if (error.response?.status === 401) {
        setIsConnected(false);
        toast.error('Google Calendar connection expired. Please reconnect.');
      }
    }
    setLoading(false);
  };

  const connectGoogleCalendar = () => {
    // In a real implementation, this would initiate OAuth flow
    // For demo purposes, we'll simulate a successful connection
    toast.info('Google Calendar OAuth flow would start here');
    
    // Simulate successful connection for demo
    setTimeout(() => {
      setIsConnected(true);
      updateUser({
        calendarIntegration: {
          googleCalendar: {
            connected: true
          }
        }
      });
      toast.success('Google Calendar connected successfully!');
      fetchCalendars();
    }, 1000);
  };

  const disconnectGoogleCalendar = async () => {
    if (window.confirm('Are you sure you want to disconnect Google Calendar? This will remove all synced events.')) {
      try {
        setLoading(true);
        await axios.delete('/api/calendar/google/disconnect');
        
        setIsConnected(false);
        setCalendars([]);
        setSelectedCalendars([]);
        
        updateUser({
          calendarIntegration: {
            googleCalendar: {
              connected: false
            }
          }
        });
        
        toast.success('Google Calendar disconnected successfully');
      } catch (error) {
        console.error('Error disconnecting calendar:', error);
        toast.error('Failed to disconnect Google Calendar');
      }
      setLoading(false);
    }
  };

  const syncCalendars = async () => {
    if (selectedCalendars.length === 0) {
      toast.error('Please select at least one calendar to sync');
      return;
    }

    try {
      setSyncing(true);
      const response = await axios.post('/api/calendar/google/sync', {
        calendarIds: selectedCalendars
      });
      
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error syncing calendars:', error);
      toast.error(error.response?.data?.message || 'Failed to sync calendars');
    }
    setSyncing(false);
  };

  const handleCalendarSelection = (calendarId, checked) => {
    if (checked) {
      setSelectedCalendars(prev => [...prev, calendarId]);
    } else {
      setSelectedCalendars(prev => prev.filter(id => id !== calendarId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-8">
          <div className="flex items-center space-x-3 mb-8">
            <Settings className="h-8 w-8 text-gaming-600" />
            <h1 className="text-3xl font-bold text-gray-900">Calendar Settings</h1>
          </div>

          {/* Google Calendar Section */}
          <div className="border-b pb-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Google Calendar</h2>
                  <p className="text-gray-600">
                    Sync your Google Calendar to automatically mark busy times
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                  {isConnected ? 'Connected' : 'Not connected'}
                </span>
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
            </div>

            {!isConnected ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Connect Your Google Calendar
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Automatically import your busy times while keeping your gaming availability visible.
                  Your private events stay private.
                </p>
                <button
                  onClick={connectGoogleCalendar}
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <LinkIcon className="h-4 w-4" />
                  )}
                  <span>Connect Google Calendar</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Calendar Selection */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Select Calendars to Sync
                  </h3>
                  
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gaming-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {calendars.map((calendar) => (
                        <label
                          key={calendar.id}
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCalendars.includes(calendar.id)}
                            onChange={(e) => handleCalendarSelection(calendar.id, e.target.checked)}
                            className="rounded border-gray-300 text-gaming-600 focus:ring-gaming-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {calendar.name}
                              {calendar.primary && (
                                <span className="ml-2 text-sm text-gaming-600">(Primary)</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              Access: {calendar.accessRole}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sync Button */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={syncCalendars}
                    disabled={syncing || selectedCalendars.length === 0}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {syncing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Sync className="h-4 w-4" />
                    )}
                    <span>Sync Selected Calendars</span>
                  </button>
                  
                  <button
                    onClick={disconnectGoogleCalendar}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <Unlink className="h-4 w-4" />
                    <span>Disconnect</span>
                  </button>
                </div>

                {/* Sync Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    How Calendar Sync Works
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Only busy times are imported to mark you as unavailable</li>
                    <li>• Event details and titles are not visible to others</li>
                    <li>• Your gaming availability slots remain visible</li>
                    <li>• Sync runs automatically but you can manually sync anytime</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Future integrations placeholder */}
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              More Integrations Coming Soon
            </h3>
            <p className="text-gray-600">
              Outlook Calendar, Apple Calendar, and other popular calendar apps
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarSettings;
