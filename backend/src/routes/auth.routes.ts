import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import logger from '../utils/logger';
import { generateAccessToken, generateRefreshToken } from './auth/token.routes';
import { prisma } from '../db';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['STUDENT', 'INSTRUCTOR']).default('STUDENT'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

// Debug middleware for registration route
router.use('/register', (req, res, next) => {
  logger.info('Registration request received:', {
    method: req.method,
    headers: req.headers,
    body: req.body,
    rawBody: req.body ? JSON.stringify(req.body) : undefined
  });
  next();
});

// Register route
router.post('/register', async (req, res) => {
  try {
    logger.info('Processing registration request');

    // Log raw request body
    logger.info('Raw request body:', {
      body: req.body,
      contentType: req.headers['content-type']
    });

    if (!req.body || typeof req.body !== 'object') {
      logger.error('Invalid request body format');
      return res.status(400).json({
        message: 'Invalid request format',
        details: 'Request body must be a JSON object'
      });
    }

    const validatedData = registerSchema.parse(req.body);
    const { email, password, name, role } = validatedData;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true } // Only select id to minimize data transfer
    });

    if (existingUser) {
      logger.warn('Registration failed: User already exists', { email });
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    logger.info('User registered successfully:', { userId: user.id, email: user.email });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token: accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error('Error in user registration:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ 
      message: 'Registration failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Revoke any existing refresh tokens (optional)
    await prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    // Generate new tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error('Error in user login:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ 
      message: 'Login failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Import and use password routes
import passwordRoutes from './auth/password.routes';
import tokenRoutes from './auth/token.routes';

router.use('/password', passwordRoutes);
router.use('/token', tokenRoutes);

export default router;
