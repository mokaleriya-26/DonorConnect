import { registerUser, loginUser, getDemoAccounts } from '../services/auth.service.js';
import { env } from '../config/env.js';

const setAuthCookie = (res, token) => {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const register = async (req, res, next) => {
  try {
    const { user, token } = await registerUser(req.body);
    setAuthCookie(res, token);
    res.status(201).json({
      success: true,
      user,
      token,
      message: 'Account registered successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser(email, password);
    setAuthCookie(res, token);
    res.status(200).json({
      success: true,
      user,
      token,
      message: 'Login successful.'
    });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
};

export const getDemoAccountsController = async (req, res, next) => {
  try {
    const demoAccounts = await getDemoAccounts();
    res.status(200).json({
      success: true,
      demoAccounts
    });
  } catch (err) {
    next(err);
  }
};
