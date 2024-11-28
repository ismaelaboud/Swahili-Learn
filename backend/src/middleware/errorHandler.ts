import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error(`Error: ${err.message}`);
  logger.error(err.stack || 'No stack trace available');

  // Handle known errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          status: 'error',
          message: 'A unique constraint violation occurred.',
        });
      case 'P2025':
        return res.status(404).json({
          status: 'error',
          message: 'Record not found.',
        });
      default:
        return res.status(400).json({
          status: 'error',
          message: 'Database operation failed.',
        });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid data provided.',
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred.',
  });
};
