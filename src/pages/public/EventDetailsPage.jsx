import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { EventCard } from '../../components/events/EventCard';
import { CategoryPill, EventStatusBadge } from '../../components/common/Badge';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Ticket,
  Share2,
  AlertCircle,
  Building2,
  ArrowLeft,
  Sparkles,
  CreditCard
} from 'lucide-react';

export const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const event = eventService.getEventById(eventId);

  if (!event) {
    return (
      <div className="app-container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>
          Event Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          The event you are looking for may have been removed or unpublished.
        </p>
        <Link to="/events" className="btn-primary">
          <ArrowLeft size={16} /> Return to All Events
        </Link>
      </div>
    );
  }

  // Related events
  const relatedEvents = eventService
    .getPublicEvents()
    .filter(e => e.id !== event.id && e.categoryId === event.categoryId)
    .slice(0, 3);

  const availability = bookingService.getEventAvailability(event?.id);
  const remainingSpots = availability.remainingSpots;
  const isSoldOut = remainingSpots === 0;

  // Check if current user is already registered
  const userBookings = user ? bookingService.getUserBookings(user.id) : [];
  const existingBooking = userBookings.find(
    b => b.eventId === event.id && b.status === 'confirmed'
  );

  const formattedDate = new Date(event.startDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handleRegisterClick = () => {
    navigate(`/events/${event.id}/register`);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Event link copied to clipboard!', 'info');
  };

  return (
    <div className="app-container" style={{ padding: '36px 24px 80px 24px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
        <Link to="/events" style={{ color: 'var(--text-secondary)' }}>Events</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{event.title}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: 36, alignItems: 'start' }}>
        {/* Left Column: Image, Details, Description, Organizer */}
        <div>
          {/* Main Cover Banner */}
          <div
            style={{
              width: '100%',
              height: 380,
              borderRadius: 22,
              overflow: 'hidden',
              position: 'relative',
              boxShadow: 'var(--shadow-md)',
              background: '#0F172A',
              marginBottom: 28
            }}
          >
            <img
              src={event.coverImage}
              alt={event.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
              <CategoryPill name={event.badgeText || event.categoryName} />
            </div>
          </div>

          {/* Title & Organizer Info */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <img
                src={event.organizerAvatar}
                alt={event.organizerName}
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Organized by</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {event.organizerName}
                </div>
              </div>
            </div>

            <h1
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                lineHeight: 1.25,
                letterSpacing: '-0.02em',
                marginBottom: 16
              }}
            >
              {event.title}
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {event.summary}
            </p>
          </div>

          {/* Full Description */}
          <div className="card-surface" style={{ padding: '32px', borderRadius: 20, marginBottom: 36 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 16 }}>
              About This Event
            </h3>
            <div style={{ color: 'var(--text-main)', fontSize: '0.98rem', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
              {event.description}
            </div>
          </div>

          {/* Related Events */}
          {relatedEvents.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 20 }}>
                More {event.categoryName} Experiences
              </h3>
              <div className="grid-3">
                {relatedEvents.map(e => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Booking Card */}
        <div style={{ position: 'sticky', top: 90 }}>
          <div
            className="card-surface"
            style={{
              padding: '28px',
              borderRadius: 22,
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {/* Price Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TICKET PRICE</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--dark-purple)' }}>
                  {event.priceType === 'free' ? 'Free Admission' : `$${event.price}`}
                </div>
              </div>
              <button
                onClick={handleShare}
                className="btn-secondary"
                style={{ width: 38, height: 38, borderRadius: '50%', padding: 0 }}
                title="Share event link"
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* Event Time & Venue Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-lavender)', color: 'var(--dark-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DATE</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)' }}>{formattedDate}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-lavender)', color: 'var(--dark-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TIME</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)' }}>{event.startTime} - {event.endTime}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-lavender)', color: 'var(--dark-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>LOCATION</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)' }}>{event.venue}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{event.city} • {event.type === 'online' ? 'Virtual Event' : 'In-Person'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-lavender)', color: 'var(--dark-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CAPACITY</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {event.registeredCount} / {event.capacity} registered
                  </div>
                  <div style={{ fontSize: '0.78rem', color: remainingSpots < 20 ? '#DC2626' : '#10B981', fontWeight: 600 }}>
                    {isSoldOut ? 'Sold Out' : `${remainingSpots} spots remaining`}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking State Actions */}
            {existingBooking ? (
              <div
                style={{
                  background: 'var(--accent-mint)',
                  border: '1px solid #A7F3D0',
                  borderRadius: 14,
                  padding: '16px',
                  textAlign: 'center',
                  marginBottom: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#0E744F', fontWeight: 700, marginBottom: 4 }}>
                  <CheckCircle2 size={18} /> You are registered!
                </div>
                <div style={{ fontSize: '0.82rem', color: '#0E744F', marginBottom: 12 }}>
                  Booking Reference: <strong>{existingBooking.bookingRef}</strong>
                </div>
                <Link to="/attendee/bookings" className="btn-secondary" style={{ width: '100%', fontSize: '0.86rem' }}>
                  View In My Bookings
                </Link>
              </div>
            ) : event.priceType === 'paid' ? (
              <div>
                <div
                  style={{
                    background: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    borderRadius: 14,
                    padding: '14px',
                    color: '#92400E',
                    fontSize: '0.84rem',
                    marginBottom: 16,
                    lineHeight: 1.5,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8
                  }}
                >
                  <AlertCircle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>Payment booking coming soon!</strong>
                    <div>Secure checkout integration is in progress for this event.</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRegisterClick}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  <CreditCard size={16} /> View Checkout Preview (${event.price})
                </button>
              </div>
            ) : !availability.available ? (
              <button disabled className="btn-secondary" style={{ width: '100%', opacity: 0.65, cursor: 'not-allowed', padding: '12px' }}>
                {availability.reason || 'Event Unavailable'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRegisterClick}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              >
                <Ticket size={18} /> Register for Free
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
