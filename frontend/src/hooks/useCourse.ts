import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Course, Section, Lesson } from '@/lib/validations/course';

interface UseCourseProps {
  courseId?: string;
}

export function useCourse({ courseId }: UseCourseProps = {}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCourse = async (data: Partial<Course>) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post('/courses', data);
      
      toast.success('Course created successfully');
      router.push(`/instructor/courses/${response.data.id}`);
      
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create course';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCourse = async (data: Partial<Course>) => {
    if (!courseId) throw new Error('Course ID is required');

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.patch(`/courses/${courseId}`, data);
      
      toast.success('Course updated successfully');
      router.refresh();
      
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update course';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const publishCourse = async () => {
    if (!courseId) throw new Error('Course ID is required');

    try {
      setIsLoading(true);
      setError(null);

      await api.patch(`/courses/${courseId}/publish`);
      
      toast.success('Course published successfully');
      router.refresh();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to publish course';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const unpublishCourse = async () => {
    if (!courseId) throw new Error('Course ID is required');

    try {
      setIsLoading(true);
      setError(null);

      await api.patch(`/courses/${courseId}/unpublish`);
      
      toast.success('Course unpublished successfully');
      router.refresh();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to unpublish course';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCourse = async () => {
    if (!courseId) throw new Error('Course ID is required');

    try {
      setIsLoading(true);
      setError(null);

      await api.delete(`/courses/${courseId}`);
      
      toast.success('Course deleted successfully');
      router.push('/instructor/courses');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete course';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addSection = async (data: Partial<Section>) => {
    if (!courseId) throw new Error('Course ID is required');

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post(`/courses/${courseId}/sections`, data);
      
      toast.success('Section added successfully');
      router.refresh();
      
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to add section';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addLesson = async (sectionId: string, data: Partial<Lesson>) => {
    if (!courseId) throw new Error('Course ID is required');

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post(
        `/courses/${courseId}/sections/${sectionId}/lessons`,
        data
      );
      
      toast.success('Lesson added successfully');
      router.refresh();
      
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to add lesson';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createCourse,
    updateCourse,
    publishCourse,
    unpublishCourse,
    deleteCourse,
    addSection,
    addLesson,
  };
}
