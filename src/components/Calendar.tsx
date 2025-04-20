import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { format, isSameDay, isWithinInterval } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import 'react-calendar/dist/Calendar.css';
import '../styles/calendar.css';

interface LeaveEvent {
  id: string;
  startDate: Date;
  endDate: Date;
  type: string;
  status: 'approved' | 'pending' | 'rejected';
  employee: string;
}

// Sample leave events (replace with actual data later)
const sampleLeaveEvents: LeaveEvent[] = [
  {
    id: '1',
    startDate: new Date(2025, 3, 20),
    endDate: new Date(2025, 3, 22),
    type: 'Vacation',
    status: 'approved',
    employee: 'John Doe',
  },
  {
    id: '2',
    startDate: new Date(2025, 3, 25),
    endDate: new Date(2025, 3, 25),
    type: 'Sick Leave',
    status: 'pending',
    employee: 'Jane Smith',
  },
];

const getStatusColor = (status: LeaveEvent['status']): string => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function TeamCalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getEventsForDate = (date: Date) => {
    return sampleLeaveEvents.filter((event) =>
      isWithinInterval(date, { start: event.startDate, end: event.endDate })
    );
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const events = getEventsForDate(date);
      if (events.length > 0) {
        return 'has-events';
      }
    }
    return null;
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const events = getEventsForDate(date);
      if (events.length > 0) {
        return (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <div className="h-1 w-1 rounded-full bg-blue-500"></div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex gap-6">
          <div className="flex-1">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileClassName={tileClassName}
              tileContent={tileContent}
              prevLabel={<ChevronLeftIcon className="h-5 w-5" />}
              nextLabel={<ChevronRightIcon className="h-5 w-5" />}
              className="custom-calendar"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-4">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h2>
            <div className="space-y-3">
              {getEventsForDate(selectedDate).map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{event.employee}</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                        event.status
                      )}`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{event.type}</p>
                  <p className="text-sm text-gray-500">
                    {format(event.startDate, 'MMM d')} -{' '}
                    {format(event.endDate, 'MMM d')}
                  </p>
                </div>
              ))}
              {getEventsForDate(selectedDate).length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No leave events for this date
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
