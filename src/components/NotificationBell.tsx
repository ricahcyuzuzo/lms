import React, { useEffect, useState, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { notificationsApi } from '../services/api';

interface Notification {
  id: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  userId: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Notification | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!userId) return;
    notificationsApi.getUserNotifications(userId)
      .then(data => setNotifications(data))
      .catch(() => setNotifications([]));
  }, [userId]);

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalOpen) return; // Don't close dropdown if modal is open
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, modalOpen]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={bellRef}
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Notifications"
      >
        <BellIcon className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-2 max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="px-4 py-2 text-gray-500 text-sm">No notifications</div>
            )}
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`px-4 py-2 border-b last:border-b-0 ${notif.read ? 'bg-white' : 'bg-blue-50'} cursor-pointer`}
                onClick={async () => {
                  setSelected(notif);
                  setModalOpen(true);
                  if (!notif.read) {
                    // Optimistically mark as read
                    setNotifications((prev) => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                    try {
                      await notificationsApi.markAsRead(notif.id, userId);
                    } catch {
                      // If error, revert
                      setNotifications((prev) => prev.map(n => n.id === notif.id ? { ...n, read: false } : n));
                    }
                  }
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800 text-sm">{notif.type}</span>
                  <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</span>
                </div>
                <div className="text-gray-700 text-sm mt-1">{notif.message}</div>
              </div>
            ))}
            {modalOpen && selected && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                    onClick={() => setModalOpen(false)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                  <div className="mb-2">
                    <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(selected.createdAt), { addSuffix: true })}</span>
                  </div>
                  <div className="font-bold text-lg mb-2">{selected.type}</div>
                  <div className="text-gray-800 mb-4 whitespace-pre-line">{selected.message}</div>
                  {selected.read ? (
                    <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Read</span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">Unread</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
