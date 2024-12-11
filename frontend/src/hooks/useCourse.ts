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

      const response = await api.createCourse({
        title: data.title || '',
        description: data.description || '',
        category: data.category || ''
      });
      
      toast.success('Course created successfully');
      router.push(`/instructor/courses/${response.id}`);
      
      return response;
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

      const response = await api.updateCourse(courseId!, {
        title: data.title,
        description: data.description,
        category: data.category,
        imageUrl: data.imageUrl
      });
      
      toast.success('Course updated successfully');
      router.refresh();
      
      return response;
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

      await api.updateCourse(courseId!, { isPublished: true });
      
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

      await api.updateCourse(courseId!, { isPublished: false });
      
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
    try {
      setIsLoading(true);
      setError(null);

      await api.deleteCourse(courseId!);
      
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

  const createSection = async (data: Partial<Section>) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.createSection(courseId!, {
        title: data.title || '',
        description: data.description
      });
      
      toast.success('Section added successfully');
      router.refresh();
      
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create section';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addLesson = async (sectionId: string, data: Partial<Lesson>) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.createLesson(sectionId, {
        title: data.title || '',
        description: data.description,
        type: data.type || 'TEXT',
        content: {
          videoUrl: data.content?.videoUrl,
          text: data.content?.text,
          quizData: data.content?.quizData,
          exerciseData: data.content?.exerciseData,
          codeData: data.content?.codeData
        },
        isFree: data.isFree || false,
        order: data.order || 0
      });
      
      toast.success('Lesson added successfully');
      router.refresh();
      
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create lesson';
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
    createSection,
    addLesson,
  };
}
