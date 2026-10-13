import { getItem, setItem, STORAGE_KEYS } from './storage';

export const userService = {
  getAllUsers: () => {
    return getItem(STORAGE_KEYS.USERS, []);
  },

  toggleUserStatus: (userId, currentAdminId) => {
    if (userId === currentAdminId) {
      throw new Error('Action prevented: You cannot suspend your own active administrator account.');
    }

    const users = getItem(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');

    user.status = user.status === 'suspended' ? 'active' : 'suspended';
    setItem(STORAGE_KEYS.USERS, [...users]);
    return user;
  },

  updateUserProfile: (userId, updates) => {
    const users = getItem(STORAGE_KEYS.USERS, []);
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found');

    users[index] = { ...users[index], ...updates };
    setItem(STORAGE_KEYS.USERS, [...users]);

    // Update current user if it is them
    const currentUser = getItem(STORAGE_KEYS.CURRENT_USER, null);
    if (currentUser && currentUser.id === userId) {
      setItem(STORAGE_KEYS.CURRENT_USER, users[index]);
    }

    return users[index];
  }
};
