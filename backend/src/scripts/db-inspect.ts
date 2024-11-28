import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectDatabase() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      include: {
        enrollments: true,
        teachingCourses: true,
      },
    });
    console.log('\n📚 Users in the database:');
    console.log(JSON.stringify(users, null, 2));

    // Get all courses
    const courses = await prisma.course.findMany({
      include: {
        instructor: {
          select: {
            name: true,
            email: true,
          },
        },
        enrollments: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
    console.log('\n📚 Courses in the database:');
    console.log(JSON.stringify(courses, null, 2));

    // Get enrollment statistics
    const enrollmentStats = await prisma.enrollment.groupBy({
      by: ['status'],
      _count: true,
    });
    console.log('\n📊 Enrollment Statistics:');
    console.log(JSON.stringify(enrollmentStats, null, 2));

  } catch (error) {
    console.error('Error inspecting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

console.log('🔍 Inspecting database...');
inspectDatabase();
