import { getCookie } from './cookies';

const getApiUrl = async () => {
  // Try ports 3001, 3002, and 3003
  const ports = [3001, 3002, 3003];
  
  for (const port of ports) {
    try {
      const response = await fetch(`http://localhost:${port}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      if (response.ok) {
        return `http://localhost:${port}`;
      }
    } catch (error) {
      console.log(`Port ${port} not available`);
    }
  }
  
  // Default to 3001 if no ports respond
  return 'http://localhost:3001';
};

let API_URL: string | null = null;

const initializeApiUrl = async () => {
  if (!API_URL) {
    API_URL = await getApiUrl();
  }
  return API_URL;
};

interface FetchOptions extends RequestInit {
  token?: string;
  body?: any;
}

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const apiUrl = await initializeApiUrl();
  const token = options.token || getCookie('token');
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const defaultOptions: RequestInit = {
    credentials: 'include',
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  const fetchOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${apiUrl}${endpoint}`, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    fetchApi('/api/auth/login', { method: 'POST', body: credentials }),
  register: (userData: { email: string; password: string; name: string }) =>
    fetchApi('/api/auth/register', { method: 'POST', body: userData }),

  // Courses
  createCourse: (courseData: { title: string; description: string; category: string }) =>
    fetchApi('/api/courses', { method: 'POST', body: courseData }),
  getCourses: () => 
    fetchApi('/api/courses'),
  getCourse: (id: string) =>
    fetchApi(`/api/courses/${id}`),
  updateCourse: (id: string, courseData: any) =>
    fetchApi(`/api/courses/${id}`, { method: 'PATCH', body: courseData }),
  deleteCourse: (id: string) =>
    fetchApi(`/api/courses/${id}`, { method: 'DELETE' }),

  // Sections
  createSection: (courseId: string, sectionData: { title: string; description?: string }) =>
    fetchApi(`/api/sections`, { method: 'POST', body: { ...sectionData, courseId } }),
  getSections: (courseId: string) =>
    fetchApi(`/api/sections?courseId=${courseId}`),
  updateSection: (id: string, sectionData: any) =>
    fetchApi(`/api/sections/${id}`, { method: 'PATCH', body: sectionData }),
  deleteSection: (id: string) =>
    fetchApi(`/api/sections/${id}`, { method: 'DELETE' }),

  // Lessons
  createLesson: (sectionId: string, lessonData: any) =>
    fetchApi(`/api/lessons`, { method: 'POST', body: { ...lessonData, sectionId } }),
  getLesson: (id: string) =>
    fetchApi(`/api/lessons/${id}`),
  updateLesson: (id: string, lessonData: any) =>
    fetchApi(`/api/lessons/${id}`, { method: 'PATCH', body: lessonData }),
  deleteLesson: (id: string) =>
    fetchApi(`/api/lessons/${id}`, { method: 'DELETE' }),
};
