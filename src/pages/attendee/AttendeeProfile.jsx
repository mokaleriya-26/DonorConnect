import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { User, Mail, MapPin, Lock, Save, Sparkles, CheckCircle2 } from 'lucide-react';

export const AttendeeProfile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.city || 'San Francisco, CA');
  const [bio, setBio] = useState(user?.bio || '');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      userService.updateUserProfile(user.id, { name, city, bio });
      updateUser({ name, city, bio });
      showToast('Profile information saved successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    showToast('Password updated successfully for demo session.', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
          My Account Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: 2 }}>
          Manage your contact details, discovery location, and personal preferences.
        </p>
      </div>

      {/* Main Profile Details Card */}
      <div className="card-surface" style={{ padding: '36px', borderRadius: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border-subtle)' }}>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name}
            style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-lavender)' }}
          />
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {user?.name}
            </h3>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              {user?.email} • {user?.role?.toUpperCase()}
            </div>
            <span className="badge-pill badge-mint" style={{ marginTop: 8 }}>
              Active Demo Member
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-control"
                value={user?.email || ''}
                disabled
                style={{ background: '#F8FAFC', color: 'var(--text-secondary)' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label className="form-label">Primary City / Region</label>
            <input
              type="text"
              className="form-control"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="form-label">Bio / About Me</label>
            <textarea
              rows={3}
              className="form-control"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other attendees and hosts about yourself..."
            />
          </div>

          <button type="submit" disabled={isSaving} className="btn-primary" style={{ padding: '10px 22px' }}>
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>

      {/* Password Change Card */}
      <div className="card-surface" style={{ padding: '36px', borderRadius: 24 }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lock size={18} color="var(--primary-purple)" /> Security & Password
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 20 }}>
          Change your account password for demo access.
        </p>

        <form onSubmit={handleUpdatePassword}>
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Current Password</label>
            <input
              type="password"
              placeholder="Enter current password (demo: EventSphere123!)"
              className="form-control"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <label className="form-label">New Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                placeholder="Repeat new password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-secondary" style={{ padding: '10px 20px' }}>
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
