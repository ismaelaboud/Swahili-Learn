'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getCookie } from '@/lib/cookies';

interface CourseDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  published: boolean;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  isEnrolled: boolean;
  isInstructor: boolean;
  canAccessContent: boolean;
}

interface Props {
  params: Promise<{
    courseId: string;
  }>;
}

export default function CoursePage({ params }: Props) {
  const { courseId } = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const token = getCookie('token');
        const headers: HeadersInit = {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`http://localhost:3001/api/courses/${courseId}`, {
          method: 'GET',
          headers,
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.error('Please log in to view course details');
            router.push('/auth/login');
            return;
          }
          throw new Error('Failed to fetch course details');
        }

        const data = await response.json();
        setCourse(data);
      } catch (error) {
        console.error('Error fetching course details:', error);
        toast.error('Failed to fetch course details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, router]);

  const handleEnroll = async () => {
    const token = getCookie('token');
    if (!token) {
      toast.error('Please log in to enroll in this course');
      router.push('/auth/login');
      return;
    }

    setIsEnrolling(true);
    try {
      const response = await fetch(`http://localhost:3001/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to enroll in course');
      }

      toast.success('Successfully enrolled in course');
      router.refresh();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to enroll in course');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-gray-900">Course not found</h1>
        <p className="mt-2 text-gray-600">The course you're looking for doesn't exist.</p>
        <Button
          onClick={() => router.push('/courses')}
          className="mt-4"
        >
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
          <div className="text-sm text-gray-500">
            Instructor: {course.instructor.name}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Description</h3>
              <p className="mt-1 text-gray-600">{course.description}</p>
            </div>
            
            <div>
              <h3 className="font-medium">Category</h3>
              <p className="mt-1 text-gray-600">
                {course.category.replace('_', ' ')}
              </p>
            </div>

            {!course.isEnrolled && !course.isInstructor && (
              <Button
                onClick={handleEnroll}
                disabled={isEnrolling}
                className="w-full"
              >
                {isEnrolling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  'Enroll in Course'
                )}
              </Button>
            )}

            {course.isEnrolled && (
              <Button
                onClick={() => router.push(`/dashboard/courses/${course.id}`)}
                className="w-full"
              >
                Go to Course Content
              </Button>
            )}

            {course.isInstructor && (
              <Button
                onClick={() => router.push(`/instructor/courses/${course.id}`)}
                className="w-full"
              >
                Manage Course
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
