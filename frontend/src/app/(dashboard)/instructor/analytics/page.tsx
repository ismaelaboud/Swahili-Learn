'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign,
  BarChart2,
  Activity,
  Clock,
  Star
} from 'lucide-react';

const MOCK_ANALYTICS_DATA = {
  totalStudents: 256,
  totalCourses: 5,
  totalRevenue: 12580,
  averageRating: 4.7,
  courseCompletionRate: 78,
  studentEngagement: 85,
  averageTimeSpent: 45,
  monthlyGrowth: 12,
  coursePerformance: [
    {
      id: '1',
      title: 'Introduction to Web Development',
      students: 89,
      completionRate: 75,
      rating: 4.8,
      revenue: 4500,
    },
    {
      id: '2',
      title: 'Advanced React Patterns',
      students: 67,
      completionRate: 82,
      rating: 4.6,
      revenue: 3350,
    },
  ],
};

export default function InstructorAnalyticsPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your course performance and student engagement
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{MOCK_ANALYTICS_DATA.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                +{MOCK_ANALYTICS_DATA.monthlyGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${MOCK_ANALYTICS_DATA.totalRevenue}
              </div>
              <p className="text-xs text-muted-foreground">
                +15% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Course Completion
              </CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {MOCK_ANALYTICS_DATA.courseCompletionRate}%
              </div>
              <Progress 
                value={MOCK_ANALYTICS_DATA.courseCompletionRate} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Rating
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {MOCK_ANALYTICS_DATA.averageRating}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on all course ratings
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
            <CardDescription>
              Detailed metrics for each of your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {MOCK_ANALYTICS_DATA.coursePerformance.map((course) => (
                <div key={course.id} className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{course.title}</h3>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {course.students} Students
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Enrolled
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {course.completionRate}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Completion Rate
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {course.rating}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Average Rating
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          ${course.revenue}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total Revenue
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
