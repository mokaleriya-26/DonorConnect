import { AppError } from './errorHandler.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required before authorization check.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden: required role (${allowedRoles.join(' or ')}) but current account has role '${req.user.role}'.`,
          403
        )
      );
    }

    next();
  };
};
