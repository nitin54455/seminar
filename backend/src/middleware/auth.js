import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes - verifies JWT and attaches user to req
 */
export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-in-production');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401);
      return next(new Error('User not found'));
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    next(new Error('Not authorized, token failed'));
  }
};

/**
 * Role-based authorization - restrict access by role(s)
 * Usage: authorize('admin'), authorize('admin', 'doctor')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized'));
    }
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`Role '${req.user.role}' is not authorized for this action`));
    }
    next();
  };
};
