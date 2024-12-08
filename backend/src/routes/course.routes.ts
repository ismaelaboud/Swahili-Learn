import express from 'express';
import { authenticateToken, validateInstructor } from '../middleware/auth';
import { prisma } from '../db';
import { z } from 'zod';
import { logger } from '../utils/logger';

const router = express.Router();

// Get all courses (public)
router.get('/', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        published: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        instructor: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    res.json(courses);
  } catch (error) {
    logger.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Create course (instructor only)
router.post('/', authenticateToken, validateInstructor, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const courseSchema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      category: z.enum(['WEB_DEV', 'MOBILE_DEV', 'DEVOPS'])
    });

    const courseData = courseSchema.parse(req.body);

    const course = await prisma.course.create({
      data: {
        ...courseData,
        instructorId: req.user.id
      }
    });

    res.status(201).json(course);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid course data', details: error.errors });
    } else {
      logger.error('Error creating course:', error);
      res.status(500).json({ error: 'Failed to create course' });
    }
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        sections: {
          include: {
            lessons: true
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    logger.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Update course (instructor only)
router.put('/:id', authenticateToken, validateInstructor, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const { id } = req.params;
    const courseData = req.body;

    // Check if course exists and belongs to instructor
    const existingCourse = await prisma.course.findUnique({
      where: { id }
    });

    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (existingCourse.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this course' });
    }

    const course = await prisma.course.update({
      where: { id },
      data: courseData
    });

    res.json(course);
  } catch (error) {
    logger.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete course (instructor only)
router.delete('/:id', authenticateToken, validateInstructor, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const { id } = req.params;

    // Check if course exists and belongs to instructor
    const existingCourse = await prisma.course.findUnique({
      where: { id }
    });

    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (existingCourse.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this course' });
    }

    await prisma.course.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// Enroll in course
router.post('/:id/enroll', authenticateToken, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const { id: courseId } = req.params;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: req.user.id,
        courseId,
        status: 'IN_PROGRESS',
        progress: 0
      }
    });

    res.status(201).json(enrollment);
  } catch (error) {
    logger.error('Error enrolling in course:', error);
    res.status(500).json({ error: 'Failed to enroll in course' });
  }
});

export default router;
