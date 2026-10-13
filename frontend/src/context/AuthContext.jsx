import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { initStorage, resetAllDemoData } from '../services/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initStorage();
    let isMounted = true;

    authService.getCurrentUser()
      .then((currentUser) => {
        if (isMounted) {
          setUser(currentUser);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const loggedUser = await authService.login(email, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const register = async (userData) => {
    const newUser = await authService.register(userData);
    setUser(newUser);
    return newUser;
  };

  const switchRole = async (role) => {
    const switchedUser = await authService.switchRole(role);
    if (switchedUser) {
      setUser({ ...switchedUser });
    }
    return switchedUser;
  };

  const resetData = () => {
    resetAllDemoData();
    authService.getCurrentUser().then(u => setUser(u));
  };

  const updateUser = (updates) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
  };

  const demoAccounts = authService.getDemoAccounts();

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        switchRole,
        resetData,
        updateUser,
        demoAccounts,
        isAdmin: user?.role === 'admin',
        isOrganizer: user?.role === 'organizer',
        isAttendee: user?.role === 'attendee'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
