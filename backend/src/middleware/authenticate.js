import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../config/database.js';
import { AppError } from './errorHandler.js';

export const extractToken = (req) => {
  // 1. Check HTTP-only cookie first
  if (req.cookies && req.cookies[env.COOKIE_NAME]) {
    return req.cookies[env.COOKIE_NAME];
  }

  // 2. Fallback to Authorization: Bearer header
  if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      return parts[1];
    }
  }

  return null;
};

export const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new AppError('Authentication required. Please log in to continue.', 401);
    }

    let payload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        throw new AppError('Session expired. Please log in again.', 401);
      }
      throw new AppError('Invalid authentication token.', 401);
    }

    const rows = await query(
      `SELECT id, name, email, role, organization, avatar, city, bio, account_status, created_at
       FROM users WHERE id = ? LIMIT 1`,
      [payload.id]
    );

    if (!rows || rows.length === 0) {
      throw new AppError('User account no longer exists.', 401);
    }

    const user = rows[0];

    if (user.account_status === 'suspended') {
      throw new AppError('This account has been suspended by an administrator.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return next();
    }

    let payload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET);
    } catch {
      return next();
    }

    const rows = await query(
      `SELECT id, name, email, role, organization, avatar, city, bio, account_status, created_at
       FROM users WHERE id = ? LIMIT 1`,
      [payload.id]
    );

    if (rows && rows.length > 0 && rows[0].account_status !== 'suspended') {
      req.user = rows[0];
    }

    next();
  } catch {
    next();
  }
};
