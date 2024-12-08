import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { validateInstructor } from '../middleware/roles';
import logger from '../utils/logger'; // Assuming you have a logger module

const router = Router();
const prisma = new PrismaClient();

// Create a new course (Instructor only)
router.post('/', authenticateToken, validateInstructor, async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    const instructorId = req.user.id;

    logger.info('Creating course:', { title, category, instructorId });
    console.log('Request body:', req.body);
    console.log('User:', req.user);

    if (!title?.trim() || !description?.trim() || !category) {
      logger.warn('Missing required fields:', { title, description, category });
      return res.status(400).json({ 
        error: 'Title, description, and category are required' 
      });
    }

    // Validate category
    const validCategories = ['WEB_DEV', 'MOBILE_DEV', 'DEVOPS'];
    if (!validCategories.includes(category)) {
      logger.warn('Invalid category:', category);
      return res.status(400).json({ 
        error: 'Invalid category. Must be one of: ' + validCategories.join(', ') 
      });
    }

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category,
        instructorId,
        published: false,
        content: {}, // Add empty JSON content
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logger.info('Course created successfully:', { courseId: course.id });
    res.status(201).json(course);
  } catch (error) {
    logger.error('Error creating course:', error);
    next(error); // Pass error to error handling middleware
  }
});

// Get all published courses
router.get('/published', authenticateToken, async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        published: true,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(courses);
  } catch (error) {
    logger.error('Error fetching published courses:', error);
    res.status(500).json({ message: 'Failed to fetch courses', error });
  }
});

// Get instructor's courses
router.get('/instructor', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    const userId = req.user.id;

    const courses = await prisma.course.findMany({
      where: {
        published: true,
        instructorId: req.user?.id
      },
      select: {
        id: true,
        title: true,
        description: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        instructor: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(courses);
  } catch (error) {
    logger.error('Error fetching instructor courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get public courses (no auth required)
router.get('/public', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        published: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        published: true,
        createdAt: true,
        _count: {
          select: {
            sections: true,
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(courses);
  } catch (error) {
    logger.error('Error fetching public courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get course details
router.get('/:courseId', async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    logger.info('Fetching course details:', { courseId, userId });

    const course = await prisma.course.findUnique({
      where: { 
        id: courseId,
        published: true
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        enrollments: userId ? {
          where: { userId },
          select: { id: true, status: true, progress: true }
        } : false,
      },
    });

    if (!course) {
      logger.warn('Course not found:', courseId);
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is enrolled or if course is published
    const isEnrolled = course.enrollments && course.enrollments.length > 0;
    const isInstructor = userId === course.instructorId;
    const canAccessContent = isEnrolled || isInstructor || course.published;

    const courseData = {
      ...course,
      isEnrolled,
      isInstructor,
      canAccessContent,
      enrollments: undefined, // Remove enrollments from response
    };

    logger.info('Course details fetched successfully:', { courseId });
    res.json(courseData);
  } catch (error) {
    logger.error('Error fetching course details:', error);
    next(error);
  }
});

// Enroll in a course
router.post('/:courseId/enroll', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { 
        id: courseId,
        published: true
      },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found or not published' });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        courseId,
        userId,
      },
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: req.user?.id!,
        courseId: courseId,
        status: 'IN_PROGRESS',
        progress: 0
      }
    });

    res.json(enrollment);
  } catch (error) {
    logger.error('Error enrolling in course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle course publish status (Instructor only)
router.patch('/:courseId/publish', authenticateToken, validateInstructor, async (req, res) => {
  try {
    const { courseId } = req.params;
    logger.info('Toggling publish status for course:', courseId);

    // First, verify that the instructor owns this course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        instructorId: true,
        published: true,
      },
    });

    if (!course) {
      logger.info('Course not found:', courseId);
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructorId !== req.user.id) {
      logger.info('Unauthorized: Instructor does not own this course');
      return res.status(403).json({ message: 'You can only publish/unpublish your own courses' });
    }

    // Toggle the published status
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        published: !course.published,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logger.info('Course publish status updated:', updatedCourse);
    res.json(updatedCourse);
  } catch (error) {
    logger.error('Error toggling course publish status:', error);
    res.status(500).json({ 
      message: 'Failed to update course publish status', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
