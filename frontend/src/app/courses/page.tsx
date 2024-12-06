'use client';

import { Button } from "@/components/ui/button";
import { BookOpen, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { getCookie } from '@/lib/cookies';
import ShineBorder from "@/components/magicui/shine-border";

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
  instructor?: {
    name: string;
  };
  level?: string;
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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <ShineBorder
            key={course.id}
            color={["#8678F9", "#c7d2fe", "#FFBE7B"]}
            className="group h-full transition-all duration-300 hover:scale-[1.02]"
            shouldHover={true}
          >
            <div className="flex h-full flex-col bg-card p-6 rounded-lg">
              {course.imageUrl && (
                <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h2>
                <p className="text-muted-foreground mb-4">{course.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{course._count?.sections || 0} sections</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{course._count?.enrollments || 0} enrolled</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Instructor:</span> {course.instructor?.name || 'Unknown'}
                    </div>
                    <div>
                      <span className="font-medium">Level:</span> {course.level || 'All Levels'}
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleEnrollClick(course.id)}
                    className="w-full bg-gradient-to-r from-[#8678F9] to-[#FFBE7B] hover:opacity-90 transition-opacity"
                  >
                    View Course
                  </Button>
                </div>
              </div>
            </div>
          </ShineBorder>
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
