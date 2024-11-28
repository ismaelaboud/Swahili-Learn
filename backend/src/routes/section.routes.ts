import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { validateInstructor } from '../middleware/roles';

const router = Router();
const prisma = new PrismaClient();

// Create a new section
router.post('/:courseId', authenticateToken, validateInstructor, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only add sections to your own courses' });
    }

    // Get the highest order number in the course
    const lastSection = await prisma.section.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newOrder = (lastSection?.order ?? -1) + 1;

    // Create the new section
    const section = await prisma.section.create({
      data: {
        title,
        description,
        order: newOrder,
        courseId,
      },
      include: {
        lessons: true,
      },
    });

    res.status(201).json(section);
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ 
      message: 'Failed to create section', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get all sections for a course
router.get('/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    const sections = await prisma.section.findMany({
      where: { courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ 
      message: 'Failed to fetch sections', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Update a section
router.patch('/:sectionId', authenticateToken, validateInstructor, async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { title, description } = req.body;

    // Verify section exists and user owns the course
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { course: { select: { instructorId: true } } },
    });

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    if (section.course.instructorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only update sections in your own courses' });
    }

    const updatedSection = await prisma.section.update({
      where: { id: sectionId },
      data: { title, description },
      include: { lessons: true },
    });

    res.json(updatedSection);
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ 
      message: 'Failed to update section', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Delete a section
router.delete('/:sectionId', authenticateToken, validateInstructor, async (req, res) => {
  try {
    const { sectionId } = req.params;

    // Verify section exists and user owns the course
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { course: { select: { instructorId: true } } },
    });

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    if (section.course.instructorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete sections in your own courses' });
    }

    // Delete the section (lessons will be deleted automatically due to onDelete: Cascade)
    await prisma.section.delete({
      where: { id: sectionId },
    });

    // Reorder remaining sections
    const remainingSections = await prisma.section.findMany({
      where: { courseId: section.courseId },
      orderBy: { order: 'asc' },
    });

    // Update order of remaining sections
    await Promise.all(
      remainingSections.map((section, index) =>
        prisma.section.update({
          where: { id: section.id },
          data: { order: index },
        })
      )
    );

    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ 
      message: 'Failed to delete section', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Reorder sections
router.patch('/:courseId/reorder', authenticateToken, validateInstructor, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { sectionIds } = req.body;

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only reorder sections in your own courses' });
    }

    // Update order of sections
    await Promise.all(
      sectionIds.map((sectionId: string, index: number) =>
        prisma.section.update({
          where: { id: sectionId },
          data: { order: index },
        })
      )
    );

    const updatedSections = await prisma.section.findMany({
      where: { courseId },
      include: { lessons: true },
      orderBy: { order: 'asc' },
    });

    res.json(updatedSections);
  } catch (error) {
    console.error('Error reordering sections:', error);
    res.status(500).json({ 
      message: 'Failed to reorder sections', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;
