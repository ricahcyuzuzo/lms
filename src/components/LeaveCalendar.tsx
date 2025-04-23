import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, parseISO, isSameDay } from 'date-fns';
import { LeaveHistoryItem } from '../services/api';

interface LeaveCalendarProps {
  leaves: LeaveHistoryItem[];
}

export default function LeaveCalendar({ leaves = [] }: LeaveCalendarProps) {
  const today = new Date();
  const firstDayOfMonth = startOfMonth(today);
  const lastDayOfMonth = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });

  // Get day of week of first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // Create empty cells for days before the first day of the month
  const emptyCells = Array(firstDayOfWeek).fill(null);
  
  // Function to check if a date has any leaves
  const getLeavesForDate = (date: Date) => {
    if (!leaves) return [];
    return leaves.filter(leave => {
      const fromDate = parseISO(leave.fromDate);
      const returnDate = parseISO(leave.returnDate);
      return date >= fromDate && date <= returnDate;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {format(today, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {/* Calendar header */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="bg-gray-50 py-2 text-center text-xs font-semibold text-gray-700"
            >
              {day}
            </div>
          ))}

          {/* Empty cells */}
          {emptyCells.map((_, index) => (
            <div key={`empty-${index}`} className="bg-white h-24 p-2" />
          ))}

          {/* Calendar days */}
          {daysInMonth.map((date) => {
            const dayLeaves = getLeavesForDate(date);
            return (
              <div
                key={date.toString()}
                className={`bg-white h-24 p-2 ${
                  isToday(date) ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex flex-col h-full">
                  <span
                    className={`text-sm font-medium ${
                      isToday(date) ? 'text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    {format(date, 'd')}
                  </span>
                  <div className="mt-1 overflow-y-auto flex-grow">
                    {dayLeaves.map((leave) => (
                      <div
                        key={leave.id}
                        className="text-xs mb-1 p-1 rounded"
                        style={{
                          backgroundColor: leave.status === 0 ? '#FEF3C7' : '#D1FAE5',
                          color: leave.status === 0 ? '#92400E' : '#065F46'
                        }}
                      >
                        {leave.employee.names} - {leave.leaveType.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
