'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/icons';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  console.log('Current user:', user);
  console.log('User role:', user?.role);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Welcome, {user?.name || 'User'}!</h1>
          {user.role === 'INSTRUCTOR' && (
            <Button onClick={() => router.push('/courses/create')}>
              <Icons.plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          )}
        </div>
        <p className="text-muted-foreground">You are logged in as: {user.role}</p>
        
        {user.role === 'STUDENT' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>View your enrolled courses</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Enrolled courses</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
                <CardDescription>Track your learning progress</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0%</p>
                <p className="text-sm text-muted-foreground">Average completion</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Your learning milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Certificates earned</p>
              </CardContent>
            </Card>
          </div>
        ) : user.role === 'INSTRUCTOR' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>Courses you&apos;re teaching</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Active courses</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Students</CardTitle>
                <CardDescription>Total enrolled students</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Active students</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Course performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0%</p>
                <p className="text-sm text-muted-foreground">Average completion rate</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div>Unknown role: {user.role}</div>
        )}
      </div>
    </div>
  );
}
