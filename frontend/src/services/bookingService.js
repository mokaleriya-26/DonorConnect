import { getItem, setItem, STORAGE_KEYS } from './storage';
import { eventService } from './eventService';
import { apiClient } from './apiClient';

export const bookingService = {
  syncMyBookings: async () => {
    try {
      const res = await apiClient.get('/registrations/me');
      if (res?.bookings && Array.isArray(res.bookings)) {
        const existing = getItem(STORAGE_KEYS.BOOKINGS, []);
        const otherBookings = existing.filter(b => !res.bookings.some(rb => rb.id === b.id));
        const merged = [...res.bookings, ...otherBookings];
        setItem(STORAGE_KEYS.BOOKINGS, merged);
        return res.bookings;
      }
    } catch {
      // Offline fallback
    }
    return getItem(STORAGE_KEYS.BOOKINGS, []);
  },

  getUserBookings: (userId) => {
    const bookings = getItem(STORAGE_KEYS.BOOKINGS, []);
    return bookings.filter(b => b.userId === userId || b.attendeeId === userId);
  },

  getEventAttendees: (eventId) => {
    const bookings = getItem(STORAGE_KEYS.BOOKINGS, []);
    return bookings.filter(b => b.eventId === eventId && b.status !== 'cancelled');
  },

  getEventAvailability: (eventId) => {
    const event = eventService.getEventById(eventId);
    if (!event) return { available: false, reason: 'Event not found' };

    const today = new Date().toISOString().split('T')[0];
    const bookings = getItem(STORAGE_KEYS.BOOKINGS, []);
    const confirmedBookings = bookings.filter(
      b => b.eventId === event.id && b.status === 'confirmed'
    );
    const confirmedCount = confirmedBookings.length;
    const capacity = event.capacity || 0;
    const remainingSpots = Math.max(0, capacity - confirmedCount);

    if (event.status === 'cancelled') {
      return {
        available: false,
        reason: 'This event has been cancelled and cannot accept new registrations.',
        remainingSpots: 0,
        confirmedCount,
        capacity
      };
    }

    if (event.status === 'draft') {
      return {
        available: false,
        reason: 'This event is currently in draft mode and is not yet open to public registrations.',
        remainingSpots: 0,
        confirmedCount,
        capacity
      };
    }

    if (event.startDate < today || event.status === 'past') {
      return {
        available: false,
        reason: 'This event has already passed and cannot accept new registrations.',
        remainingSpots: 0,
        confirmedCount,
        capacity
      };
    }

    if (remainingSpots <= 0) {
      return {
        available: false,
        reason: 'This event has reached full capacity.',
        remainingSpots: 0,
        confirmedCount,
        capacity
      };
    }

    return {
      available: true,
      reason: null,
      remainingSpots,
      confirmedCount,
      capacity
    };
  },

  createBooking: async (event, user, ticketType = 'General Admission') => {
    if (!event) throw new Error('Event is required.');
    if (!user) throw new Error('Please log in to register for this event.');

    if (event.priceType === 'paid' || event.price > 0) {
      throw new Error('Direct credit card payments are coming soon in our next release.');
    }

    let newBooking = null;

    try {
      const res = await apiClient.post(`/registrations/events/${event.id}/register`, {
        ticketType
      });
      if (res?.booking) {
        newBooking = {
          ...res.booking,
          userId: user.id
        };
      }
    } catch (err) {
      if (err.status !== 0) {
        throw err;
      }
    }

    const bookings = getItem(STORAGE_KEYS.BOOKINGS, []);

    if (!newBooking) {
      // Local fallback if offline
      const existing = bookings.find(
        b => b.eventId === event.id && (b.userId === user.id || b.attendeeId === user.id) && b.status === 'confirmed'
      );
      if (existing) {
        throw new Error(`You have already registered for this event with booking reference: ${existing.bookingRef}`);
      }

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const bookingRef = `ES-2026-${randomSuffix}`;

      newBooking = {
        id: `bkg-${Date.now()}-${randomSuffix}`,
        bookingRef,
        bookingReference: bookingRef,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.startDate,
        eventTime: `${event.startTime} - ${event.endTime}`,
        venue: `${event.venue || event.venueName}, ${event.city}`,
        userId: user.id,
        attendeeName: user.name,
        attendeeEmail: user.email,
        ticketType: ticketType || 'General Admission',
        price: 0,
        status: 'confirmed',
        bookingDate: new Date().toISOString()
      };
    }

    const updatedBookings = [newBooking, ...bookings];
    setItem(STORAGE_KEYS.BOOKINGS, updatedBookings);

    const confirmedRemaining = updatedBookings.filter(
      b => b.eventId === event.id && b.status === 'confirmed'
    ).length;
    eventService.updateEvent(event.id, {
      registeredCount: confirmedRemaining
    });

    return newBooking;
  },

  cancelBooking: async (bookingId) => {
    try {
      await apiClient.delete(`/registrations/${bookingId}`);
    } catch (err) {
      if (err.status !== 0) throw err;
    }

    const bookings = getItem(STORAGE_KEYS.BOOKINGS, []);
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found.');

    booking.status = 'cancelled';
    setItem(STORAGE_KEYS.BOOKINGS, [...bookings]);

    const confirmedRemaining = bookings.filter(
      b => b.eventId === booking.eventId && b.status === 'confirmed'
    ).length;

    eventService.updateEvent(booking.eventId, {
      registeredCount: confirmedRemaining
    });

    return booking;
  },

  exportAttendeesCSV: (event, attendees) => {
    if (!attendees || attendees.length === 0) {
      throw new Error('No attendee records available to export.');
    }

    const headers = ['Booking Ref', 'Attendee Name', 'Email', 'Ticket Type', 'Status', 'Registration Date'];
    const rows = attendees.map(a => [
      `"${a.bookingRef || a.bookingReference}"`,
      `"${a.attendeeName}"`,
      `"${a.attendeeEmail}"`,
      `"${a.ticketType}"`,
      `"${a.status}"`,
      `"${new Date(a.bookingDate || a.registeredAt).toLocaleDateString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${event.slug || event.id}-attendees-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }
};
