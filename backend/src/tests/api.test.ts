import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001/api';
let authToken: string;

const testUser = {
  email: 'test@example.com',
  password: 'Test123!',
  name: 'Test User',
  role: 'INSTRUCTOR'
};

const testCourse = {
  title: 'Test Course',
  description: 'This is a test course',
  category: 'WEB_DEV',
  content: {
    sections: [
      {
        title: 'Introduction',
        content: 'Welcome to the test course'
      }
    ]
  }
};

async function cleanup() {
  // Clean up test data
  await prisma.enrollment.deleteMany({
    where: {
      user: {
        email: testUser.email
      }
    }
  });
  
  await prisma.course.deleteMany({
    where: {
      instructor: {
        email: testUser.email
      }
    }
  });
  
  await prisma.user.deleteMany({
    where: {
      email: testUser.email
    }
  });
}

async function runTests() {
  try {
    // Clean up before tests
    await cleanup();

    // Test 1: Register User
    console.log('\n🧪 Testing User Registration...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
    console.log('✅ User Registration successful');

    // Test 2: Login
    console.log('\n🧪 Testing Login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    authToken = loginResponse.data.token;
    console.log('✅ Login successful');

    // Test 3: Create Course
    console.log('\n🧪 Testing Course Creation...');
    const courseResponse = await axios.post(
      `${API_URL}/courses`,
      testCourse,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    const courseId = courseResponse.data.id;
    console.log('✅ Course Creation successful');

    // Test 4: Get Courses
    console.log('\n🧪 Testing Course Retrieval...');
    const coursesResponse = await axios.get(
      `${API_URL}/courses`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✅ Course Retrieval successful');
    console.log(`Found ${coursesResponse.data.length} courses`);

    // Test 5: Get Single Course
    console.log('\n🧪 Testing Single Course Retrieval...');
    const singleCourseResponse = await axios.get(
      `${API_URL}/courses/${courseId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✅ Single Course Retrieval successful');

    // Clean up after tests
    await cleanup();

    console.log('\n✨ All tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    // Clean up even if tests fail
    await cleanup();
    process.exit(1);
  }
}

// Run the tests
console.log('🚀 Starting API tests...');
runTests();
