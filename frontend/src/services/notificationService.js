import { getItem, setItem, STORAGE_KEYS } from './storage';
import { apiClient } from './apiClient';

export const notificationService = {
  syncNotifications: async () => {
    try {
      const res = await apiClient.get('/notifications');
      if (res?.notifications && Array.isArray(res.notifications)) {
        setItem(STORAGE_KEYS.NOTIFICATIONS, res.notifications);
        return res.notifications;
      }
    } catch {
      // Offline fallback
    }
    return getItem(STORAGE_KEYS.NOTIFICATIONS, []);
  },

  getNotifications: (userId) => {
    const notifs = getItem(STORAGE_KEYS.NOTIFICATIONS, []);
    return notifs.filter(n => !n.userId || n.userId === userId);
  },

  markAsRead: async (id) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch {
      // Offline fallback
    }

    const notifs = getItem(STORAGE_KEYS.NOTIFICATIONS, []);
    const notif = notifs.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      setItem(STORAGE_KEYS.NOTIFICATIONS, [...notifs]);
    }
    return notif;
  },

  markAllAsRead: async (userId) => {
    try {
      await apiClient.post('/notifications/read-all');
    } catch {
      // Offline fallback
    }

    const notifs = getItem(STORAGE_KEYS.NOTIFICATIONS, []);
    notifs.forEach(n => {
      if (!n.userId || n.userId === userId) {
        n.read = true;
      }
    });
    setItem(STORAGE_KEYS.NOTIFICATIONS, [...notifs]);
    return notifs;
  }
};
