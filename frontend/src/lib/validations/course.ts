import { z } from 'zod';

export const courseSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  category: z.enum(['WEB_DEV', 'MOBILE_DEV', 'DEVOPS', 'DATA_SCIENCE', 'MACHINE_LEARNING', 'CLOUD_COMPUTING']),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  price: z.number()
    .min(0, 'Price cannot be negative')
    .max(999.99, 'Price cannot exceed 999.99'),
  isPublished: z.boolean().default(false),
  thumbnail: z.string().url().optional(),
  previewVideo: z.string().url().optional(),
});

export const sectionSchema = z.object({
  title: z.string()
    .min(3, 'Section title must be at least 3 characters')
    .max(100, 'Section title cannot exceed 100 characters'),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  order: z.number().int().min(0),
});

export const lessonSchema = z.object({
  title: z.string()
    .min(3, 'Lesson title must be at least 3 characters')
    .max(100, 'Lesson title cannot exceed 100 characters'),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  type: z.enum(['VIDEO', 'TEXT', 'QUIZ', 'EXERCISE', 'CODE']),
  order: z.number().int().min(0),
  isPublished: z.boolean().default(false),
  isFree: z.boolean().default(false),
  content: z.object({
    text: z.string().optional(),
    videoUrl: z.string().url().optional(),
    quizData: z.any().optional(), // Will be replaced with proper quiz schema
    exerciseData: z.any().optional(),
    codeData: z.any().optional(),
  }),
  duration: z.number().min(0).optional(), // in minutes
});

export type Course = z.infer<typeof courseSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type Lesson = z.infer<typeof lessonSchema>;

// Custom error messages for form validation
export const courseErrors = {
  title: {
    required: 'Title is required',
    min: 'Title must be at least 5 characters',
    max: 'Title cannot exceed 100 characters',
  },
  description: {
    required: 'Description is required',
    min: 'Description must be at least 20 characters',
    max: 'Description cannot exceed 1000 characters',
  },
  category: {
    required: 'Category is required',
    invalid: 'Please select a valid category',
  },
  level: {
    required: 'Level is required',
    invalid: 'Please select a valid level',
  },
  price: {
    required: 'Price is required',
    min: 'Price cannot be negative',
    max: 'Price cannot exceed 999.99',
    invalid: 'Please enter a valid price',
  },
} as const;
