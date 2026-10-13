import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, MoreVertical, Edit3, Eye, UserCheck, XCircle, CheckCircle } from 'lucide-react';
import { CategoryPill, EventStatusBadge } from '../common/Badge';

export const EventCard = ({
  event,
  isOrganizerView = false,
  onEdit,
  onAttendees,
  onStatusChange,
  onDelete
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formattedDate = new Date(event.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleCardClick = (e) => {
    // If the click originated from an interactive button or link, don't trigger card navigation
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(`/events/${event.id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Don't trigger if focus was on a nested button or link
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
        return;
      }
      e.preventDefault();
      navigate(`/events/${event.id}`);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMenuOpen(false);
      }}
      className="card-surface event-card-interactive"
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        background: '#FFFFFF',
        border: '1px solid #ECECF2',
        transition: 'all 0.24s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 10px 24px rgba(117, 65, 200, 0.1), 0 2px 6px rgba(0, 0, 0, 0.04)'
          : '0 2px 10px rgba(41, 40, 58, 0.03)'
      }}
      aria-label={`View event details for ${event.title}`}
    >
      {/* Cover Image Container */}
      <div style={{ position: 'relative', width: '100%', height: 135, overflow: 'hidden', background: '#F1F5F9' }}>
        <img
          src={event.coverImage}
          alt={event.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.35s ease',
            transform: isHovered ? 'scale(1.04)' : 'scale(1.0)'
          }}
        />

        {/* Category Pill Tag (Bottom Right of Image, frosted white matching screenshot) */}
        <div style={{ position: 'absolute', bottom: 8, right: 8, zIndex: 2 }}>
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(4px)',
              color: '#29283A',
              fontSize: '0.68rem',
              fontWeight: 600,
              padding: '2px 9px',
              borderRadius: 9999,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
              display: 'inline-block'
            }}
          >
            {event.badgeText || event.categoryName}
          </span>
        </div>

        {/* Status indicator if Draft or Cancelled in Organizer View */}
        {isOrganizerView && event.status !== 'published' && (
          <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
            <EventStatusBadge status={event.status} />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div style={{ padding: '12px 14px 14px 14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Organizer Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <img
              src={event.organizerAvatar}
              alt={event.organizerName}
              style={{ width: 19, height: 19, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';
              }}
            />
            <span
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 180
              }}
            >
              {event.organizerName}
            </span>
          </div>

          {/* Organizer action menu if applicable */}
          {isOrganizerView && (
            <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="btn-ghost"
                style={{ padding: '4px', borderRadius: '50%' }}
                aria-label="Manage Event"
              >
                <MoreVertical size={16} />
              </button>

              {menuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    background: '#FFFFFF',
                    borderRadius: 12,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    border: '1px solid var(--border-subtle)',
                    width: 160,
                    zIndex: 30,
                    padding: '6px 0'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    to={`/organizer/events/${event.id}/edit`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 14px',
                      fontSize: '0.85rem',
                      color: 'var(--text-main)'
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Edit3 size={14} /> Edit Event
                  </Link>
                  <Link
                    to={`/organizer/events/${event.id}/attendees`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 14px',
                      fontSize: '0.85rem',
                      color: 'var(--text-main)'
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <UserCheck size={14} /> View Attendees
                  </Link>
                  <Link
                    to={`/events/${event.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 14px',
                      fontSize: '0.85rem',
                      color: 'var(--text-main)'
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Eye size={14} /> Public Preview
                  </Link>
                  {event.status === 'draft' && (
                    <button
                      type="button"
                      onClick={() => {
                        onStatusChange && onStatusChange(event.id, 'published');
                        setMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 14px',
                        fontSize: '0.85rem',
                        color: '#0E744F',
                        width: '100%',
                        textAlign: 'left'
                      }}
                    >
                      <CheckCircle size={14} /> Publish
                    </button>
                  )}
                  {event.status === 'published' && (
                    <button
                      type="button"
                      onClick={() => {
                        onStatusChange && onStatusChange(event.id, 'cancelled');
                        setMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 14px',
                        fontSize: '0.85rem',
                        color: '#DC2626',
                        width: '100%',
                        textAlign: 'left'
                      }}
                    >
                      <XCircle size={14} /> Cancel Event
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '0.92rem',
            fontWeight: 700,
            color: isHovered ? 'var(--primary-violet)' : '#29283A',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.6em',
            transition: 'color 0.2s ease',
            margin: '2px 0 6px 0'
          }}
        >
          {event.title}
        </h3>

        {/* Date and Time */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 5, fontSize: '0.72rem', color: '#858594' }}>
          <Calendar size={12} color="#858594" style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap' }}>{formattedDate}</span>
          <span style={{ color: '#D1D5DB' }}>•</span>
          <Clock size={12} color="#858594" style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap' }}>{event.startTime} - {event.endTime}</span>
        </div>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.72rem', color: '#858594', marginTop: 4 }}>
          <MapPin size={12} color="#858594" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {event.venue}, {event.city}
          </span>
        </div>
      </div>
    </div>
  );
};
