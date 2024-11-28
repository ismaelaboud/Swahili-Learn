import { Router } from 'express';
import { PrismaClient, LessonType } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { validateInstructor } from '../middleware/roles';

const router = Router();
const prisma = new PrismaClient();

// Create a new lesson
router.post('/:sectionId', authenticateToken, validateInstructor, async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { title, content, type = LessonType.TEXT } = req.body;

    // Verify section exists and user owns the course
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { 
        course: { 
          select: { instructorId: true } 
        }
      },
    });

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    if (section.course.instructorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only add lessons to your own courses' });
    }

    // Get the highest order number in the section
    const lastLesson = await prisma.lesson.findFirst({
      where: { sectionId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newOrder = (lastLesson?.order ?? -1) + 1;

    // Create the new lesson
    const lesson = await prisma.lesson.create({
      data: {
        title,
        content,
        type,
        order: newOrder,
        sectionId,
      },
    });

    res.status(201).json(lesson);
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ 
      message: 'Failed to create lesson', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get a specific lesson
router.get('/:lessonId', authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          select: {
            title: true,
            course: {
              select: {
                id: true,
                title: true,
                instructorId: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ 
      message: 'Failed to fetch lesson', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Update a lesson
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, order } = req.body;

    // Validate input
    if (!title && content === undefined && !type && order === undefined) {
      return res.status(400).json({ error: 'No fields to update provided' });
    }

    // Get the lesson to check ownership
    const existingLesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        section: {
          include: {
            course: true
          }
        }
      }
    });

    if (!existingLesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Check if user is instructor of the course
    if (existingLesson.section.course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this lesson' });
    }

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) {
      // Handle both string and object content
      updateData.content = typeof content === 'string' ? { text: content } : content;
    }
    if (type !== undefined) updateData.type = type;
    if (order !== undefined) updateData.order = order;

    // Update the lesson
    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: updateData,
    });

    res.json(updatedLesson);
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// Delete a lesson
router.delete('/:lessonId', authenticateToken, validateInstructor, async (req, res) => {
  try {
    const { lessonId } = req.params;

    // Verify lesson exists and user owns the course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: {
              select: { instructorId: true },
            },
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    if (lesson.section.course.instructorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete lessons in your own courses' });
    }

    // Delete the lesson
    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    // Reorder remaining lessons
    const remainingLessons = await prisma.lesson.findMany({
      where: { sectionId: lesson.sectionId },
      orderBy: { order: 'asc' },
    });

    await Promise.all(
      remainingLessons.map((lesson, index) =>
        prisma.lesson.update({
          where: { id: lesson.id },
          data: { order: index },
        })
      )
    );

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ 
      message: 'Failed to delete lesson', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Reorder lessons within a section
router.patch('/:sectionId/reorder', authenticateToken, validateInstructor, async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { lessonIds } = req.body;

    // Verify section exists and user owns the course
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        course: {
          select: { instructorId: true },
        },
      },
    });

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    if (section.course.instructorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only reorder lessons in your own courses' });
    }

    // Update order of lessons
    await Promise.all(
      lessonIds.map((lessonId: string, index: number) =>
        prisma.lesson.update({
          where: { id: lessonId },
          data: { order: index },
        })
      )
    );

    const updatedLessons = await prisma.lesson.findMany({
      where: { sectionId },
      orderBy: { order: 'asc' },
    });

    res.json(updatedLessons);
  } catch (error) {
    console.error('Error reordering lessons:', error);
    res.status(500).json({ 
      message: 'Failed to reorder lessons', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;
