const express = require('express');
const axios = require('axios');
const { auth } = require('../middleware/auth');
const Availability = require('../models/Availability');

const router = express.Router();

// @route   POST /api/calendar/google/connect
// @desc    Connect Google Calendar
// @access  Private
router.post('/google/connect', auth, async (req, res) => {
  try {
    const { accessToken, refreshToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: 'Access token required' });
    }

    // Store tokens (in production, encrypt these)
    req.user.calendarIntegration.googleCalendar = {
      connected: true,
      accessToken,
      refreshToken: refreshToken || '',
      calendarIds: []
    };

    await req.user.save();

    res.json({ 
      message: 'Google Calendar connected successfully',
      connected: true 
    });

  } catch (error) {
    console.error('Google Calendar connect error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/calendar/google/disconnect
// @desc    Disconnect Google Calendar
// @access  Private
router.delete('/google/disconnect', auth, async (req, res) => {
  try {
    // Remove Google Calendar integration
    req.user.calendarIntegration.googleCalendar = {
      connected: false,
      accessToken: '',
      refreshToken: '',
      calendarIds: []
    };

    await req.user.save();

    // Remove all Google Calendar synced availability
    await Availability.deleteMany({
      userId: req.user._id,
      source: 'google_calendar'
    });

    res.json({ 
      message: 'Google Calendar disconnected successfully',
      connected: false 
    });

  } catch (error) {
    console.error('Google Calendar disconnect error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/calendar/google/calendars
// @desc    Get user's Google Calendars
// @access  Private
router.get('/google/calendars', auth, async (req, res) => {
  try {
    const { accessToken } = req.user.calendarIntegration.googleCalendar;

    if (!accessToken) {
      return res.status(400).json({ message: 'Google Calendar not connected' });
    }

    try {
      const response = await axios.get('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const calendars = response.data.items.map(cal => ({
        id: cal.id,
        name: cal.summary,
        primary: cal.primary || false,
        accessRole: cal.accessRole
      }));

      res.json({ calendars });

    } catch (apiError) {
      if (apiError.response?.status === 401) {
        // Token expired, disconnect
        req.user.calendarIntegration.googleCalendar.connected = false;
        await req.user.save();
        return res.status(401).json({ message: 'Google Calendar token expired. Please reconnect.' });
      }
      throw apiError;
    }

  } catch (error) {
    console.error('Get Google Calendars error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/calendar/google/sync
// @desc    Sync Google Calendar events
// @access  Private
router.post('/google/sync', auth, async (req, res) => {
  try {
    const { calendarIds } = req.body;
    const { accessToken } = req.user.calendarIntegration.googleCalendar;

    if (!accessToken) {
      return res.status(400).json({ message: 'Google Calendar not connected' });
    }

    if (!calendarIds || !Array.isArray(calendarIds)) {
      return res.status(400).json({ message: 'Calendar IDs required' });
    }

    // Store selected calendar IDs
    req.user.calendarIntegration.googleCalendar.calendarIds = calendarIds;
    await req.user.save();

    let syncedEvents = 0;

    for (const calendarId of calendarIds) {
      try {
        // Get events from the next 30 days
        const timeMin = new Date().toISOString();
        const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const response = await axios.get(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params: {
            timeMin,
            timeMax,
            singleEvents: true,
            orderBy: 'startTime'
          }
        });

        const events = response.data.items || [];

        for (const event of events) {
          // Skip all-day events and events without proper time
          if (!event.start?.dateTime || !event.end?.dateTime) continue;

          const startTime = new Date(event.start.dateTime);
          const endTime = new Date(event.end.dateTime);

          // Check if this event already exists
          const existingEvent = await Availability.findOne({
            userId: req.user._id,
            source: 'google_calendar',
            externalEventId: event.id
          });

          if (!existingEvent) {
            await Availability.create({
              userId: req.user._id,
              type: 'busy',
              title: event.summary || 'Busy',
              startTime,
              endTime,
              source: 'google_calendar',
              externalEventId: event.id,
              isRecurring: false
            });
            syncedEvents++;
          }
        }

      } catch (calendarError) {
        console.error(`Error syncing calendar ${calendarId}:`, calendarError.message);
        // Continue with other calendars
      }
    }

    res.json({ 
      message: `Synced ${syncedEvents} events successfully`,
      syncedEvents 
    });

  } catch (error) {
    console.error('Google Calendar sync error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
