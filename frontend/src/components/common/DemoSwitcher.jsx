import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, RefreshCw, UserCheck, Shield, Building2, User } from 'lucide-react';

export const DemoSwitcher = () => {
  const { user, switchRole, resetData } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleRoleChange = async (role) => {
    const switched = await switchRole(role);
    showToast(`Switched demo role to: ${role.toUpperCase()}`, 'info');
    if (role === 'organizer') navigate('/organizer/events');
    else if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'attendee') navigate('/attendee/dashboard');
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo data back to default events, categories and users?')) {
      resetData();
      showToast('All demo data has been reset to defaults.', 'success');
      window.location.reload();
    }
  };

  return (
    <div className="demo-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, letterSpacing: '0.02em', color: '#C7D2FE' }}>
          <Sparkles size={14} color="#A5B4FC" /> DEMO MODE:
        </span>
        <span style={{ opacity: 0.85, fontSize: '0.78rem' }}>
          Active: <strong style={{ color: '#FFFFFF' }}>{user ? `${user.name} (${user.role.toUpperCase()})` : 'Public Guest'}</strong>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Switch Role:</span>
        <button
          onClick={() => handleRoleChange('organizer')}
          style={{
            background: user?.role === 'organizer' ? '#7541C8' : 'rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            padding: '3px 10px',
            borderRadius: 9999,
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <Building2 size={12} /> Organizer
        </button>

        <button
          onClick={() => handleRoleChange('attendee')}
          style={{
            background: user?.role === 'attendee' ? '#7541C8' : 'rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            padding: '3px 10px',
            borderRadius: 9999,
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <User size={12} /> Attendee
        </button>

        <button
          onClick={() => handleRoleChange('admin')}
          style={{
            background: user?.role === 'admin' ? '#7541C8' : 'rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            padding: '3px 10px',
            borderRadius: 9999,
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <Shield size={12} /> Admin
        </button>

        <button
          onClick={handleReset}
          title="Reset sample events, categories and registrations"
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#FCA5A5',
            padding: '3px 8px',
            borderRadius: 9999,
            fontSize: '0.72rem',
            fontWeight: 600,
            marginLeft: 8,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <RefreshCw size={11} /> Reset Data
        </button>
      </div>
    </div>
  );
};
