import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'dev-secret-change-in-production', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

/**
 * @route   POST /api/auth/register
 * @desc    Register patient (or doctor/admin if needed - typically admin adds doctors)
 */
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array().map((e) => e.msg).join(', '));
    }
    const { name, email, password, role = 'patient' } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }
    const user = await User.create({ name, email, password, role: role === 'patient' ? 'patient' : role });
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user, returns JWT and user info
 */
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array().map((e) => e.msg).join(', '));
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user (protected)
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
