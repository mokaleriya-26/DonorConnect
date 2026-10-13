import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockAuthService } from '../services/mockAuthService';
import { initStorage, resetAllDemoData } from '../services/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initStorage();
    const currentUser = mockAuthService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const loggedUser = await mockAuthService.login(email, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = async () => {
    await mockAuthService.logout();
    setUser(null);
  };

  const register = async (userData) => {
    const newUser = await mockAuthService.register(userData);
    setUser(newUser);
    return newUser;
  };

  const switchRole = (role) => {
    const switchedUser = mockAuthService.switchRole(role);
    if (switchedUser) {
      setUser({ ...switchedUser });
    }
    return switchedUser;
  };

  const resetData = () => {
    resetAllDemoData();
    const currentUser = mockAuthService.getCurrentUser();
    setUser(currentUser);
  };

  const updateUser = (updates) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    mockAuthService.setCurrentUser(updated);
    setUser(updated);
  };

  const demoAccounts = mockAuthService.getDemoAccounts();

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
