import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  PlusIcon,
  CalendarDaysIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { format, parseISO, isAfter, startOfToday } from 'date-fns';
import { leaveApi, LeaveBalance, LeaveHistoryItem, LeaveType } from '../services/api';
import { CircularProgress, Chip } from '@mui/material';
import LeaveCalendar from '../components/LeaveCalendar';

// Icon mapping for different leave types
const leaveTypeIcons: { [key: string]: any } = {
  'Annual leave': ChartBarIcon,
  'Sick Leave': ClockIcon,
  'Maternity leave': UserGroupIcon,
  'Unpaid leave': ExclamationCircleIcon,
  'Vacancy leave': CalendarDaysIcon,
};

// Color mapping for different leave types
const leaveTypeColors: { [key: string]: string } = {
  'Annual leave': 'bg-blue-500',
  'Sick Leave': 'bg-green-500',
  'Maternity leave': 'bg-purple-500',
  'Unpaid leave': 'bg-red-500',
  'Vacancy leave': 'bg-yellow-500',
};

// Default annual allowances for each leave type
const defaultAllowances: { [key: string]: number } = {
  'Annual leave': 24,
  'Sick Leave': 15,
  'Maternity leave': 90,
  'Unpaid leave': 30,
  'Vacancy leave': 10,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });
  const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState<LeaveHistoryItem[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState<LeaveHistoryItem[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [leaveHistory, dashboardData] = await Promise.all([
        leaveApi.getLeaveHistory(),
        leaveApi.getDashboardData()
      ]);

      setLeaves(leaveHistory.data);
      setLeaveBalances(dashboardData.leaveBalances);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  // Calculate leave balances from the leaves data
  const calculateLeaveBalances = () => {
    if (!leaveTypes) return [];
    
    return leaveTypes.map(type => {
      const typeLeaves = leaves.filter(leave => 
        leave.leaveType.id === type.id && leave.status > 0 // Only count approved leaves
      );
      
      const used = typeLeaves.reduce((sum, leave) => sum + Math.abs(leave.days), 0);
      const total = defaultAllowances[type.title] || 30; // Use default if not found
      
      return {
        leaveType: type,
        total,
        used,
        remaining: total - used
      };
    });
  };

  // Use upcomingLeaves state from getEmployeeLeaves (already filtered)
  // No need for getUpcomingLeaves anymore.

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with sign out */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Welcome back, {user?.names}
          </p>
        </div>
      </div>

      {/* Leave balance cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {leaveBalances.map((balance: LeaveBalance) => (
          <div
            key={balance.leaveType.id}
            className="bg-white rounded-lg shadow p-6"
          >
            <dt>
              <div className={`absolute rounded-md ${leaveTypeColors[balance.leaveType.title] || 'bg-gray-500'} p-3 group-hover:scale-110 transition-transform duration-300`}>
                <ChartBarIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {balance.leaveType.title}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">
                {balance.remaining} / {balance.total}
              </p>
              <p className="ml-2 text-sm text-gray-500">days remaining</p>
            </dd>

            {/* Progress bar section */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Used: {balance.used} days</span>
                <span className={`font-medium ${
                  (balance.used / balance.total) > 0.8 ? 'text-red-600' : 
                  (balance.used / balance.total) > 0.5 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {Math.round((balance.used / balance.total) * 100)}%
                </span>
              </div>
              <div className="mt-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`${leaveTypeColors[balance.leaveType.title] || 'bg-gray-500'} h-2 rounded-full transition-all duration-500 transform origin-left`}
                  style={{
                    width: `${Math.min((balance.used / balance.total) * 100, 100)}%`,
                  }}
                />
              </div>
              {/* Additional info */}
              <div className="mt-2 text-xs text-gray-500">
                {balance.remaining === 0 ? (
                  <span className="text-red-600 font-medium">No days remaining</span>
                ) : balance.remaining <= 3 ? (
                  <span className="text-yellow-600 font-medium">Low balance</span>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => window.location.href = '/apply'}
            className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
          >
            <div className="flex-shrink-0">
              <PlusIcon className="h-6 w-6 text-gray-600" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">Apply for Leave</p>
              <p className="text-sm text-gray-500">Submit a new leave request</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/history')}
            className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
          >
            <div className="flex-shrink-0">
              <CalendarDaysIcon className="h-6 w-6 text-gray-600" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">Leave History</p>
              <p className="text-sm text-gray-500">View your leave history</p>
              <p className="text-sm font-medium text-gray-900">Team Calendar</p>
              <p className="text-sm text-gray-500">View team leave schedule</p>
            </div>
          </button>
        </div>
      </div>
      
      {/* Upcoming Leaves Table */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Upcoming Leaves</h2>
        <div className="mt-4 flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {upcomingLeaves.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                          No upcoming leaves.
                        </td>
                      </tr>
                    ) : (
                      upcomingLeaves.map((leave: LeaveHistoryItem) => (
                      <tr key={leave.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {leave.leaveType.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {format(parseISO(leave.fromDate), 'MMM dd, yyyy')}
                            {!leave.isFullDay && ' (Half Day)'}
                            {' - '}
                            {format(parseISO(leave.returnDate), 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Chip
                            label={leave.status > 0 ? 'Approved' : leave.status < 0 ? 'Rejected' : 'Pending'}
                            color={leave.status > 0 ? 'success' : leave.status < 0 ? 'error' : 'warning'}
                            size="small"
                          />
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
