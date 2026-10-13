import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { sanitizeUser } from './auth.service.js';

export const updateUserProfile = async (userId, updates) => {
  const fields = [];
  const params = [];

  if (updates.name) { fields.push('name = ?'); params.push(updates.name); }
  if (updates.organization !== undefined) { fields.push('organization = ?'); params.push(updates.organization); }
  if (updates.avatar) { fields.push('avatar = ?'); params.push(updates.avatar); }
  if (updates.city !== undefined) { fields.push('city = ?'); params.push(updates.city); }
  if (updates.bio !== undefined) { fields.push('bio = ?'); params.push(updates.bio); }

  if (fields.length > 0) {
    params.push(userId);
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  const rows = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
  if (rows.length === 0) throw new AppError('User not found.', 404);
  return sanitizeUser(rows[0]);
};
