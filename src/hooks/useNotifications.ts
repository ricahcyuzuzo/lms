import { useEffect, useState, useCallback } from 'react';
import { notificationsApi } from '../services/api';

export function useNotifications(userId?: number | null) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await notificationsApi.getUserNotifications(userId);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to fetch notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, loading, error, refetch: fetchNotifications };
}
