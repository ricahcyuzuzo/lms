import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import {
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  PlusIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const leaveBalances = [
  {
    type: 'Personal Time Off',
    total: 20,
    used: 5,
    remaining: 15,
    icon: ChartBarIcon,
    color: 'bg-blue-500',
  },
  {
    type: 'Sick Leave',
    total: 10,
    used: 2,
    remaining: 8,
    icon: ClockIcon,
    color: 'bg-green-500',
  },
  {
    type: 'Compassionate',
    total: 5,
    used: 0,
    remaining: 5,
    icon: UserGroupIcon,
    color: 'bg-purple-500',
  },
];

const upcomingLeaves = [
  {
    id: 1,
    type: 'Personal Time Off',
    startDate: '2025-05-01',
    endDate: '2025-05-05',
    status: 'Approved',
  },
  {
    id: 2,
    type: 'Sick Leave',
    startDate: '2025-06-15',
    endDate: '2025-06-16',
    status: 'Pending',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { instance } = useMsal();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Welcome section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's an overview of your leave status
          </p>
        </div>
        <button
          onClick={() => instance.logout()}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>

      {/* Leave balances */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {leaveBalances.map((balance) => (
          <div
            key={balance.type}
            className="relative rounded-lg bg-white shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`rounded-md ${balance.color} p-3`}>
                  <balance.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">
                    {balance.type}
                  </p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {balance.remaining}
                    </p>
                    <p className="ml-2 text-sm text-gray-500">/ {balance.total} days</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">Used: {balance.used} days</span>
                  <span className="text-gray-500">
                    {Math.round((balance.used / balance.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${balance.color} h-2 rounded-full`}
                    style={{
                      width: `${(balance.used / balance.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/apply')}
            className="inline-flex items-center gap-x-2 rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Apply for Leave
          </button>
          <button
            onClick={() => navigate('/calendar')}
            className="inline-flex items-center gap-x-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <CalendarDaysIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            View Calendar
          </button>
        </div>
      </div>

      {/* Upcoming leaves */}
      <div className="mt-8">
        <h2 className="text-base font-semibold leading-6 text-gray-900">
          Upcoming Leaves
        </h2>
        <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
          <ul role="list" className="divide-y divide-gray-200">
            {upcomingLeaves.map((leave) => (
              <li key={leave.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{leave.type}</p>
                    <p className="text-sm text-gray-500">
                      {leave.startDate} - {leave.endDate}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      leave.status === 'Approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {leave.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
