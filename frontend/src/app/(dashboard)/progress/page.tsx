'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Award, Clock, Target, TrendingUp } from 'lucide-react';

const MOCK_PROGRESS_DATA = {
  totalCourses: 5,
  completedCourses: 2,
  totalHours: 45,
  completedHours: 28,
  certificates: 2,
  currentStreak: 7,
  achievements: [
    {
      id: '1',
      title: 'Fast Learner',
      description: 'Complete 5 lessons in one day',
      progress: 80,
    },
    {
      id: '2',
      title: 'Consistent Student',
      description: 'Maintain a 7-day learning streak',
      progress: 100,
    },
    {
      id: '3',
      title: 'Knowledge Seeker',
      description: 'Complete 10 courses',
      progress: 20,
    },
  ],
};

export default function ProgressPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">My Progress</h1>
          <p className="text-muted-foreground">
            Track your learning achievements and milestones
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Courses</CardTitle>
              <CardDescription>Total progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {MOCK_PROGRESS_DATA.completedCourses}/{MOCK_PROGRESS_DATA.totalCourses}
                  </span>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </div>
                <Progress 
                  value={(MOCK_PROGRESS_DATA.completedCourses / MOCK_PROGRESS_DATA.totalCourses) * 100} 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Hours</CardTitle>
              <CardDescription>Time invested</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {MOCK_PROGRESS_DATA.completedHours}h
                  </span>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <Progress 
                  value={(MOCK_PROGRESS_DATA.completedHours / MOCK_PROGRESS_DATA.totalHours) * 100} 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
              <CardDescription>Earned credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {MOCK_PROGRESS_DATA.certificates}
                </span>
                <Award className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Streak</CardTitle>
              <CardDescription>Days in a row</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {MOCK_PROGRESS_DATA.currentStreak} days
                </span>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Your learning milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {MOCK_PROGRESS_DATA.achievements.map((achievement) => (
                <div key={achievement.id} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      {achievement.progress}%
                    </span>
                  </div>
                  <Progress value={achievement.progress} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
