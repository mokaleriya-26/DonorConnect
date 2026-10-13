import { getItem, setItem, STORAGE_KEYS } from './storage';
import { apiClient } from './apiClient';

export const userService = {
  syncUsersFromBackend: async () => {
    try {
      const res = await apiClient.get('/admin/users');
      if (res?.users && Array.isArray(res.users)) {
        setItem(STORAGE_KEYS.USERS, res.users);
        return res.users;
      }
    } catch {
      // Offline fallback
    }
    return getItem(STORAGE_KEYS.USERS, []);
  },

  getAllUsers: () => {
    return getItem(STORAGE_KEYS.USERS, []);
  },

  toggleUserStatus: async (userId, currentAdminId) => {
    if (userId === currentAdminId) {
      throw new Error('Action prevented: You cannot suspend your own active administrator account.');
    }

    try {
      const res = await apiClient.patch(`/admin/users/${userId}/status`);
      if (res?.user) {
        const users = getItem(STORAGE_KEYS.USERS, []);
        const idx = users.findIndex(u => u.id === userId);
        if (idx !== -1) users[idx] = res.user;
        setItem(STORAGE_KEYS.USERS, [...users]);
        return res.user;
      }
    } catch (err) {
      if (err.status !== 0) throw err;
    }

    const users = getItem(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');

    user.status = user.status === 'suspended' ? 'active' : 'suspended';
    setItem(STORAGE_KEYS.USERS, [...users]);
    return user;
  },

  updateUserProfile: async (userId, updates) => {
    try {
      const res = await apiClient.put('/users/profile', updates);
      if (res?.user) {
        const users = getItem(STORAGE_KEYS.USERS, []);
        const idx = users.findIndex(u => u.id === userId);
        if (idx !== -1) users[idx] = res.user;
        setItem(STORAGE_KEYS.USERS, [...users]);

        const currentUser = getItem(STORAGE_KEYS.CURRENT_USER, null);
        if (currentUser && currentUser.id === userId) {
          setItem(STORAGE_KEYS.CURRENT_USER, res.user);
        }
        return res.user;
      }
    } catch (err) {
      if (err.status !== 0) throw err;
    }

    const users = getItem(STORAGE_KEYS.USERS, []);
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found');

    users[index] = { ...users[index], ...updates };
    setItem(STORAGE_KEYS.USERS, [...users]);

    const currentUser = getItem(STORAGE_KEYS.CURRENT_USER, null);
    if (currentUser && currentUser.id === userId) {
      setItem(STORAGE_KEYS.CURRENT_USER, users[index]);
    }

    return users[index];
  }
};
