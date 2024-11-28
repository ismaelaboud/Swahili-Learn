import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import sectionRoutes from './routes/section.routes';
import lessonRoutes from './routes/lesson.routes';
import { errorHandler } from './middleware/error';
import { apiLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS middleware
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Rate limiting
app.use(apiLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/lessons', lessonRoutes);

// Error handling
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const startServer = async (retryCount = 0) => {
  try {
    await prisma.$connect();
    logger.info('Connected to database');
    
    const server = app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });

    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE' && retryCount < 3) {
        logger.warn(`Port ${port} is in use, trying port ${port + 1}`);
        server.close();
        process.env.PORT = String(Number(port) + 1);
        startServer(retryCount + 1);
      } else {
        logger.error('Server error:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});
