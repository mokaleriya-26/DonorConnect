import { apiClient } from './apiClient';
import { mockAuthService } from './mockAuthService';

export const DEMO_PASSWORD = 'EventSphere123!';

export const authService = {
  getCurrentUser: async () => {
    try {
      const res = await apiClient.get('/auth/me');
      return res.user;
    } catch (err) {
      // Fallback to local storage if offline
      return mockAuthService.getCurrentUser();
    }
  },

  login: async (email, password) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      return res.user;
    } catch (err) {
      if (err.status === 0) {
        // Backend offline fallback
        return mockAuthService.login(email, password);
      }
      throw err;
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      // Ignore offline logout error
    }
    return mockAuthService.logout();
  },

  register: async ({ name, email, role, password, organization, city, bio }) => {
    try {
      const res = await apiClient.post('/auth/register', {
        name,
        email,
        password,
        role: role || 'attendee',
        organization,
        city,
        bio
      });
      return res.user;
    } catch (err) {
      if (err.status === 0) {
        return mockAuthService.register({ name, email, role, password });
      }
      throw err;
    }
  },

  switchRole: async (role) => {
    // Authenticate genuinely via backend as the corresponding demo user
    const emailMap = {
      attendee: 'attendee@eventsphere.demo',
      organizer: 'organizer@eventsphere.demo',
      admin: 'admin@eventsphere.demo'
    };

    const targetEmail = emailMap[role];
    if (targetEmail) {
      try {
        const res = await apiClient.post('/auth/login', {
          email: targetEmail,
          password: DEMO_PASSWORD
        });
        return res.user;
      } catch (err) {
        // Fallback to offline mock switch if backend unavailable
        return mockAuthService.switchRole(role);
      }
    }
    return null;
  },

  getDemoAccounts: () => {
    return mockAuthService.getDemoAccounts();
  }
};
