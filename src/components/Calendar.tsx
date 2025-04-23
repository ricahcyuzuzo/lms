import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { format, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import { LeaveHistoryItem } from '../services/api';
import 'react-calendar/dist/Calendar.css';
import '../styles/calendar.css';

interface LeaveEvent {
  id: number;
  startDate: Date;
  endDate: Date;
  title: string;
  status: number;
}

interface CalendarProps {
  leaves: LeaveHistoryItem[];
  onDateChange?: (date: Date) => void;
}

const getStatusColor = (status: number): string => {
  switch (status) {
    case 1:
      return 'bg-green-200';
    case 2:
      return 'bg-red-200';
    default:
      return 'bg-yellow-200';
  }
};

const getStatusText = (status: number): string => {
  switch (status) {
    case 1:
      return 'Approved';
    case 0:
      return 'Pending';
    case 2:
      return 'Rejected';
    default:
      return 'Unknown';
  }
};

export default function TeamCalendarView({ leaves }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Convert leaves to LeaveEvent format
  const leaveEvents: LeaveEvent[] = leaves.map((leave: LeaveHistoryItem) => ({
    id: leave.id,
    startDate: parseISO(leave.fromDate),
    endDate: parseISO(leave.returnDate),
    title: `${leave.leaveType.title} - ${leave.employee.names}`,
    status: leave.status
  }));

  const getEventsForDate = (date: Date) => {
    return leaveEvents.filter((event) =>
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
                    <div className="text-sm font-medium">{event.title}</div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                        event.status
                      )}`}
                    >
                      {getStatusText(event.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{event.title}</p>
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
