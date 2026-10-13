import { getItem, setItem, STORAGE_KEYS } from './storage';
import { eventService } from './eventService';

export const bookingService = {
  getUserBookings: (userId) => {
    const bookings = getItem(STORAGE_KEYS.BOOKINGS, []);
    return bookings.filter(b => b.userId === userId);
  },

  getEventAttendees: (eventId) => {
    const bookings = getItem(STORAGE_KEYS.BOOKINGS, []);
    return bookings.filter(b => b.eventId === eventId && b.status !== 'cancelled');
  },

  /**
   * Derive live capacity and registration availability dynamically from valid bookings
   */
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

  createBooking: (event, user, ticketType = 'General Admission') => {
    if (!event) throw new Error('Event is required.');
    if (!user) throw new Error('Please log in to register for this event.');

    // Paid event check
    if (event.priceType === 'paid') {
      throw new Error('Direct credit card payments are coming soon in our next release.');
    }

    // Role check: ensure bookings are made by attendees or provide notice
    const bookings = getItem(STORAGE_KEYS.BOOKINGS, []);

    // Rule 1: A user cannot register twice for the same event
    const existing = bookings.find(
      b => b.eventId === event.id && b.userId === user.id && b.status === 'confirmed'
    );
    if (existing) {
      throw new Error(`You have already registered for this event with booking reference: ${existing.bookingRef}`);
    }

    // Rule 2 & 3: Cancelled or unpublished
    if (event.status === 'cancelled') {
      throw new Error('This event has been cancelled and is no longer accepting registrations.');
    }
    if (event.status !== 'published') {
      throw new Error('This event is a draft or not yet open for public registrations.');
    }

    // Rule 4: Past event check
    const today = new Date().toISOString().split('T')[0];
    if (event.startDate < today || event.status === 'past') {
      throw new Error('This event has already taken place and cannot accept registrations.');
    }

    // Rule 5: Capacity limit derived from valid confirmed registrations
    const confirmedCount = bookings.filter(
      b => b.eventId === event.id && b.status === 'confirmed'
    ).length;
    const capacity = event.capacity || 0;
    if (confirmedCount >= capacity) {
      throw new Error('This event has reached full capacity. No further spots are available.');
    }

    // Generate unique booking reference (e.g. ES-2026-XXXX)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `ES-2026-${randomSuffix}`;

    const newBooking = {
      id: `bkg-${Date.now()}-${randomSuffix}`,
      bookingRef,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.startDate,
      eventTime: `${event.startTime} - ${event.endTime}`,
      venue: `${event.venue}, ${event.city}`,
      userId: user.id,
      attendeeName: user.name,
      attendeeEmail: user.email,
      ticketType: ticketType || 'General Admission',
      price: 0,
      status: 'confirmed',
      bookingDate: new Date().toISOString()
    };

    // Save booking
    const updatedBookings = [newBooking, ...bookings];
    setItem(STORAGE_KEYS.BOOKINGS, updatedBookings);

    // Update event registration count to reflect live bookings
    eventService.updateEvent(event.id, {
      registeredCount: confirmedCount + 1
    });

    return newBooking;
  },

  cancelBooking: (bookingId) => {
    const bookings = getItem(STORAGE_KEYS.BOOKINGS, []);
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found.');

    booking.status = 'cancelled';
    setItem(STORAGE_KEYS.BOOKINGS, [...bookings]);

    // Re-derive event registration count from confirmed bookings
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
      `"${a.bookingRef}"`,
      `"${a.attendeeName}"`,
      `"${a.attendeeEmail}"`,
      `"${a.ticketType}"`,
      `"${a.status}"`,
      `"${new Date(a.bookingDate).toLocaleDateString()}"`
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
