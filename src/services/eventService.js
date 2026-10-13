import { getItem, setItem, STORAGE_KEYS } from './storage';

export const eventService = {
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

  createEvent: (eventData, currentUser) => {
    const events = getItem(STORAGE_KEYS.EVENTS, []);
    const id = `evt-${Date.now()}`;
    const slug = eventData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newEvent = {
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

    const updated = [newEvent, ...events];
    setItem(STORAGE_KEYS.EVENTS, updated);
    return newEvent;
  },

  updateEvent: (id, updates) => {
    const events = getItem(STORAGE_KEYS.EVENTS, []);
    const index = events.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Event not found');

    const updatedEvent = {
      ...events[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    events[index] = updatedEvent;
    setItem(STORAGE_KEYS.EVENTS, [...events]);
    return updatedEvent;
  },

  deleteEvent: (id) => {
    const events = getItem(STORAGE_KEYS.EVENTS, []);
    const filtered = events.filter(e => e.id !== id);
    setItem(STORAGE_KEYS.EVENTS, filtered);
    return true;
  },

  updateEventStatus: (id, status) => {
    const events = getItem(STORAGE_KEYS.EVENTS, []);
    const event = events.find(e => e.id === id);
    if (!event) throw new Error('Event not found');

    event.status = status;
    setItem(STORAGE_KEYS.EVENTS, [...events]);
    return event;
  },

  searchEvents: ({ query = '', category = '', priceType = '', dateFilter = '', city = '', sort = 'upcoming' } = {}) => {
    let events = getItem(STORAGE_KEYS.EVENTS, []);

    // Filter by query (title, summary, venue, city)
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      events = events.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        (e.categoryName && e.categoryName.toLowerCase().includes(q))
      );
    }

    // Filter by category slug or ID
    if (category && category !== 'all') {
      events = events.filter(e => e.categoryId === category || (e.categoryName && e.categoryName.toLowerCase().includes(category.toLowerCase())));
    }

    // Filter by price type
    if (priceType && priceType !== 'all') {
      events = events.filter(e => e.priceType === priceType);
    }

    // Filter by city
    if (city && city !== 'all') {
      events = events.filter(e => e.city.toLowerCase() === city.toLowerCase());
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
      events.sort((a, b) => b.registeredCount - a.registeredCount);
    }

    return events;
  }
};
