'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import CourseTemplateForm from '@/components/course/CourseTemplateForm';
import { getCookie } from '@/lib/cookies';
import { PageProps } from '@/types';

export default function CourseContent({ params }: PageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [courseData, setCourseData] = useState<any>(null);
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseId = async () => {
      const resolvedParams = await params;
      setCourseId(resolvedParams.courseId);
    };
    fetchCourseId();
  }, [params]);

  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;
    try {
      setIsLoading(true);
      const token = getCookie('token');
      const response = await fetch(`/api/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch course data');
      }

      const data = await response.json();
      setCourseData(data);
    } catch (error) {
      toast.error('Failed to load course data');
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchCourseData();
    };
    fetchData();
  }, [fetchCourseData, courseId]);

  const handleSaveContent = async (contentData: any) => {
    try {
      const token = getCookie('token');
      const response = await fetch(`/api/courses/${courseId}/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(contentData),
      });

      if (!response.ok) {
        throw new Error('Failed to save course content');
      }

      toast.success('Course content saved successfully');
      fetchCourseData(); // Refresh the course data
    } catch (error) {
      toast.error('Failed to save course content');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Course Content</h1>
          <Button
            variant="outline"
            onClick={() => router.push(`/instructor/courses/${courseId}`)}
          >
            Back to Course
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Content</CardTitle>
          </CardHeader>
          <CardContent>
            <CourseTemplateForm onSave={handleSaveContent} />
          </CardContent>
        </Card>

        {courseData?.content && courseData.content.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Existing Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courseData.content.map((content: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{content.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{content.type}</p>
                      {/* Add more content details here */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
