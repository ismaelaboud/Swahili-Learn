'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/lib/cookies';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, BookOpen, Users, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import Image from 'next/image';

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  _count?: {
    sections: number;
    enrollments: number;
  };
}

export default function InstructorCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = getCookie('token');
        console.log('Token:', token); // Debug log

        const response = await fetch('http://localhost:3001/api/courses/instructor', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          mode: 'cors',
        });

        console.log('Response status:', response.status); // Debug log

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response:', errorData); // Debug log
          throw new Error(errorData.error || 'Failed to fetch courses');
        }

        const data = await response.json();
        console.log('Courses data:', data); // Debug log
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to fetch courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Courses</h1>
          <Button
            onClick={() => router.push('/instructor/courses/create')}
          >
            Create New Course
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              <CardContent className="p-6">
                <div className="aspect-video relative mb-4 rounded-lg overflow-hidden bg-gray-100">
                  {course.imageUrl ? (
                    <Image
                      src={course.imageUrl}
                      alt={course.title}
                      width={400}
                      height={225}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <BookOpen className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{course._count?.sections || 0} sections</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course._count?.enrollments || 0} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDistanceToNow(new Date(course.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0 mt-auto">
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push(`/instructor/courses/${course.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => router.push(`/courses/${course.id}/sections`)}
                  >
                    Manage Content
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
              <p className="text-gray-500 mb-4">
                Get started by creating your first course
              </p>
              <Button
                onClick={() => router.push('/instructor/courses/create')}
              >
                Create Course
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
