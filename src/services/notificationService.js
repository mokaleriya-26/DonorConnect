import { getItem, setItem, STORAGE_KEYS } from './storage';

export const notificationService = {
  getNotifications: (userId) => {
    const notifs = getItem(STORAGE_KEYS.NOTIFICATIONS, []);
    return notifs.filter(n => !n.userId || n.userId === userId);
  },

  markAsRead: (id) => {
    const notifs = getItem(STORAGE_KEYS.NOTIFICATIONS, []);
    const notif = notifs.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      setItem(STORAGE_KEYS.NOTIFICATIONS, [...notifs]);
    }
    return notif;
  },

  markAllAsRead: (userId) => {
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
