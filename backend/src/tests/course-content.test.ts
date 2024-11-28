import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

describe('Course Content Management', () => {
  let authToken: string;
  let courseId: string;
  let sectionId: string;
  let lessonId: string;
  let instructorId: string;

  beforeAll(async () => {
    // Clean up database
    await prisma.progress.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.section.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();

    // Create test instructor
    const instructor = await prisma.user.create({
      data: {
        email: 'instructor@test.com',
        password: '$2a$10$test_hash',
        name: 'Test Instructor',
        role: 'INSTRUCTOR',
      },
    });
    instructorId = instructor.id;

    // Create auth token
    authToken = jwt.sign(
      { userId: instructor.id, role: instructor.role },
      process.env.JWT_SECRET || 'test_secret'
    );
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Course Management', () => {
    it('should create a new course', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Course',
          description: 'Test Description',
          category: 'WEB_DEVELOPMENT',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      courseId = response.body.id;
    });
  });

  describe('Section Management', () => {
    it('should create a new section', async () => {
      const response = await request(app)
        .post(`/api/sections/${courseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Introduction Section',
          order: 1,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      sectionId = response.body.id;
    });

    it('should list sections of a course', async () => {
      const response = await request(app)
        .get(`/api/sections/${courseId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
    });
  });

  describe('Lesson Management', () => {
    it('should create a new lesson', async () => {
      const response = await request(app)
        .post(`/api/lessons/${sectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'First Lesson',
          content: JSON.stringify({
            text: 'This is the lesson content',
            resources: ['resource1', 'resource2'],
          }),
          type: 'TEXT',
          order: 1,
          duration: 30,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      lessonId = response.body.id;
    });

    it('should get lesson details', async () => {
      const response = await request(app)
        .get(`/api/lessons/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', 'First Lesson');
      expect(response.body).toHaveProperty('content');
    });

    it('should update lesson progress', async () => {
      const response = await request(app)
        .post(`/api/lessons/${lessonId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completed: true,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('completed', true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid section creation', async () => {
      const response = await request(app)
        .post(`/api/sections/invalid-course-id`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Section',
          order: 1,
        });

      expect(response.status).toBe(404);
    });

    it('should handle unauthorized access', async () => {
      // Create a student token
      const studentToken = jwt.sign(
        { userId: 'fake-id', role: 'STUDENT' },
        process.env.JWT_SECRET || 'test_secret'
      );

      const response = await request(app)
        .post(`/api/sections/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Unauthorized Section',
          order: 1,
        });

      expect(response.status).toBe(403);
    });
  });
});
