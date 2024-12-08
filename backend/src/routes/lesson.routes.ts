import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateInstructor } from '../middleware/roles';
import logger from '../utils/logger';
import { prisma } from '../db';

const router = Router();

// Create a new lesson
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const { title, content, sectionId, type = 'TEXT' } = req.body;

    const lesson = await prisma.lesson.create({
      data: {
        title,
        content,
        type,
        sectionId,
      },
    });

    res.json(lesson);
  } catch (error) {
    logger.error('Error creating lesson:', error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// Get all lessons for a section
router.get('/section/:sectionId', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const { sectionId } = req.params;

    const lessons = await prisma.lesson.findMany({
      where: {
        sectionId,
      },
      orderBy: {
        order: 'asc',
      },
    });

    res.json(lessons);
  } catch (error) {
    logger.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Update a lesson
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const { id } = req.params;
    const { title, content, type } = req.body;

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        title,
        content,
        type,
      },
    });

    res.json(lesson);
  } catch (error) {
    logger.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// Delete a lesson
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const { id } = req.params;

    await prisma.lesson.delete({
      where: { id },
    });

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    logger.error('Error deleting lesson:', error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

export default router;
