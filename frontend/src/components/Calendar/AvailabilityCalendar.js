import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const AvailabilityCalendar = ({ events = [], onSelectSlot, onSelectEvent, editable = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Format events for react-big-calendar
  const formattedEvents = events.map(event => ({
    id: event._id,
    title: event.title || (event.type === 'available' ? 'Available' : 'Busy'),
    start: new Date(event.startTime),
    end: new Date(event.endTime),
    resource: event,
    className: `availability-${event.type}`
  }));

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';

    switch (event.resource.type) {
      case 'available':
        backgroundColor = '#10b981';
        borderColor = '#059669';
        break;
      case 'busy':
        backgroundColor = '#ef4444';
        borderColor = '#dc2626';
        break;
      case 'override':
        backgroundColor = '#f59e0b';
        borderColor = '#d97706';
        break;
      default:
        break;
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        border: '0px',
        borderRadius: '4px',
        fontSize: '12px'
      }
    };
  };

  const handleSelectSlot = (slotInfo) => {
    if (editable && onSelectSlot) {
      onSelectSlot(slotInfo);
    }
  };

  const handleSelectEvent = (event) => {
    if (onSelectEvent) {
      onSelectEvent(event.resource);
    }
  };

  return (
    <div className="calendar-container" style={{ height: '600px' }}>
      <Calendar
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        views={['month', 'week', 'day']}
        step={60}
        showMultiDayTimes
        date={currentDate}
        onNavigate={setCurrentDate}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable={editable}
        eventPropGetter={eventStyleGetter}
        formats={{
          timeGutterFormat: 'HH:mm',
          eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
            localizer.format(start, 'HH:mm', culture) + ' - ' +
            localizer.format(end, 'HH:mm', culture)
        }}
        min={new Date(2023, 0, 1, 6, 0)} // 6 AM
        max={new Date(2023, 0, 1, 23, 59)} // 11:59 PM
      />
    </div>
  );
};

export default AvailabilityCalendar;
