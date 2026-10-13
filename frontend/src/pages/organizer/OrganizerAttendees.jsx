import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { bookingService } from '../../services/bookingService';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Users,
  Download,
  Search,
  ArrowLeft,
  Calendar,
  MapPin,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

export const OrganizerAttendees = () => {
  const { eventId } = useParams();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');

  const event = eventService.getEventById(eventId);
  const attendees = useMemo(() => {
    return event ? bookingService.getEventAttendees(event.id) : [];
  }, [event]);

  if (!event) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2>Event Not Found</h2>
        <Link to="/organizer/events" className="btn-primary" style={{ marginTop: 16 }}>
          Return to Events
        </Link>
      </div>
    );
  }

  const filteredAttendees = attendees.filter(a => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.attendeeName.toLowerCase().includes(q) ||
      a.attendeeEmail.toLowerCase().includes(q) ||
      a.bookingRef.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    try {
      bookingService.exportAttendeesCSV(event, attendees);
      showToast('Attendee roster CSV downloaded successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Could not export CSV.', 'error');
    }
  };

  const percentageFilled = Math.min(
    100,
    Math.round(((event.registeredCount || 0) / (event.capacity || 1)) * 100)
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/organizer/events" className="btn-secondary" style={{ padding: 8, borderRadius: '50%' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Attendee Roster
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 2 }}>
              Managing registrations for <strong>{event.title}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={attendees.length === 0}
          className="btn-primary"
          style={{ padding: '9px 18px', fontSize: '0.88rem' }}
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Event Mini Summary Card */}
      <div
        className="card-surface"
        style={{
          padding: '24px',
          borderRadius: 20,
          marginBottom: 28,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(240px, 1fr)',
          gap: 24,
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src={event.coverImage}
            alt={event.title}
            style={{ width: 80, height: 80, borderRadius: 14, objectFit: 'cover' }}
          />
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
              {event.title}
            </h3>
            <div style={{ display: 'flex', gap: 16, fontSize: '0.82rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={14} color="var(--primary-purple)" /> {event.startDate} • {event.startTime}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={14} color="var(--primary-purple)" /> {event.venue}, {event.city}
              </span>
            </div>
          </div>
        </div>

        {/* Capacity Meter */}
        <div style={{ background: '#F8FAFC', padding: '16px 20px', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: 6 }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Capacity Filled</span>
            <span style={{ fontWeight: 800, color: 'var(--primary-purple)' }}>
              {event.registeredCount} / {event.capacity} ({percentageFilled}%)
            </span>
          </div>
          <div style={{ width: '100%', height: 7, background: '#E2E8F0', borderRadius: 9999, overflow: 'hidden' }}>
            <div
              style={{
                width: `${percentageFilled}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary-purple), #9565E8)',
                borderRadius: 9999
              }}
            />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div
        className="card-surface"
        style={{
          padding: '14px 20px',
          borderRadius: 16,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', maxWidth: 360 }}>
          <Search size={18} color="var(--primary-purple)" />
          <input
            type="text"
            placeholder="Search attendee by name, email, or booking ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem' }}
          />
        </div>
        <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          Showing <strong>{filteredAttendees.length}</strong> registered attendees
        </span>
      </div>

      {/* Attendees Table */}
      {attendees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No registrations yet"
          description="Nobody has registered for this event yet. Share the event link on social channels to start building your audience!"
          actionText="View Public Page"
          onAction={() => window.open(`/events/${event.id}`, '_blank')}
        />
      ) : filteredAttendees.length === 0 ? (
        <EmptyState
          title="No attendees match your search"
          description="Check your spelling or clear the search input to see all registrations."
          actionText="Clear Search"
          onAction={() => setSearch('')}
        />
      ) : (
        <div className="card-surface" style={{ borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 24px', fontWeight: 600 }}>Booking Ref</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Attendee</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Ticket Tier</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Registration Date</th>
                  <th style={{ padding: '14px 24px', fontWeight: 600, textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendees.map(att => (
                  <tr key={att.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '14px 24px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--dark-purple)' }}>
                      {att.bookingRef}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{att.attendeeName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{att.attendeeEmail}</div>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                      {att.ticketType}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                      {new Date(att.bookingDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                      <span className="badge-pill badge-mint">
                        <CheckCircle size={12} /> Confirmed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
