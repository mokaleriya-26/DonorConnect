import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Compass, Layers, LogIn, UserPlus, LayoutGrid } from 'lucide-react';

import { EventSphereLogo } from '../common/EventSphereLogo';

export const Navbar = () => {
  const { user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'organizer') return '/organizer/events';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/attendee/dashboard';
  };

  return (
    <header className="public-header">
      <div className="app-container public-header-inner">
        {/* Brand Logo */}
        <EventSphereLogo size="md" variant="dark" to="/" />

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <NavLink
            to="/"
            style={({ isActive }) => ({
              fontSize: '0.92rem',
              fontWeight: 500,
              color: isActive ? 'var(--primary-purple)' : 'var(--text-secondary)'
            })}
          >
            Home
          </NavLink>

          <NavLink
            to="/events"
            style={({ isActive }) => ({
              fontSize: '0.92rem',
              fontWeight: 500,
              color: isActive ? 'var(--primary-purple)' : 'var(--text-secondary)'
            })}
          >
            Explore Events
          </NavLink>

          <NavLink
            to="/categories"
            style={({ isActive }) => ({
              fontSize: '0.92rem',
              fontWeight: 500,
              color: isActive ? 'var(--primary-purple)' : 'var(--text-secondary)'
            })}
          >
            Categories
          </NavLink>
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <Link to={getDashboardLink()} className="btn-primary" style={{ padding: '8px 18px' }}>
              <LayoutGrid size={16} />
              <span>{user.role === 'organizer' ? 'Organizer Dashboard' : 'My Dashboard'}</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px' }}>
                <LogIn size={15} />
                <span>Log In</span>
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '8px 18px' }}>
                <UserPlus size={15} />
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
