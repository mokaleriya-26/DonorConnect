import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export const getAllCategories = async (onlyActive = false) => {
  const sql = `
    SELECT
      c.*,
      COUNT(e.id) as event_count
    FROM categories c
    LEFT JOIN events e ON c.id = e.category_id AND e.status = 'published'
    ${onlyActive ? 'WHERE c.is_active = 1' : ''}
    GROUP BY c.id
    ORDER BY c.name ASC
  `;
  const rows = await query(sql);
  return rows.map(r => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    shortDescription: r.description || '',
    description: r.description || '',
    iconName: r.icon_name || 'Sparkles',
    color: r.color || '#7540C4',
    badgeText: r.badge_text || r.name,
    coverImage: r.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    coverImageUrl: r.cover_image_url,
    active: Boolean(r.is_active),
    isActive: Boolean(r.is_active),
    eventCount: Number(r.event_count || 0)
  }));
};

export const getCategoryBySlug = async (slugOrId) => {
  const sql = `
    SELECT
      c.*,
      COUNT(e.id) as event_count
    FROM categories c
    LEFT JOIN events e ON c.id = e.category_id AND e.status = 'published'
    WHERE c.slug = ? OR c.id = ?
    GROUP BY c.id
    LIMIT 1
  `;
  const rows = await query(sql, [slugOrId, slugOrId]);
  if (rows.length === 0) {
    throw new AppError('Category not found.', 404);
  }

  const r = rows[0];
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    shortDescription: r.description || '',
    description: r.description || '',
    iconName: r.icon_name || 'Sparkles',
    color: r.color || '#7540C4',
    badgeText: r.badge_text || r.name,
    coverImage: r.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    coverImageUrl: r.cover_image_url,
    active: Boolean(r.is_active),
    isActive: Boolean(r.is_active),
    eventCount: Number(r.event_count || 0)
  };
};

export const createCategory = async (data) => {
  const existing = await query('SELECT id FROM categories WHERE slug = ? LIMIT 1', [data.slug]);
  if (existing.length > 0) {
    throw new AppError(`Category slug "${data.slug}" already exists. Slugs must be unique.`, 409);
  }

  const id = `cat-${Date.now()}`;
  await query(
    `INSERT INTO categories (id, name, slug, description, icon_name, color, badge_text, cover_image_url, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.name,
      data.slug,
      data.description || '',
      data.iconName || 'Sparkles',
      data.color || '#7540C4',
      data.badgeText || data.name,
      data.coverImageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1
    ]
  );

  return getCategoryBySlug(id);
};

export const updateCategory = async (id, data) => {
  const cat = await query('SELECT * FROM categories WHERE id = ? LIMIT 1', [id]);
  if (cat.length === 0) throw new AppError('Category not found.', 404);

  if (data.slug) {
    const dup = await query('SELECT id FROM categories WHERE slug = ? AND id != ? LIMIT 1', [data.slug, id]);
    if (dup.length > 0) throw new AppError(`Category slug "${data.slug}" is already in use.`, 409);
  }

  const fields = [];
  const params = [];
  if (data.name) { fields.push('name = ?'); params.push(data.name); }
  if (data.slug) { fields.push('slug = ?'); params.push(data.slug); }
  if (data.description !== undefined) { fields.push('description = ?'); params.push(data.description); }
  if (data.iconName) { fields.push('icon_name = ?'); params.push(data.iconName); }
  if (data.color) { fields.push('color = ?'); params.push(data.color); }
  if (data.badgeText) { fields.push('badge_text = ?'); params.push(data.badgeText); }
  if (data.coverImageUrl) { fields.push('cover_image_url = ?'); params.push(data.coverImageUrl); }
  if (data.isActive !== undefined) { fields.push('is_active = ?'); params.push(data.isActive ? 1 : 0); }

  if (fields.length > 0) {
    params.push(id);
    await query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  return getCategoryBySlug(id);
};

export const toggleCategoryActive = async (id) => {
  const cat = await query('SELECT is_active FROM categories WHERE id = ? LIMIT 1', [id]);
  if (cat.length === 0) throw new AppError('Category not found.', 404);

  const nextState = cat[0].is_active ? 0 : 1;
  await query('UPDATE categories SET is_active = ? WHERE id = ?', [nextState, id]);
  return getCategoryBySlug(id);
};

export const deleteCategory = async (id) => {
  // Check if events are assigned
  const eventRows = await query('SELECT COUNT(*) as count FROM events WHERE category_id = ?', [id]);
  if (eventRows[0]?.count > 0) {
    throw new AppError(
      'Cannot delete category: events are currently assigned to it. Please reassign or delete those events first, or deactivate the category instead.',
      400
    );
  }

  await query('DELETE FROM categories WHERE id = ?', [id]);
  return { id, deleted: true };
};
