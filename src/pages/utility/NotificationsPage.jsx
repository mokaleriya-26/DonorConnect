import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { notificationService } from '../../services/notificationService';
import { EmptyState } from '../../components/common/EmptyState';
import { Bell, CheckCheck, CheckCircle2, Ticket, Sparkles } from 'lucide-react';

export const NotificationsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState(() =>
    notificationService.getNotifications(user?.id)
  );
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'

  const refreshNotifs = () => {
    setNotifications(notificationService.getNotifications(user?.id));
  };

  const handleMarkRead = (id) => {
    notificationService.markAsRead(id);
    refreshNotifs();
    showToast('Notification marked as read.', 'info');
  };

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead(user?.id);
    refreshNotifs();
    showToast('All notifications marked as read.', 'success');
  };

  const displayedNotifs = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            Notifications
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: 2 }}>
            Real-time updates regarding registrations, capacity milestones, and event alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.84rem' }}>
            <CheckCheck size={16} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="pill-tabs" style={{ marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('all')}
          className={`pill-tab ${activeTab === 'all' ? 'active' : ''}`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`pill-tab ${activeTab === 'unread' ? 'active' : ''}`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {displayedNotifs.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description={activeTab === 'unread' ? "You're all caught up! No unread notifications." : "You don't have any notifications yet."}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displayedNotifs.map(n => (
            <div
              key={n.id}
              className="card-surface"
              style={{
                borderRadius: 16,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 16,
                background: n.read ? '#FFFFFF' : 'var(--accent-lavender)',
                border: n.read ? '1px solid var(--border-subtle)' : '1px solid #D8B4FE'
              }}
            >
              <div style={{ display: 'flex', gap: 14 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: n.read ? '#F1F5F9' : 'var(--primary-purple)',
                    color: n.read ? 'var(--text-secondary)' : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Bell size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                      {n.title}
                    </h4>
                    {!n.read && (
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-purple)' }} />
                    )}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: '4px 0 6px 0', lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '0.74rem', color: '#9CA3AF' }}>{n.time}</span>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="btn-ghost"
                  style={{ fontSize: '0.78rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
