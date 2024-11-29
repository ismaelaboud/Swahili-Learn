'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Search, Mail, BookOpen, BarChart } from 'lucide-react';

const MOCK_STUDENTS = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    enrolledCourses: 3,
    averageProgress: 75,
    lastActive: '2024-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    enrolledCourses: 2,
    averageProgress: 60,
    lastActive: '2024-01-14',
  },
  // Add more mock students as needed
];

export default function InstructorStudentsPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">
            Manage and track your students' progress
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-10"
            />
          </div>
          <Button>
            Export Data
          </Button>
        </div>

        <div className="grid gap-6">
          {MOCK_STUDENTS.map((student) => (
            <Card key={student.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        {student.name[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold">{student.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {student.enrolledCourses} Courses
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Enrolled
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <BarChart className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            Progress
                          </p>
                          <span className="text-sm font-medium">
                            {student.averageProgress}%
                          </span>
                        </div>
                        <Progress 
                          value={student.averageProgress}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm font-medium">
                          Last Active
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(student.lastActive).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {MOCK_STUDENTS.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No students yet</CardTitle>
              <CardDescription>
                Students will appear here when they enroll in your courses
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
