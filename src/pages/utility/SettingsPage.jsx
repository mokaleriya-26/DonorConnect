import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Settings, RefreshCw, Bell, Shield, Save, CheckCircle } from 'lucide-react';

export const SettingsPage = () => {
  const { user, resetData } = useAuth();
  const { showToast } = useToast();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [browserAlerts, setBrowserAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    showToast('Notification and display preferences saved locally.', 'success');
  };

  const handleConfirmReset = () => {
    resetData();
    showToast('Demo data successfully reset to seed defaults.', 'success');
    window.location.reload();
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
          Application Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: 2 }}>
          Configure your local notification preferences and demo platform controls.
        </p>
      </div>

      {/* Notification Preferences */}
      <div className="card-surface" style={{ padding: '32px', borderRadius: 22, marginBottom: 28 }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={18} color="var(--primary-purple)" /> In-App Notification Alerts
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: 22 }}>
          Choose which activity updates trigger in-app banner toasts.
        </p>

        <form onSubmit={handleSavePreferences}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--primary-purple)' }}
              />
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Registration Notifications
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Receive alerts when someone registers for your hosted events.
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={browserAlerts}
                onChange={(e) => setBrowserAlerts(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--primary-purple)' }}
              />
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Capacity & Milestone Warnings
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Get notified when an event crosses 75% or 100% capacity.
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--primary-purple)' }}
              />
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Weekly Discovery Digest
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Curated recommendations based on your favorite categories.
                </div>
              </div>
            </label>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '9px 20px', fontSize: '0.88rem' }}>
            <Save size={15} />
            <span>Save Preferences</span>
          </button>
        </form>
      </div>

      {/* Demo State Management Box */}
      <div className="card-surface" style={{ padding: '32px', borderRadius: 22, border: '1px solid #FECACA' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#B91C1C', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={18} /> Demo State Management
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 20 }}>
          Need to test the platform from a clean slate? Reset all sample events, registrations, custom
          categories, and user states back to the original seed data.
        </p>

        <button
          type="button"
          onClick={() => setConfirmResetOpen(true)}
          className="btn-danger"
          style={{ padding: '10px 20px', fontSize: '0.88rem' }}
        >
          <RefreshCw size={15} />
          <span>Reset All Demo Data</span>
        </button>
      </div>

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Demo Data"
        message="This will overwrite any created events, booking registrations, and user modifications in localStorage with the default seed dataset."
        confirmText="Yes, Reset Everything"
        danger={true}
      />
    </div>
  );
};
