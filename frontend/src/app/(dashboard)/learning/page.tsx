'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PlayCircle, Clock, Award } from 'lucide-react';

const MOCK_ENROLLED_COURSES = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    progress: 65,
    lastAccessed: '2024-01-15',
    totalLessons: 24,
    completedLessons: 16,
  },
  {
    id: '2',
    title: 'Advanced React Patterns',
    progress: 30,
    lastAccessed: '2024-01-14',
    totalLessons: 18,
    completedLessons: 5,
  },
];

export default function LearningPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">My Learning</h1>
          <p className="text-muted-foreground">
            Track your progress and continue learning
          </p>
        </div>

        <div className="grid gap-6">
          {MOCK_ENROLLED_COURSES.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>
                  Last accessed on {new Date(course.lastAccessed).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Progress value={course.progress} className="flex-1" />
                    <span className="text-sm font-medium">{course.progress}%</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {course.completedLessons}/{course.totalLessons} lessons
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {Math.round(course.totalLessons * 0.5)} hours total
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Certificate available
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      Continue Learning
                    </Button>
                    <Button variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {MOCK_ENROLLED_COURSES.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No courses yet</CardTitle>
              <CardDescription>
                Start learning by enrolling in a course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button>
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
