import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { api } from './api';

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
  name: string;
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
      name: decoded.name,
      role: decoded.role,
    };
  } catch {
    Cookies.remove(TOKEN_NAME);
    return null;
  }
};

export const login = async (
  email: string,
  password: string
): Promise<{ user: User; token: string }> => {
  try {
    const response = await api.login({ email, password });
    const { token } = response;

    // Set cookie with token
    Cookies.set(TOKEN_NAME, token, {
      expires: 7, // 7 days
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    const user = getUser();
    if (!user) throw new Error('Failed to decode user from token');

    return { user, token };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (
  email: string,
  password: string,
  name: string,
  role: keyof UserRole
): Promise<{ user: User; token: string }> => {
  try {
    // Validate input data
    if (!email?.trim()) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');
    if (!name?.trim()) throw new Error('Name is required');
    if (!role) throw new Error('Role is required');

    // Prepare registration data
    const registrationData = {
      email: email.trim(),
      password,
      name: name.trim(),
      role: role === 'ADMIN' ? 'INSTRUCTOR' : role
    };

    console.log('Sending registration request with data:', {
      ...registrationData,
      password: '[REDACTED]'
    });

    // Make API request
    const response = await api.register(registrationData);
    console.log('Registration response:', {
      ...response,
      token: response.token ? '[PRESENT]' : '[MISSING]'
    });

    if (!response.token) {
      throw new Error('No token received from server');
    }

    // Set cookie with token
    Cookies.set(TOKEN_NAME, response.token, {
      expires: 7, // 7 days
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    // Get user from token
    const user = getUser();
    if (!user) {
      throw new Error('Failed to decode user from token');
    }

    return { user, token: response.token };
  } catch (error: any) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logout = (): void => {
  if (typeof window === 'undefined') return;
  Cookies.remove(TOKEN_NAME);
};

export const getAuthHeader = () => {
  const token = Cookies.get(TOKEN_NAME);
  return token ? { Authorization: `Bearer ${token}` } : {};
};
