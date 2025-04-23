import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

import { UserRole } from '../services/api';
import { BellIcon } from '@heroicons/react/24/outline';

import { notificationsApi } from '../services/api';
import { useEffect, useState } from 'react';
import ProfileDropdown from './ProfileDropdown';

interface RootState {
  auth: {
    user: {
      role: UserRole;
    } | null;
  };
}

// We'll add a badge for unread notifications, so we need to pass the unread count to the navigation.
// We'll add the badge rendering logic in the sidebar below.
const getNavigation = (role: UserRole | null) => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Apply Leave', href: '/apply', icon: ClipboardDocumentListIcon },
    { name: 'Leave History', href: '/history', icon: ClockIcon },
    { name: 'Team Calendar', href: '/calendar', icon: CalendarIcon },
  ];

  // Admin and manager can see the admin panel
  if (role === 'ADMIN' || role === 'MANAGER') {
    return [...baseNavigation, { name: 'Admin Panel', href: '/admin', icon: Cog6ToothIcon }];
  }

  return baseNavigation;
};

export default function Layout() {
  const location = useLocation();
  // Get user from localStorage
  let user = null;
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      user = JSON.parse(userData);
    } catch {
      user = null;
    }
  }
  const navigation = getNavigation(user?.role || null);
  const userId = user?.id;

  // Use notifications hook for accurate unread count
  // This will also allow us to refetch when returning from /notifications
  // (for best UX, could add polling or listen to route changes)
  const { unreadCount, refetch } = require('../hooks/useNotifications').useNotifications(userId);
  // Refresh unread count when route changes (e.g., after returning from /notifications)
  useEffect(() => {
    refetch();
  }, [location.pathname, refetch]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Notification bell and user profile card at top right */}
      <div className="fixed top-4 right-8 z-50 flex items-center space-x-4">
        {userId && (
          <Link to="/notifications">
            <div className="relative inline-block">
              <BellIcon className="h-7 w-7 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </div>
          </Link>
        )}
        {/* Profile dropdown */}
        {user && (
          <ProfileDropdown user={user} />
        )}
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-white pt-5">
             <div className="flex flex-col items-center px-4 space-y-2">
              {/* Logo and app title */}
              <div className="flex flex-col items-center mb-2">
                <img src={require('../assets/africa-hr-logo.svg').default} alt="Africa HR Logo" className="w-12 h-12 mb-1" />
                <h1 className="text-2xl font-bold text-blue-700 tracking-wide">Africa HR</h1>
              </div>
            </div>
            <div className="mt-5 flex flex-grow flex-col">
              <nav className="flex-1 space-y-1 px-2 pb-4">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                        isActive
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="relative flex items-center">
                        <item.icon
                          className={`mr-3 h-6 w-6 flex-shrink-0 ${
                            isActive
                              ? 'text-gray-500'
                              : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                        {/* Only show badge on Notifications link and if there are unread notifications */}
                        {item.name === 'Notifications' && unreadCount > 0 && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500 text-white">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

          </div>
        </div>

        {/* Mobile header */}
        <div className="sticky top-0 z-10 bg-white pl-1 pt-1 sm:pl-3 sm:pt-3 lg:hidden">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col lg:pl-64">
          <main className="flex-1">
            <div className="py-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
