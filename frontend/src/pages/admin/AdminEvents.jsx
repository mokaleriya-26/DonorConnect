import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const AdminEvents = () => {
  const { showToast } = useToast();
  const [events, setEvents] = useState(() => eventService.getAllEvents());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmAction, setConfirmAction] = useState(null); // { eventId, status, title, actionName }

  const refreshEvents = () => {
    setEvents(eventService.getAllEvents());
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = !search.trim() ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.organizerName.toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApplyStatus = async () => {
    if (!confirmAction) return;
    try {
      await eventService.updateEventStatus(confirmAction.eventId, confirmAction.status);
      refreshEvents();
      showToast(`Event status updated to ${confirmAction.status.toUpperCase()}`, 'success');
    } catch (err) {
      showToast(err.message || 'Moderation action failed.', 'error');
    } finally {
      setConfirmAction(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
          Event Moderation & Management
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: 2 }}>
          Oversee all events across organizers, review drafts, and manage publication states.
        </p>
      </div>

      {/* Filter Controls */}
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
            placeholder="Search by event title, host, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.92rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control"
            style={{ padding: '6px 14px', width: 'auto', borderRadius: 9999, fontSize: '0.85rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>

      {/* Event Table */}
      <div className="card-surface" style={{ borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Event Title</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Host / Organizer</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Registrations</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Moderation</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map(evt => (
                <tr key={evt.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{evt.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{evt.city} • {evt.type}</div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {evt.organizerName}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {evt.categoryName}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {evt.startDate}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--primary-purple)' }}>
                    {evt.registeredCount} / {evt.capacity}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge-pill ${evt.status === 'published' ? 'badge-mint' : evt.status === 'draft' ? 'badge-amber' : 'badge-red'}`}>
                      {evt.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <Link
                        to={`/events/${evt.id}`}
                        className="btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '0.76rem' }}
                        title="View Public Page"
                      >
                        <Eye size={13} />
                      </Link>

                      {evt.status !== 'published' && (
                        <button
                          onClick={() => setConfirmAction({
                            eventId: evt.id,
                            status: 'published',
                            title: `Publish "${evt.title}"`,
                            actionName: 'Publish Event'
                          })}
                          className="btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.76rem', color: '#0E744F' }}
                          title="Approve & Publish"
                        >
                          <CheckCircle size={13} />
                        </button>
                      )}

                      {evt.status === 'published' && (
                        <button
                          onClick={() => setConfirmAction({
                            eventId: evt.id,
                            status: 'draft',
                            title: `Unpublish "${evt.title}"`,
                            actionName: 'Revert to Draft'
                          })}
                          className="btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.76rem', color: '#B45309' }}
                          title="Revert to Draft"
                        >
                          <RotateCcw size={13} />
                        </button>
                      )}

                      {evt.status !== 'cancelled' && (
                        <button
                          onClick={() => setConfirmAction({
                            eventId: evt.id,
                            status: 'cancelled',
                            title: `Cancel "${evt.title}"`,
                            actionName: 'Cancel Event'
                          })}
                          className="btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.76rem', color: '#DC2626' }}
                          title="Cancel Event"
                        >
                          <XCircle size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleApplyStatus}
        title={confirmAction?.title || 'Moderate Event'}
        message={`Are you sure you want to perform this moderation action? The event will change its publication status.`}
        confirmText={confirmAction?.actionName || 'Confirm'}
        danger={confirmAction?.status === 'cancelled'}
      />
    </div>
  );
};
