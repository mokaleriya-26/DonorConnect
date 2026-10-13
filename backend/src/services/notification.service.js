import { query } from '../config/database.js';

export const getUserNotifications = async (userId) => {
  const sql = `
    SELECT id, user_id as userId, title, message, type, link, is_read as \`read\`, created_at as createdAt
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;
  const rows = await query(sql, [userId]);
  return rows.map(r => ({
    ...r,
    read: Boolean(r.read),
    time: new Date(r.createdAt).toLocaleDateString()
  }));
};

export const markNotificationAsRead = async (id, userId) => {
  await query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
  const rows = await query('SELECT id, user_id as userId, title, message, type, link, is_read as `read`, created_at as createdAt FROM notifications WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

export const markAllNotificationsAsRead = async (userId) => {
  await query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
  return { success: true };
};
