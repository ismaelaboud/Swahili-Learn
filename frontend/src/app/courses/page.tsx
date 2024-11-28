'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, BookOpen, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { getCookie } from '@/lib/cookies';

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

export default function ExploreCourses() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/courses/public', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data = await response.json();
        setCourses(data.filter((course: Course) => course.isPublished));
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to fetch courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnrollClick = (courseId: string) => {
    const token = getCookie('token');
    if (!token) {
      toast.error('Please log in to enroll in this course');
      router.push('/auth/login');
      return;
    }
    router.push(`/courses/${courseId}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Explore Courses</h1>
        <p className="text-muted-foreground">
          Discover our wide range of courses and start learning today
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col">
            <CardContent className="flex-1 p-6">
              <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
              <p className="text-muted-foreground mb-4">{course.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course._count?.sections || 0} sections</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course._count?.enrollments || 0} enrolled</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <div className="flex w-full items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Created {formatDistanceToNow(new Date(course.createdAt), { addSuffix: true })}
                </span>
                <Button onClick={() => handleEnrollClick(course.id)}>
                  View Course
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No courses available at the moment.</p>
        </div>
      )}
    </div>
  );
}
