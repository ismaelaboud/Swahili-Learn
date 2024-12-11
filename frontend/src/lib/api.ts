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

const publicEndpoints = ['/api/auth/login', '/api/auth/register'];

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const apiUrl = await initializeApiUrl();
  const token = options.token || getCookie('token');
  
  // Only require token for non-public endpoints
  if (!token && !publicEndpoints.some(e => endpoint.endsWith(e))) {
    throw new Error('Not authenticated');
  }

  const defaultOptions: RequestInit & { token?: string; next?: NextFetchRequestConfig } = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    },
    credentials: 'include' as RequestCredentials,
    mode: 'cors' as RequestMode,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store' as RequestCache,
    next: { revalidate: 0 }
  };

  // Handle the request body
  if (options.body !== undefined) {
    try {
      // If body is already a string and valid JSON, use it as is
      if (typeof options.body === 'string') {
        try {
          JSON.parse(options.body); // Validate JSON string
          defaultOptions.body = options.body;
        } catch {
          throw new Error('Invalid JSON string in request body');
        }
      } else {
        // Convert non-string body to JSON string
        defaultOptions.body = JSON.stringify(options.body);
      }

      console.log('Request body:', {
        raw: options.body,
        processed: defaultOptions.body,
        parsed: JSON.parse(defaultOptions.body as string)
      });
    } catch (e) {
      console.error('Failed to process request body:', e);
      throw new Error(`Failed to process request body: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  try {
    const finalOptions = {
      ...defaultOptions,
      ...options,
      // Ensure these critical options are not overridden
      credentials: 'include' as RequestCredentials,
      mode: 'cors' as RequestMode,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    // Ensure body is not lost when spreading options
    if (defaultOptions.body) {
      finalOptions.body = defaultOptions.body;
    }

    console.log('Making API request to:', `${apiUrl}${endpoint}`, {
      method: finalOptions.method,
      headers: finalOptions.headers,
      body: finalOptions.body ? JSON.parse(finalOptions.body as string) : undefined
    });

    const response = await fetch(`${apiUrl}${endpoint}`, finalOptions);
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let errorData;
      try {
        if (contentType?.includes('application/json')) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          errorData = { 
            message: text || response.statusText || 'API request failed',
            status: response.status 
          };
        }
      } catch (e) {
        errorData = { 
          message: response.statusText || 'API request failed',
          status: response.status 
        };
      }
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType,
        errorData
      });
      throw new Error(errorData.message || 'API request failed');
    }

    // Handle empty responses
    if (response.status === 204 || !contentType) {
      return null;
    }

    // Parse JSON response
    if (contentType?.includes('application/json')) {
      return response.json();
    }

    // Return text for other content types
    return response.text();
  } catch (error: any) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    return fetchApi('/api/auth/login', { 
      method: 'POST',
      body: credentials
    });
  },

  async register(userData: { 
    email: string; 
    password: string; 
    name: string; 
    role: 'STUDENT' | 'INSTRUCTOR' 
  }) {
    return fetchApi('/api/auth/register', { 
      method: 'POST',
      body: userData
    });
  },

  // Courses
  async createCourse(courseData: { title: string; description: string; category: string }) {
    return fetchApi('/api/courses', { method: 'POST', body: courseData });
  },

  async getCourses() {
    return fetchApi('/api/courses');
  },

  async getCourse(id: string) {
    return fetchApi(`/api/courses/${id}`);
  },

  async updateCourse(id: string, courseData: any) {
    return fetchApi(`/api/courses/${id}`, { method: 'PUT', body: courseData });
  },

  async deleteCourse(id: string) {
    return fetchApi(`/api/courses/${id}`, { method: 'DELETE' });
  },

  // Sections
  async createSection(courseId: string, sectionData: { title: string; description?: string }) {
    return fetchApi(`/api/courses/${courseId}/sections`, { method: 'POST', body: sectionData });
  },

  async getSections(courseId: string) {
    return fetchApi(`/api/courses/${courseId}/sections`);
  },

  async updateSection(id: string, sectionData: any) {
    return fetchApi(`/api/sections/${id}`, { method: 'PUT', body: sectionData });
  },

  async deleteSection(id: string) {
    return fetchApi(`/api/sections/${id}`, { method: 'DELETE' });
  },

  // Lessons
  async createLesson(sectionId: string, lessonData: any) {
    return fetchApi(`/api/sections/${sectionId}/lessons`, { method: 'POST', body: lessonData });
  },

  async getLesson(id: string) {
    return fetchApi(`/api/lessons/${id}`);
  },

  async updateLesson(id: string, lessonData: any) {
    return fetchApi(`/api/lessons/${id}`, { method: 'PUT', body: lessonData });
  },

  async deleteLesson(id: string) {
    return fetchApi(`/api/lessons/${id}`, { method: 'DELETE' });
  },
};
