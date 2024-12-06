import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import logger from '../utils/logger';
import { generateAccessToken, generateRefreshToken } from './auth/token.routes';

const router = Router();
const prisma = new PrismaClient();

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
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error('Registration error:', error);
    
    // Handle Prisma-specific errors
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        message: 'A user with this email already exists' 
      });
    }
    
    res.status(500).json({ 
      message: 'Something went wrong during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    logger.error('Login error:', error);
    res.status(500).json({ 
      message: 'Something went wrong during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Import and use password routes
import passwordRoutes from './auth/password.routes';
import tokenRoutes from './auth/token.routes';

router.use('/password', passwordRoutes);
router.use('/token', tokenRoutes);

export default router;
