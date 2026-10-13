import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { eventService } from '../../services/eventService';
import { categoryService } from '../../services/categoryService';
import {
  Calendar,
  Clock,
  MapPin,
  Image,
  DollarSign,
  Users,
  Layers,
  ArrowLeft,
  CheckCircle,
  FileEdit,
  Sparkles
} from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Tech Conference', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80' },
  { label: 'Jazz Music Night', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80' },
  { label: 'Business & Pitching', url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Mountain Trek & Nature', url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80' },
  { label: 'Art Gallery Showcase', url: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80' },
  { label: 'Culinary & Food Fest', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' }
];

export const OrganizerEventForm = () => {
  const { eventId } = useParams();
  const isEditMode = Boolean(eventId);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const categories = categoryService.getActiveCategories();

  // Form states
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-tech');
  const [coverImage, setCoverImage] = useState(PRESET_IMAGES[0].url);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('04:00 PM');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [type, setType] = useState('in-person');
  const [capacity, setCapacity] = useState('200');
  const [priceType, setPriceType] = useState('free');
  const [price, setPrice] = useState('0');
  const [badgeText, setBadgeText] = useState('Corporate');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prepopulate if edit mode
  useEffect(() => {
    if (isEditMode) {
      const existing = eventService.getEventById(eventId);
      if (!existing) {
        showToast('Event not found.', 'error');
        navigate('/organizer/events');
        return;
      }

      // Check ownership
      if (user && existing.organizerId !== user.id && user.role !== 'admin') {
        showToast('You cannot edit events belonging to another organizer.', 'error');
        navigate('/organizer/events');
        return;
      }

      setTitle(existing.title || '');
      setSummary(existing.summary || '');
      setDescription(existing.description || '');
      setCategoryId(existing.categoryId || 'cat-tech');
      setCoverImage(existing.coverImage || PRESET_IMAGES[0].url);
      setStartDate(existing.startDate || '');
      setStartTime(existing.startTime || '10:00 AM');
      setEndDate(existing.endDate || existing.startDate || '');
      setEndTime(existing.endTime || '04:00 PM');
      setVenue(existing.venue || '');
      setCity(existing.city || 'Mumbai');
      setType(existing.type || 'in-person');
      setCapacity(String(existing.capacity || 100));
      setPriceType(existing.priceType || 'free');
      setPrice(String(existing.price || 0));
      setBadgeText(existing.badgeText || 'Corporate');
    } else {
      // Default dates to next week
      const d = new Date();
      d.setDate(d.getDate() + 7);
      const formatted = d.toISOString().split('T')[0];
      setStartDate(formatted);
      setEndDate(formatted);
    }
  }, [isEditMode, eventId, navigate, user, showToast]);

  const handleSubmit = async (targetStatus) => {
    setError('');

    // Validations
    if (!title.trim()) {
      setError('Please provide a compelling event title.');
      return;
    }
    if (!startDate) {
      setError('Start date is required.');
      return;
    }
    if (endDate && endDate < startDate) {
      setError('End date cannot precede the start date.');
      return;
    }
    const capNum = parseInt(capacity, 10);
    if (isNaN(capNum) || capNum <= 0) {
      setError('Capacity must be a positive number of attendees.');
      return;
    }
    if (priceType === 'paid') {
      const pNum = parseFloat(price);
      if (isNaN(pNum) || pNum < 0) {
        setError('Price cannot be negative.');
        return;
      }
    }

    const catObj = categories.find(c => c.id === categoryId);

    const eventPayload = {
      title,
      summary,
      description,
      categoryId,
      categoryName: catObj ? catObj.name : 'Tech Events',
      badgeText: badgeText || (catObj ? catObj.name : 'Event'),
      coverImage,
      startDate,
      startTime,
      endDate: endDate || startDate,
      endTime,
      venue: venue || (type === 'online' ? 'Online Virtual Stage' : 'Main Hall'),
      city,
      type,
      capacity: capNum,
      priceType,
      price: priceType === 'paid' ? parseFloat(price) : 0,
      status: targetStatus
    };

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await eventService.updateEvent(eventId, eventPayload);
        showToast('Event updated successfully!', 'success');
      } else {
        await eventService.createEvent(eventPayload, user);
        showToast(
          targetStatus === 'published' ? 'Event published live!' : 'Event saved as draft.',
          'success'
        );
      }
      navigate('/organizer/events');
    } catch (err) {
      setError(err.message || 'Failed to save event.');
      showToast(err.message || 'Failed to save event.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <Link to="/organizer/events" className="btn-secondary" style={{ padding: 8, borderRadius: '50%' }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            {isEditMode ? 'Edit Event Details' : 'Create New Event'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 2 }}>
            Fill in the details below to publish or save your event draft.
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: '#FEE2E2',
            color: '#B91C1C',
            padding: '12px 18px',
            borderRadius: 14,
            fontSize: '0.88rem',
            marginBottom: 24,
            border: '1px solid #FCA5A5'
          }}
        >
          {error}
        </div>
      )}

      {/* Form Card */}
      <div className="card-surface" style={{ padding: '36px', borderRadius: 24, marginBottom: 32 }}>
        {/* Section 1: Basic Information */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color="var(--primary-purple)" /> Basic Information
          </h3>

          <div style={{ marginBottom: 18 }}>
            <label className="form-label">Event Title *</label>
            <input
              type="text"
              placeholder="e.g. Annual Tech Innovators Summit 2026"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
            <div>
              <label className="form-label">Category *</label>
              <select
                className="form-control"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Card Tag Badge Text</label>
              <input
                type="text"
                placeholder="e.g. Corporate, Entertainment, Cultural..."
                className="form-control"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label className="form-label">Short Summary</label>
            <input
              type="text"
              placeholder="One-liner hook displayed on event card..."
              className="form-control"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Full Description</label>
            <textarea
              rows={4}
              placeholder="Detailed description of schedule, guest speakers, key topics..."
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '32px 0' }} />

        {/* Section 2: Cover Image */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Image size={18} color="var(--primary-purple)" /> Cover Image
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'center', marginBottom: 16 }}>
            <div>
              <label className="form-label">Cover Image URL</label>
              <input
                type="url"
                placeholder="https://..."
                className="form-control"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginTop: 4 }}>
                Choose a preset image below or paste any Unsplash image URL.
              </span>
            </div>

            {/* Live Preview */}
            <div style={{ height: 130, borderRadius: 14, overflow: 'hidden', background: '#F1F5F9', border: '1px solid var(--border-subtle)' }}>
              <img
                src={coverImage}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = PRESET_IMAGES[0].url;
                }}
              />
            </div>
          </div>

          {/* Preset Image Chips */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Quick Presets:
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PRESET_IMAGES.map((img) => (
                <button
                  type="button"
                  key={img.label}
                  onClick={() => setCoverImage(img.url)}
                  style={{
                    background: coverImage === img.url ? 'var(--accent-lavender)' : '#FFFFFF',
                    border: `1px solid ${coverImage === img.url ? 'var(--primary-purple)' : 'var(--border-subtle)'}`,
                    color: coverImage === img.url ? 'var(--dark-purple)' : 'var(--text-secondary)',
                    borderRadius: 9999,
                    padding: '5px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 500
                  }}
                >
                  {img.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '32px 0' }} />

        {/* Section 3: Date, Time & Location */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={18} color="var(--primary-purple)" /> Date, Time & Venue
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
            <div>
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Start Time</label>
              <input
                type="text"
                placeholder="10:00 AM"
                className="form-control"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">End Time</label>
              <input
                type="text"
                placeholder="04:00 PM"
                className="form-control"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <label className="form-label">Event Format</label>
              <select
                className="form-control"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="in-person">In-Person Gathering</option>
                <option value="online">Virtual / Online Webinar</option>
              </select>
            </div>

            <div>
              <label className="form-label">City</label>
              <input
                type="text"
                placeholder="e.g. Mumbai, Pune, Bengaluru"
                className="form-control"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Venue / Hall / Platform</label>
              <input
                type="text"
                placeholder="e.g. The Grand Convention Hall"
                className="form-control"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '32px 0' }} />

        {/* Section 4: Tickets, Pricing & Capacity */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} color="var(--primary-purple)" /> Capacity & Ticketing
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label className="form-label">Total Capacity *</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 500"
                className="form-control"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Pricing Type</label>
              <select
                className="form-control"
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
              >
                <option value="free">Free Event</option>
                <option value="paid">Paid Admission</option>
              </select>
            </div>

            {priceType === 'paid' && (
              <div>
                <label className="form-label">Price ($ USD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 45"
                  className="form-control"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 14 }}>
        <button
          type="button"
          onClick={() => navigate('/organizer/events')}
          className="btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => handleSubmit('draft')}
          className="btn-secondary"
          style={{ background: '#FFFFFF', color: 'var(--dark-purple)', borderColor: 'var(--primary-purple)' }}
          disabled={isSubmitting}
        >
          <FileEdit size={16} /> Save as Draft
        </button>

        <button
          type="button"
          onClick={() => handleSubmit('published')}
          className="btn-primary"
          disabled={isSubmitting}
        >
          <CheckCircle size={16} /> {isEditMode ? 'Save & Update' : 'Publish Event'}
        </button>
      </div>
    </div>
  );
};
