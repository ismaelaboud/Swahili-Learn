import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

export interface UserRole {
  ADMIN: 'ADMIN';
  INSTRUCTOR: 'INSTRUCTOR';
  STUDENT: 'STUDENT';
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: keyof UserRole;
}

export interface DecodedToken {
  userId: string;
  email: string;
  role: keyof UserRole;
  iat: number;
  exp: number;
}

const TOKEN_NAME = 'token';

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = Cookies.get(TOKEN_NAME);
  if (!token) return false;

  try {
    const decoded = jwtDecode(token) as DecodedToken;
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  const token = Cookies.get(TOKEN_NAME);
  if (!token) return null;

  try {
    const decoded = jwtDecode(token) as DecodedToken;
    if (decoded.exp * 1000 <= Date.now()) {
      Cookies.remove(TOKEN_NAME);
      return null;
    }

    return {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: null,
    };
  } catch {
    return null;
  }
};

export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  console.log('Attempting login...');
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Login failed:', error);
    throw new Error(error.message || 'Failed to login');
  }

  const data = await response.json();
  console.log('Login successful, token:', data.token);
  
  // Set cookie with token
  Cookies.set(TOKEN_NAME, data.token, {
    expires: 7, // 7 days
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  const user = getUser();
  if (!user) throw new Error('Failed to decode user from token');

  return { user, token: data.token };
};

export const register = async (
  email: string,
  password: string,
  name: string,
  role: keyof UserRole
): Promise<{ user: User; token: string }> => {
  console.log('Attempting registration...');
  const response = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name, role }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Registration failed:', error);
    throw new Error(error.message || 'Failed to register');
  }

  const data = await response.json();
  console.log('Registration successful, token:', data.token);
  
  // Set cookie with token
  Cookies.set(TOKEN_NAME, data.token, {
    expires: 7, // 7 days
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  const user = getUser();
  if (!user) throw new Error('Failed to decode user from token');

  return { user, token: data.token };
};

export const logout = (): void => {
  if (typeof window === 'undefined') return;
  Cookies.remove(TOKEN_NAME);
};

export const getAuthHeader = (): { Authorization: string } | undefined => {
  if (typeof window === 'undefined') return undefined;
  const token = Cookies.get(TOKEN_NAME);
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};
