import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AvailabilityCalendar from '../../components/Calendar/AvailabilityCalendar';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, Plus, Edit, Trash2, Save, X } from 'lucide-react';

const AvailabilityEditor = () => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/availability/me');
      setAvailability(response.data.availability || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load availability');
    }
    setLoading(false);
  };

  const handleSelectSlot = (slotInfo) => {
    setEditingEvent({
      type: 'available',
      title: 'Available for games',
      startTime: slotInfo.start.toISOString(),
      endTime: slotInfo.end.toISOString(),
      isRecurring: false
    });
    setShowAddModal(true);
  };

  const handleSelectEvent = (event) => {
    if (event.source === 'manual') {
      setEditingEvent({
        ...event,
        startTime: new Date(event.startTime).toISOString().slice(0, 16),
        endTime: new Date(event.endTime).toISOString().slice(0, 16)
      });
      setShowAddModal(true);
    } else {
      toast.info('Calendar sync events cannot be edited. Use override instead.');
    }
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (editingEvent._id) {
        // Update existing event
        await axios.put(`/api/availability/${editingEvent._id}`, eventData);
        toast.success('Event updated successfully');
      } else {
        // Create new event
        await axios.post('/api/availability', eventData);
        toast.success('Event created successfully');
      }
      
      fetchAvailability();
      setShowAddModal(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(error.response?.data?.message || 'Failed to save event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`/api/availability/${eventId}`);
        toast.success('Event deleted successfully');
        fetchAvailability();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error(error.response?.data?.message || 'Failed to delete event');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gaming-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Manage Your Availability
          </h1>
          <p className="text-gray-600">
            Set when you're available for games. Click and drag on the calendar to add new availability slots.
          </p>
        </div>

        {/* Instructions */}
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How it works</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded mt-1"></div>
              <div>
                <div className="font-medium text-gray-900">Available</div>
                <div>Times when you're free to play games</div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded mt-1"></div>
              <div>
                <div className="font-medium text-gray-900">Busy</div>
                <div>Automatically synced from your calendar</div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded mt-1"></div>
              <div>
                <div className="font-medium text-gray-900">Override</div>
                <div>Manual overrides for synced events</div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Calendar</h2>
            <button
              onClick={() => {
                setEditingEvent({
                  type: 'available',
                  title: 'Available for games',
                  startTime: new Date().toISOString().slice(0, 16),
                  endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
                  isRecurring: false
                });
                setShowAddModal(true);
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Availability</span>
            </button>
          </div>

          <AvailabilityCalendar
            events={availability}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            editable={true}
          />
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <EventModal
            event={editingEvent}
            onSave={handleSaveEvent}
            onDelete={editingEvent?._id ? () => handleDeleteEvent(editingEvent._id) : null}
            onClose={() => {
              setShowAddModal(false);
              setEditingEvent(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Event Modal Component
const EventModal = ({ event, onSave, onDelete, onClose }) => {
  const [formData, setFormData] = useState({
    type: event?.type || 'available',
    title: event?.title || '',
    startTime: event?.startTime || '',
    endTime: event?.endTime || '',
    isRecurring: event?.isRecurring || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate times
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    
    if (start >= end) {
      toast.error('End time must be after start time');
      return;
    }
    
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {event?._id ? 'Edit Event' : 'Add Availability'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="input-field"
            >
              <option value="available">Available for games</option>
              <option value="busy">Busy</option>
              <option value="override">Override</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="input-field"
              placeholder="Event title"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time
            </label>
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => handleChange('endTime', e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Recurring */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => handleChange('isRecurring', e.target.checked)}
                className="rounded border-gray-300 text-gaming-600 focus:ring-gaming-500"
              />
              <span className="text-sm text-gray-700">Repeat weekly</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <div>
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete Event
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AvailabilityEditor;
