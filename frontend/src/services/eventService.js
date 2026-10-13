import { getItem, setItem, STORAGE_KEYS } from './storage';
import { apiClient } from './apiClient';

// Helper to format payload for backend
const formatPayloadForBackend = (data) => {
  return {
    title: data.title,
    categoryId: data.categoryId,
    summary: data.summary || '',
    description: data.description || '',
    coverImageUrl: data.coverImage || data.coverImageUrl,
    startDatetime: data.startDatetime || (data.startDate ? `${data.startDate} 10:00:00` : new Date().toISOString()),
    endDatetime: data.endDatetime || (data.endDate ? `${data.endDate} 18:00:00` : new Date().toISOString()),
    venueName: data.venue || data.venueName || 'Main Venue',
    address: data.address || '',
    city: data.city || 'Mumbai',
    eventType: data.type || data.eventType || 'in-person',
    capacity: parseInt(data.capacity, 10) || 100,
    price: data.priceType === 'paid' ? parseFloat(data.price || 0) : 0,
    currency: data.currency || 'USD',
    status: data.status || 'published',
    featured: Boolean(data.featured)
  };
};

export const eventService = {
  // Sync latest events from backend API into local cache
  syncFromBackend: async () => {
    try {
      const res = await apiClient.get('/events?limit=100&dateFilter=all');
      if (res?.data && Array.isArray(res.data)) {
        setItem(STORAGE_KEYS.EVENTS, res.data);
        return res.data;
      }
    } catch (err) {
      // Backend offline or error; gracefully use local cache
    }
    return getItem(STORAGE_KEYS.EVENTS, []);
  },

  getAllEvents: () => {
    return getItem(STORAGE_KEYS.EVENTS, []);
  },

  getPublicEvents: () => {
    const events = getItem(STORAGE_KEYS.EVENTS, []);
    return events.filter(e => e.status === 'published');
  },

  getEventById: (id) => {
    const events = getItem(STORAGE_KEYS.EVENTS, []);
    return events.find(e => e.id === id || e.slug === id) || null;
  },

  getOrganizerEvents: (organizerId) => {
    const events = getItem(STORAGE_KEYS.EVENTS, []);
    return events.filter(e => e.organizerId === organizerId);
  },

  createEvent: async (eventData, currentUser) => {
    const events = getItem(STORAGE_KEYS.EVENTS, []);
    let newEvent = null;

    try {
      const payload = formatPayloadForBackend(eventData);
      const res = await apiClient.post('/events', payload);
      if (res?.event) {
        newEvent = res.event;
      }
    } catch (err) {
      if (err.status !== 0) {
        // Backend returned specific business/validation error
        throw err;
      }
      // If backend completely offline, proceed with local fallback
    }

    if (!newEvent) {
      const id = `evt-${Date.now()}`;
      const slug = eventData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      newEvent = {
        id,
        slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
        title: eventData.title,
        summary: eventData.summary || '',
        description: eventData.description || '',
        categoryId: eventData.categoryId || 'cat-tech',
        categoryName: eventData.categoryName || 'Tech Events',
        badgeText: eventData.badgeText || (eventData.priceType === 'paid' ? 'Paid' : 'Free'),
        organizerId: currentUser ? currentUser.id : 'usr-organizer',
        organizerName: currentUser ? (currentUser.organization || currentUser.name) : 'InnoVerse Technologies Pvt. Ltd.',
        organizerAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        coverImage: eventData.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
        startDate: eventData.startDate,
        startTime: eventData.startTime || '10:00 AM',
        endDate: eventData.endDate || eventData.startDate,
        endTime: eventData.endTime || '04:00 PM',
        venue: eventData.venue || 'Main Auditorium',
        city: eventData.city || 'Mumbai',
        type: eventData.type || 'in-person',
        capacity: parseInt(eventData.capacity, 10) || 100,
        registeredCount: 0,
        priceType: eventData.priceType || 'free',
        price: eventData.priceType === 'paid' ? parseFloat(eventData.price || 0) : 0,
        status: eventData.status || 'published',
        featured: false,
        createdAt: new Date().toISOString()
      };
    }

    const updated = [newEvent, ...events.filter(e => e.id !== newEvent.id)];
    setItem(STORAGE_KEYS.EVENTS, updated);
    return newEvent;
  },

  updateEvent: async (id, updates) => {
    const events = getItem(STORAGE_KEYS.EVENTS, []);
    const index = events.findIndex(e => e.id === id);

    let updatedEvent = null;
    try {
      const payload = formatPayloadForBackend(updates);
      const res = await apiClient.put(`/events/${id}`, payload);
      if (res?.event) {
        updatedEvent = res.event;
      }
    } catch (err) {
      if (err.status !== 0) {
        throw err;
      }
    }

    if (!updatedEvent) {
      if (index === -1) throw new Error('Event not found');
      updatedEvent = {
        ...events[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }

    if (index !== -1) {
      events[index] = updatedEvent;
      setItem(STORAGE_KEYS.EVENTS, [...events]);
    } else {
      setItem(STORAGE_KEYS.EVENTS, [updatedEvent, ...events]);
    }

    return updatedEvent;
  },

  deleteEvent: async (id) => {
    try {
      await apiClient.delete(`/events/${id}`);
    } catch (err) {
      if (err.status !== 0) throw err;
    }
    const events = getItem(STORAGE_KEYS.EVENTS, []);
    const filtered = events.filter(e => e.id !== id);
    setItem(STORAGE_KEYS.EVENTS, filtered);
    return true;
  },

  updateEventStatus: async (id, status) => {
    try {
      await apiClient.patch(`/events/${id}/status`, { status });
    } catch (err) {
      if (err.status !== 0) throw err;
    }

    const events = getItem(STORAGE_KEYS.EVENTS, []);
    const event = events.find(e => e.id === id);
    if (event) {
      event.status = status;
      setItem(STORAGE_KEYS.EVENTS, [...events]);
    }
    return event;
  },

  searchEvents: ({ query = '', category = '', priceType = '', dateFilter = '', city = '', sort = 'upcoming' } = {}) => {
    let events = getItem(STORAGE_KEYS.EVENTS, []);

    // Filter by query (title, summary, venue, city)
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      events = events.filter(e =>
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.summary && e.summary.toLowerCase().includes(q)) ||
        (e.city && e.city.toLowerCase().includes(q)) ||
        (e.venue && e.venue.toLowerCase().includes(q)) ||
        (e.venueName && e.venueName.toLowerCase().includes(q)) ||
        (e.categoryName && e.categoryName.toLowerCase().includes(q))
      );
    }

    // Filter by category slug or ID
    if (category && category !== 'all') {
      events = events.filter(e =>
        e.categoryId === category ||
        (e.categoryName && e.categoryName.toLowerCase().includes(category.toLowerCase())) ||
        (e.categorySlug && e.categorySlug.toLowerCase() === category.toLowerCase())
      );
    }

    // Filter by price type
    if (priceType && priceType !== 'all') {
      events = events.filter(e => e.priceType === priceType);
    }

    // Filter by city
    if (city && city !== 'all') {
      events = events.filter(e => e.city && e.city.toLowerCase() === city.toLowerCase());
    }

    // Filter by date
    const today = new Date().toISOString().split('T')[0];
    if (dateFilter === 'today') {
      events = events.filter(e => e.startDate === today);
    } else if (dateFilter === 'upcoming') {
      events = events.filter(e => e.startDate >= today);
    } else if (dateFilter === 'past') {
      events = events.filter(e => e.startDate < today);
    }

    // Sort
    if (sort === 'upcoming') {
      events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    } else if (sort === 'newest') {
      events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'popular') {
      events.sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0));
    }

    return events;
  }
};

// Initial background sync with backend API
if (typeof window !== 'undefined') {
  eventService.syncFromBackend();
}
