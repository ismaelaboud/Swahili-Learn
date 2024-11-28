import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/errors';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  handler: (req, res) => {
    throw new AppError('Too many requests, please try again later.', 429);
  },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 failed login attempts per hour
  message: 'Too many login attempts, please try again later.',
  handler: (req, res) => {
    throw new AppError('Too many login attempts, please try again later.', 429);
  },
});
