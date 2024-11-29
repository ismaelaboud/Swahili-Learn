'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Lock } from 'lucide-react';

const MOCK_COURSES = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    description: 'Learn the basics of HTML, CSS, and JavaScript',
    instructor: 'John Doe',
    category: 'Web Development',
    level: 'Beginner',
    image: '/course-images/web-dev.jpg',
    enrollmentCount: 156,
    rating: 4.8,
  },
  {
    id: '2',
    title: 'Advanced React Patterns',
    description: 'Master advanced React concepts and patterns',
    instructor: 'Jane Smith',
    category: 'Frontend Development',
    level: 'Advanced',
    image: '/course-images/react.jpg',
    enrollmentCount: 89,
    rating: 4.9,
  },
  // Add more mock courses as needed
];

export default function BrowsePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredCourses = MOCK_COURSES.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCourseClick = (courseId: string) => {
    if (!user) {
      // If user is not authenticated, redirect to login
      router.push('/auth/login?redirect=/courses/' + courseId);
    } else {
      // If user is authenticated, go to course page
      router.push('/courses/' + courseId);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Browse Courses</h1>
          <p className="text-muted-foreground">
            Discover new courses and expand your knowledge
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>
            Search
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="aspect-video relative bg-muted rounded-md mb-4">
                  {course.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.image}
                      alt={course.title}
                      className="object-cover rounded-md"
                    />
                  )}
                </div>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Instructor:</span>
                    <span className="font-medium">{course.instructor}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{course.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Enrolled:</span>
                    <span className="font-medium">{course.enrollmentCount} students</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rating:</span>
                    <span className="font-medium">⭐ {course.rating}</span>
                  </div>
                  <Button 
                    className="mt-4 w-full"
                    onClick={() => handleCourseClick(course.id)}
                  >
                    {!user && <Lock className="h-4 w-4 mr-2" />}
                    {user ? 'View Course' : 'Login to Access'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No courses found</CardTitle>
              <CardDescription>
                Try adjusting your search query
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
