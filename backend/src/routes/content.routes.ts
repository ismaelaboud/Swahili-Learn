import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { validateInstructor } from '../middleware/roles';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Content validation schemas
const ContentSchema = z.object({
  type: z.enum(['LECTURE', 'QUIZ', 'EXERCISE', 'PROJECT']),
  title: z.string().min(1),
  content: z.string(),
  learningObjectives: z.array(z.string()).optional(),
  keyPoints: z.array(z.string()).optional(),
  codeExamples: z.array(z.string()).optional(),
});

const QuizSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.number(),
    explanation: z.string().optional(),
  })),
});

const ExerciseSchema = z.object({
  instructions: z.array(z.string()),
  starterCode: z.string().optional(),
  solution: z.string().optional(),
  hints: z.array(z.string()).optional(),
});

// Save content for a lesson
router.post('/lessons/:lessonId/content', 
  authenticateToken,
  validateInstructor,
  async (req, res) => {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    try {
      const { lessonId } = req.params;
      const contentData = req.body;

      // Validate content based on type
      const baseValidation = ContentSchema.parse(contentData);
      
      if (contentData.type === 'QUIZ') {
        QuizSchema.parse(contentData);
      } else if (contentData.type === 'EXERCISE') {
        ExerciseSchema.parse(contentData);
      }

      // Update lesson with content
      const updatedLesson = await prisma.lesson.update({
        where: { id: lessonId },
        data: {
          type: contentData.type,
          content: contentData,
          updatedAt: new Date(),
        },
        include: {
          section: {
            include: {
              course: true,
            },
          },
        },
      });

      // Verify instructor owns the course
      if (updatedLesson.section.course.instructorId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to modify this lesson' });
      }

      res.json(updatedLesson);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid content format', details: error.errors });
      } else {
        console.error('Error saving content:', error);
        res.status(500).json({ error: 'Failed to save content' });
      }
    }
});

// Get content for a lesson
router.get('/lessons/:lessonId/content',
  authenticateToken,
  async (req, res) => {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    try {
      const { lessonId } = req.params;

      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          section: {
            include: {
              course: true,
            },
          },
        },
      });

      if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
      }

      // Check if user has access to this lesson
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: req.user.id,
          courseId: lesson.section.course.id,
        },
      });

      if (!enrollment && lesson.section.course.instructorId !== req.user.id) {
        return res.status(403).json({ error: 'Not enrolled in this course' });
      }

      res.json(lesson);
    } catch (error) {
      console.error('Error retrieving content:', error);
      res.status(500).json({ error: 'Failed to retrieve content' });
    }
});

// Update lesson progress
router.post('/lessons/:lessonId/progress',
  authenticateToken,
  async (req, res) => {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    try {
      const { lessonId } = req.params;
      const { completed } = req.body;

      const progress = await prisma.progress.upsert({
        where: {
          userId_lessonId: {
            userId: req.user.id,
            lessonId,
          },
        },
        update: {
          completed,
          updatedAt: new Date(),
        },
        create: {
          userId: req.user.id,
          lessonId,
          completed,
        },
      });

      // Update course enrollment progress
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          section: {
            include: {
              course: true,
            },
          },
        },
      });

      if (lesson) {
        const totalLessons = await prisma.lesson.count({
          where: {
            section: {
              courseId: lesson.section.course.id,
            },
          },
        });

        const completedLessons = await prisma.progress.count({
          where: {
            userId: req.user.id,
            completed: true,
            lesson: {
              section: {
                courseId: lesson.section.course.id,
              },
            },
          },
        });

        const courseProgress = (completedLessons / totalLessons) * 100;

        await prisma.enrollment.update({
          where: {
            userId_courseId: {
              userId: req.user.id,
              courseId: lesson.section.course.id,
            },
          },
          data: {
            progress: courseProgress,
            status: courseProgress === 100 ? 'COMPLETED' : 'IN_PROGRESS',
          },
        });
      }

      res.json(progress);
    } catch (error) {
      console.error('Error updating progress:', error);
      res.status(500).json({ error: 'Failed to update progress' });
    }
});

export default router;
