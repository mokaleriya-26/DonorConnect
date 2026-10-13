import { query, withTransaction } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export const registerForEvent = async (eventId, attendee, ticketType = 'General Admission') => {
  if (!attendee) {
    throw new AppError('Authentication required to register for an event.', 401);
  }

  return await withTransaction(async (conn) => {
    // 1. Lock the event record for update to prevent concurrent race condition overbooking
    const [events] = await conn.execute(
      'SELECT * FROM events WHERE id = ? FOR UPDATE',
      [eventId]
    );

    if (events.length === 0) {
      throw new AppError('Event not found.', 404);
    }

    const event = events[0];

    // 2. Reject paid events in this phase
    if (Number(event.price) > 0) {
      throw new AppError('Direct credit card payments are coming soon in our next release.', 400);
    }

    // 3. Reject non-published events
    if (event.status === 'cancelled') {
      throw new AppError('This event has been cancelled and cannot accept registrations.', 400);
    }
    if (event.status === 'draft') {
      throw new AppError('This event is currently in draft mode and is not yet open to public registrations.', 400);
    }

    // 4. Reject past events
    const now = new Date();
    if (new Date(event.end_datetime) < now || event.status === 'past') {
      throw new AppError('This event has already taken place and cannot accept registrations.', 400);
    }

    // 5. Check duplicate active registration for this attendee
    const [existingRegistrations] = await conn.execute(
      "SELECT id, booking_reference FROM registrations WHERE event_id = ? AND attendee_id = ? AND status = 'confirmed' LIMIT 1",
      [eventId, attendee.id]
    );

    if (existingRegistrations.length > 0) {
      throw new AppError(
        `You have already registered for this event with booking reference: ${existingRegistrations[0].booking_reference}`,
        409
      );
    }

    // 6. Check capacity derived from current confirmed registrations
    const [countRows] = await conn.execute(
      "SELECT COUNT(*) as confirmed_count FROM registrations WHERE event_id = ? AND status = 'confirmed'",
      [eventId]
    );

    const confirmedCount = Number(countRows[0]?.confirmed_count || 0);
    const capacity = Number(event.capacity || 0);

    if (confirmedCount >= capacity) {
      throw new AppError('This event has reached full capacity. No further spots are available.', 400);
    }

    // 7. Generate unique booking reference (e.g. ES-2026-XXXX)
    let bookingRef = '';
    let isUnique = false;
    for (let attempts = 0; attempts < 5; attempts++) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      bookingRef = `ES-2026-${randomSuffix}`;
      const [duplicate] = await conn.execute(
        'SELECT id FROM registrations WHERE booking_reference = ? LIMIT 1',
        [bookingRef]
      );
      if (duplicate.length === 0) {
        isUnique = true;
        break;
      }
    }

    if (!isUnique) {
      bookingRef = `ES-2026-${Date.now().toString().slice(-4)}`;
    }

    const registrationId = `bkg-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 8. Insert confirmed registration
    await conn.execute(
      `INSERT INTO registrations (
        id, event_id, attendee_id, booking_reference, ticket_type, price, status, registered_at
      ) VALUES (?, ?, ?, ?, ?, 0.00, 'confirmed', NOW())`,
      [registrationId, eventId, attendee.id, bookingRef, ticketType]
    );

    // 9. Create notification for organizer
    const notifId = `notif-${Date.now()}`;
    await conn.execute(
      `INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
       VALUES (?, ?, ?, ?, 'registration', ?, 0, NOW())`,
      [
        notifId,
        event.organizer_id,
        'New Attendee Registered',
        `${attendee.name} registered for ${event.title}.`,
        `/organizer/events/${event.id}/attendees`
      ]
    );

    return {
      id: registrationId,
      bookingRef,
      bookingReference: bookingRef,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: new Date(event.start_datetime).toISOString().split('T')[0],
      venue: `${event.venue_name}, ${event.city}`,
      attendeeName: attendee.name,
      attendeeEmail: attendee.email,
      ticketType,
      status: 'confirmed',
      registeredAt: new Date().toISOString()
    };
  });
};

export const getAttendeeBookings = async (attendeeId) => {
  const sql = `
    SELECT
      r.id,
      r.booking_reference,
      r.ticket_type,
      r.price,
      r.status,
      r.registered_at,
      r.cancelled_at,
      e.id as event_id,
      e.title as event_title,
      e.slug as event_slug,
      e.start_datetime,
      e.end_datetime,
      e.venue_name,
      e.city,
      e.cover_image_url
    FROM registrations r
    JOIN events e ON r.event_id = e.id
    WHERE r.attendee_id = ?
    ORDER BY r.registered_at DESC
  `;

  const rows = await query(sql, [attendeeId]);

  return rows.map(r => ({
    id: r.id,
    bookingRef: r.booking_reference,
    bookingReference: r.booking_reference,
    eventId: r.event_id,
    eventTitle: r.event_title,
    eventSlug: r.event_slug,
    eventDate: r.start_datetime ? new Date(r.start_datetime).toISOString().split('T')[0] : '',
    eventTime: r.start_datetime ? `${new Date(r.start_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(r.end_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : '',
    venue: `${r.venue_name}, ${r.city}`,
    coverImage: r.cover_image_url,
    ticketType: r.ticket_type,
    price: Number(r.price),
    status: r.status,
    registeredAt: r.registered_at,
    bookingDate: r.registered_at,
    cancelledAt: r.cancelled_at
  }));
};

export const cancelBooking = async (registrationId, currentUser) => {
  const rows = await query(
    'SELECT r.*, e.organizer_id, e.title as event_title FROM registrations r JOIN events e ON r.event_id = e.id WHERE r.id = ? LIMIT 1',
    [registrationId]
  );

  if (rows.length === 0) {
    throw new AppError('Booking not found.', 404);
  }

  const booking = rows[0];

  // Prevent attendees from cancelling someone else's booking
  if (booking.attendee_id !== currentUser.id && currentUser.role !== 'admin') {
    throw new AppError('Forbidden: You can only cancel your own bookings.', 403);
  }

  if (booking.status === 'cancelled') {
    throw new AppError('This booking has already been cancelled.', 400);
  }

  await query(
    "UPDATE registrations SET status = 'cancelled', cancelled_at = NOW() WHERE id = ?",
    [registrationId]
  );

  return {
    id: registrationId,
    bookingRef: booking.booking_reference,
    status: 'cancelled',
    cancelledAt: new Date().toISOString()
  };
};

export const getEventAttendees = async (eventId, currentUser) => {
  // Check permission: Must be owner organizer or admin
  const eventRows = await query('SELECT organizer_id, title, slug FROM events WHERE id = ? LIMIT 1', [eventId]);
  if (eventRows.length === 0) {
    throw new AppError('Event not found.', 404);
  }

  const event = eventRows[0];
  if (event.organizer_id !== currentUser.id && currentUser.role !== 'admin') {
    throw new AppError('Forbidden: You can only view attendees for events that you own.', 403);
  }

  const sql = `
    SELECT
      r.id,
      r.booking_reference,
      r.ticket_type,
      r.price,
      r.status,
      r.registered_at,
      r.cancelled_at,
      u.id as attendee_id,
      u.name as attendee_name,
      u.email as attendee_email,
      u.avatar as attendee_avatar
    FROM registrations r
    JOIN users u ON r.attendee_id = u.id
    WHERE r.event_id = ?
    ORDER BY r.registered_at DESC
  `;

  const rows = await query(sql, [eventId]);

  return rows.map(r => ({
    id: r.id,
    bookingRef: r.booking_reference,
    bookingReference: r.booking_reference,
    eventId,
    attendeeId: r.attendee_id,
    attendeeName: r.attendee_name,
    attendeeEmail: r.attendee_email,
    attendeeAvatar: r.attendee_avatar,
    ticketType: r.ticket_type,
    price: Number(r.price),
    status: r.status,
    registeredAt: r.registered_at,
    bookingDate: r.registered_at
  }));
};
