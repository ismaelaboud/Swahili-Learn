import { Request, Response, NextFunction } from 'express';

export const validateInstructor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Validating instructor role for user:', req.user);
    
    if (!req.user) {
      console.log('No user found in request');
      return res.status(403).json({ message: 'User not found in request' });
    }

    if (req.user.role !== 'INSTRUCTOR') {
      console.log('User role is not INSTRUCTOR:', req.user.role);
      return res.status(403).json({ message: 'Access denied. Instructor role required.' });
    }

    console.log('User validated as instructor');
    next();
  } catch (error) {
    console.error('Role validation error:', error);
    res.status(500).json({ message: 'Role validation failed', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
