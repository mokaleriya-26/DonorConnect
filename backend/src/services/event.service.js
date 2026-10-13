import { query, withTransaction } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Format event database record for API response
 */
export const formatEvent = (row) => {
  if (!row) return null;
  const registeredCount = Number(row.registered_count || 0);
  const capacity = Number(row.capacity || 0);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary || '',
    description: row.description || '',
    categoryId: row.category_id,
    categoryName: row.category_name || '',
    categorySlug: row.category_slug || '',
    badgeText: row.price == 0 ? 'Free' : (row.badge_text || 'Paid'),
    organizerId: row.organizer_id,
    organizerName: row.organizer_name || 'EventSphere Organizer',
    organizerAvatar: row.organizer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    coverImage: row.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    coverImageUrl: row.cover_image_url,
    startDate: row.start_datetime ? new Date(row.start_datetime).toISOString().split('T')[0] : '',
    startTime: row.start_datetime ? new Date(row.start_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '',
    endDate: row.end_datetime ? new Date(row.end_datetime).toISOString().split('T')[0] : '',
    endTime: row.end_datetime ? new Date(row.end_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '',
    startDatetime: row.start_datetime,
    endDatetime: row.end_datetime,
    venue: row.venue_name,
    venueName: row.venue_name,
    address: row.address || '',
    city: row.city,
    type: row.event_type,
    eventType: row.event_type,
    capacity,
    registeredCount,
    remainingSpots: Math.max(0, capacity - registeredCount),
    priceType: row.price == 0 ? 'free' : 'paid',
    price: Number(row.price || 0),
    currency: row.currency || 'USD',
    status: row.status,
    featured: Boolean(row.featured),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

export const getPublicEvents = async ({
  search = '',
  category = '',
  city = '',
  eventType = '',
  priceType = 'all',
  dateFilter = 'upcoming',
  sort = 'upcoming',
  page = 1,
  limit = 20
} = {}) => {
  const params = [];
  let whereClauses = ["e.status = 'published'"];

  if (search && search.trim()) {
    const term = `%${search.trim().toLowerCase()}%`;
    whereClauses.push('(LOWER(e.title) LIKE ? OR LOWER(e.summary) LIKE ? OR LOWER(e.venue_name) LIKE ? OR LOWER(e.city) LIKE ?)');
    params.push(term, term, term, term);
  }

  if (category && category !== 'all') {
    whereClauses.push('(c.id = ? OR c.slug = ?)');
    params.push(category, category);
  }

  if (city && city !== 'all') {
    whereClauses.push('LOWER(e.city) = ?');
    params.push(city.toLowerCase().trim());
  }

  if (eventType && eventType !== 'all') {
    whereClauses.push('e.event_type = ?');
    params.push(eventType);
  }

  if (priceType === 'free') {
    whereClauses.push('e.price = 0');
  } else if (priceType === 'paid') {
    whereClauses.push('e.price > 0');
  }

  const nowSql = new Date().toISOString().slice(0, 19).replace('T', ' ');
  if (dateFilter === 'today') {
    whereClauses.push('DATE(e.start_datetime) = CURRENT_DATE()');
  } else if (dateFilter === 'upcoming') {
    whereClauses.push('e.end_datetime >= ?');
    params.push(nowSql);
  } else if (dateFilter === 'past') {
    whereClauses.push('e.end_datetime < ?');
    params.push(nowSql);
  }

  let orderBy = 'e.start_datetime ASC';
  if (sort === 'newest') {
    orderBy = 'e.created_at DESC';
  } else if (sort === 'popular') {
    orderBy = 'registered_count DESC, e.start_datetime ASC';
  }

  const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Get total count
  const countSql = `
    SELECT COUNT(*) as total
    FROM events e
    JOIN categories c ON e.category_id = c.id
    JOIN users u ON e.organizer_id = u.id
    ${whereString}
  `;
  const countRows = await query(countSql, params);
  const total = countRows[0]?.total || 0;

  // Get records with confirmed registration count
  const offset = (page - 1) * limit;
  const selectSql = `
    SELECT
      e.*,
      c.name as category_name,
      c.slug as category_slug,
      c.badge_text as category_badge,
      u.name as organizer_name,
      u.avatar as organizer_avatar,
      COALESCE((
        SELECT COUNT(*) FROM registrations r
        WHERE r.event_id = e.id AND r.status = 'confirmed'
      ), 0) as registered_count
    FROM events e
    JOIN categories c ON e.category_id = c.id
    JOIN users u ON e.organizer_id = u.id
    ${whereString}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const rows = await query(selectSql, [...params, limit, offset]);

  return {
    events: rows.map(formatEvent),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: Number(total),
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getEventById = async (idOrSlug, currentUser = null) => {
  const rows = await query(
    `SELECT
      e.*,
      c.name as category_name,
      c.slug as category_slug,
      c.badge_text as category_badge,
      u.name as organizer_name,
      u.avatar as organizer_avatar,
      COALESCE((
        SELECT COUNT(*) FROM registrations r
        WHERE r.event_id = e.id AND r.status = 'confirmed'
      ), 0) as registered_count
    FROM events e
    JOIN categories c ON e.category_id = c.id
    JOIN users u ON e.organizer_id = u.id
    WHERE e.id = ? OR e.slug = ?
    LIMIT 1`,
    [idOrSlug, idOrSlug]
  );

  if (rows.length === 0) {
    throw new AppError('Event not found.', 404);
  }

  const event = rows[0];

  // Privacy & Access check: Draft events can only be viewed by owner or admin
  if (event.status !== 'published') {
    const isOwner = currentUser && (currentUser.id === event.organizer_id);
    const isAdmin = currentUser && (currentUser.role === 'admin');
    if (!isOwner && !isAdmin) {
      throw new AppError('This event is currently not publicly visible.', 404);
    }
  }

  return formatEvent(event);
};

export const createEvent = async (eventData, currentUser) => {
  const id = `evt-${Date.now()}`;
  const baseSlug = eventData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Verify category exists
  const catRows = await query('SELECT id FROM categories WHERE id = ? OR slug = ? LIMIT 1', [
    eventData.categoryId,
    eventData.categoryId
  ]);
  if (catRows.length === 0) {
    throw new AppError('Specified event category does not exist.', 400);
  }
  const categoryId = catRows[0].id;

  // Format dates
  const startDatetime = new Date(eventData.startDatetime).toISOString().slice(0, 19).replace('T', ' ');
  const endDatetime = new Date(eventData.endDatetime).toISOString().slice(0, 19).replace('T', ' ');

  await query(
    `INSERT INTO events (
      id, organizer_id, category_id, title, slug, summary, description,
      cover_image_url, start_datetime, end_datetime, venue_name, address,
      city, event_type, capacity, price, currency, status, featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      currentUser.id,
      categoryId,
      eventData.title,
      slug,
      eventData.summary || '',
      eventData.description || '',
      eventData.coverImageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      startDatetime,
      endDatetime,
      eventData.venueName,
      eventData.address || '',
      eventData.city,
      eventData.eventType || 'in-person',
      eventData.capacity,
      eventData.price || 0,
      eventData.currency || 'USD',
      eventData.status || 'published',
      eventData.featured ? 1 : 0
    ]
  );

  return getEventById(id, currentUser);
};

export const updateEvent = async (eventId, updates, currentUser) => {
  const rows = await query('SELECT * FROM events WHERE id = ? LIMIT 1', [eventId]);
  if (rows.length === 0) {
    throw new AppError('Event not found.', 404);
  }

  const existing = rows[0];

  // Ownership check
  if (existing.organizer_id !== currentUser.id && currentUser.role !== 'admin') {
    throw new AppError('Forbidden: You can only edit events that you own.', 403);
  }

  // Capacity check: Cannot reduce below current confirmed registrations
  if (updates.capacity !== undefined) {
    const regRows = await query(
      "SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status = 'confirmed'",
      [eventId]
    );
    const confirmedCount = regRows[0]?.count || 0;
    if (updates.capacity < confirmedCount) {
      throw new AppError(
        `Capacity cannot be reduced to ${updates.capacity} because there are already ${confirmedCount} confirmed registrations.`,
        400
      );
    }
  }

  const fields = [];
  const params = [];

  if (updates.title) { fields.push('title = ?'); params.push(updates.title); }
  if (updates.summary !== undefined) { fields.push('summary = ?'); params.push(updates.summary); }
  if (updates.description !== undefined) { fields.push('description = ?'); params.push(updates.description); }
  if (updates.categoryId) {
    const catRows = await query('SELECT id FROM categories WHERE id = ? OR slug = ? LIMIT 1', [
      updates.categoryId,
      updates.categoryId
    ]);
    if (catRows.length === 0) throw new AppError('Category not found.', 400);
    fields.push('category_id = ?');
    params.push(catRows[0].id);
  }
  if (updates.coverImageUrl !== undefined) { fields.push('cover_image_url = ?'); params.push(updates.coverImageUrl); }
  if (updates.startDatetime) {
    fields.push('start_datetime = ?');
    params.push(new Date(updates.startDatetime).toISOString().slice(0, 19).replace('T', ' '));
  }
  if (updates.endDatetime) {
    fields.push('end_datetime = ?');
    params.push(new Date(updates.endDatetime).toISOString().slice(0, 19).replace('T', ' '));
  }
  if (updates.venueName) { fields.push('venue_name = ?'); params.push(updates.venueName); }
  if (updates.address !== undefined) { fields.push('address = ?'); params.push(updates.address); }
  if (updates.city) { fields.push('city = ?'); params.push(updates.city); }
  if (updates.eventType) { fields.push('event_type = ?'); params.push(updates.eventType); }
  if (updates.capacity !== undefined) { fields.push('capacity = ?'); params.push(updates.capacity); }
  if (updates.price !== undefined) { fields.push('price = ?'); params.push(updates.price); }
  if (updates.currency) { fields.push('currency = ?'); params.push(updates.currency); }
  if (updates.status) { fields.push('status = ?'); params.push(updates.status); }
  if (updates.featured !== undefined) { fields.push('featured = ?'); params.push(updates.featured ? 1 : 0); }

  if (fields.length > 0) {
    params.push(eventId);
    await query(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  return getEventById(eventId, currentUser);
};

export const updateEventStatus = async (eventId, status, currentUser) => {
  const rows = await query('SELECT * FROM events WHERE id = ? LIMIT 1', [eventId]);
  if (rows.length === 0) throw new AppError('Event not found.', 404);

  const existing = rows[0];
  if (existing.organizer_id !== currentUser.id && currentUser.role !== 'admin') {
    throw new AppError('Forbidden: You can only update the status of events you own.', 403);
  }

  await query('UPDATE events SET status = ? WHERE id = ?', [status, eventId]);
  return getEventById(eventId, currentUser);
};

export const deleteEvent = async (eventId, currentUser) => {
  const rows = await query('SELECT * FROM events WHERE id = ? LIMIT 1', [eventId]);
  if (rows.length === 0) throw new AppError('Event not found.', 404);

  const existing = rows[0];
  if (existing.organizer_id !== currentUser.id && currentUser.role !== 'admin') {
    throw new AppError('Forbidden: You can only delete events you own.', 403);
  }

  // Check if registrations exist
  const regRows = await query('SELECT COUNT(*) as count FROM registrations WHERE event_id = ?', [eventId]);
  if (regRows[0]?.count > 0) {
    throw new AppError(
      'Cannot delete event because booking history exists. You can set the event status to CANCELLED instead to preserve audit records.',
      400
    );
  }

  await query('DELETE FROM events WHERE id = ?', [eventId]);
  return { id: eventId, deleted: true };
};

export const getOrganizerEvents = async (organizerId) => {
  const sql = `
    SELECT
      e.*,
      c.name as category_name,
      c.slug as category_slug,
      u.name as organizer_name,
      u.avatar as organizer_avatar,
      COALESCE((
        SELECT COUNT(*) FROM registrations r
        WHERE r.event_id = e.id AND r.status = 'confirmed'
      ), 0) as registered_count
    FROM events e
    JOIN categories c ON e.category_id = c.id
    JOIN users u ON e.organizer_id = u.id
    WHERE e.organizer_id = ?
    ORDER BY e.created_at DESC
  `;
  const rows = await query(sql, [organizerId]);
  return rows.map(formatEvent);
};
