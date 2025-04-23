import React, { useEffect, useState } from 'react';
import { notificationsApi } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selected, setSelected] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserId(user.id);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    notificationsApi.getUserNotifications(userId)
      .then(data => setNotifications(data))
      .finally(() => setLoading(false));
  }, [userId]);

  const markAsRead = async (notif: Notification) => {
    if (!notif.read && userId) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      try {
        await notificationsApi.markAsRead(notif.id, userId);
      } catch {
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: false } : n));
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="text-gray-500">No notifications found.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {notifications.map((notif) => (
            <li
              key={notif.id}
              className={`p-4 cursor-pointer ${notif.read ? 'bg-white' : 'bg-blue-50 hover:bg-blue-100'}`}
              onClick={() => {
                setSelected(notif);
                markAsRead(notif);
              }}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800 text-sm">{notif.type}</span>
                <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</span>
              </div>
              <div className="text-gray-700 text-sm mt-1 truncate">{notif.message}</div>
              {notif.read ? (
                <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Read</span>
              ) : (
                <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">Unread</span>
              )}
            </li>
          ))}
        </ul>
      )}
      {/* Modal for notification details */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setSelected(null)}
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
  );
};

export default NotificationsPage;
