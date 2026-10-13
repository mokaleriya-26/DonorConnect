import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Users,
  Search,
  Shield,
  Building2,
  User,
  UserX,
  UserCheck,
  AlertTriangle
} from 'lucide-react';

export const AdminUsers = () => {
  const { user: currentAdmin } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState(() => userService.getAllUsers());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [suspendTarget, setSuspendTarget] = useState(null);

  const refreshUsers = () => {
    setUsers(userService.getAllUsers());
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = !search.trim() ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = (targetUser) => {
    if (targetUser.id === currentAdmin?.id) {
      showToast('Action prevented: You cannot suspend your own active administrator account.', 'error');
      return;
    }

    if (targetUser.status === 'active') {
      setSuspendTarget(targetUser);
    } else {
      // Re-activate
      try {
        userService.toggleUserStatus(targetUser.id, currentAdmin?.id);
        refreshUsers();
        showToast(`Account for ${targetUser.name} reactivated.`, 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const confirmSuspend = () => {
    if (!suspendTarget) return;
    try {
      userService.toggleUserStatus(suspendTarget.id, currentAdmin?.id);
      refreshUsers();
      showToast(`Account for ${suspendTarget.name} has been suspended.`, 'info');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSuspendTarget(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
          User Accounts
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: 2 }}>
          Manage attendees, organizers, and platform administrators.
        </p>
      </div>

      {/* Filter Bar */}
      <div
        className="card-surface"
        style={{
          padding: '16px 20px',
          borderRadius: 18,
          marginBottom: 24,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
          <Search size={18} color="var(--primary-purple)" />
          <input
            type="text"
            placeholder="Search by user name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.92rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="form-control"
            style={{ padding: '6px 14px', width: 'auto', borderRadius: 9999, fontSize: '0.85rem' }}
          >
            <option value="all">All Roles</option>
            <option value="attendee">Attendees</option>
            <option value="organizer">Organizers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card-surface" style={{ borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>User Profile</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Location</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Registered</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => {
                const isCurrentAdmin = u.id === currentAdmin?.id;

                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={u.avatar}
                          alt={u.name}
                          style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {u.name}
                            {isCurrentAdmin && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--dark-purple)', background: 'var(--accent-lavender)', padding: '1px 6px', borderRadius: 4 }}>
                                You
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        className={`badge-pill ${
                          u.role === 'admin'
                            ? 'badge-lavender'
                            : u.role === 'organizer'
                            ? 'badge-blue'
                            : 'badge-gray'
                        }`}
                      >
                        {u.role === 'admin' && <Shield size={12} />}
                        {u.role === 'organizer' && <Building2 size={12} />}
                        {u.role === 'attendee' && <User size={12} />}
                        {u.role.toUpperCase()}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {u.city || 'Not specified'}
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {new Date(u.registeredAt || '2026-01-01').toLocaleDateString()}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge-pill ${u.status === 'active' ? 'badge-mint' : 'badge-red'}`}>
                        {u.status === 'active' ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      {isCurrentAdmin ? (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Current User</span>
                      ) : u.status === 'active' ? (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="btn-secondary"
                          style={{ padding: '5px 12px', fontSize: '0.78rem', color: '#DC2626' }}
                        >
                          <UserX size={13} /> Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="btn-secondary"
                          style={{ padding: '5px 12px', fontSize: '0.78rem', color: '#0E744F' }}
                        >
                          <UserCheck size={13} /> Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(suspendTarget)}
        onClose={() => setSuspendTarget(null)}
        onConfirm={confirmSuspend}
        title={`Suspend Account for ${suspendTarget?.name}?`}
        message="This user will be prevented from logging into EventSphere until reactivated."
        confirmText="Suspend Account"
        danger={true}
      />
    </div>
  );
};
