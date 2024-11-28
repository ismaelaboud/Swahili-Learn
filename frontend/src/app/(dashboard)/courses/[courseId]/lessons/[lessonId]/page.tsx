'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getCookie } from '@/lib/cookies';
import QuizPreview from '@/components/quiz/QuizPreview';

interface Props {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export default function LessonView({ params }: Props) {
  const { courseId, lessonId } = use(params);
  const router = useRouter();
  const [lesson, setLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = getCookie('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch(`http://localhost:3001/api/lessons/${lessonId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch lesson');
        }

        const data = await response.json();
        setLesson(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch lesson');
        toast.error('Failed to fetch lesson details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, router]);

  const handleQuizComplete = async (score: number, answers: Record<string, string>) => {
    try {
      const token = getCookie('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Save quiz progress
      const response = await fetch(`http://localhost:3001/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: score >= (lesson.content.quizData.passingScore || 70),
          score,
          answers,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to save quiz progress');
      }

      toast.success('Quiz progress saved');
    } catch (error) {
      toast.error('Failed to save quiz progress');
    }
  };

  const renderContent = () => {
    if (!lesson) return null;

    switch (lesson.type) {
      case 'TEXT':
        return (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content.text }} />
        );

      case 'VIDEO':
        return (
          <div>
            <video
              src={lesson.content.videoUrl}
              controls
              className="w-full rounded-lg"
            />
          </div>
        );

      case 'QUIZ':
        return (
          <QuizPreview
            content={lesson.content.quizData}
            onComplete={handleQuizComplete}
          />
        );

      case 'EXERCISE':
        return (
          <div>
            <p>Exercise content coming soon...</p>
          </div>
        );

      case 'CODE':
        return (
          <div>
            <p>Code exercise coming soon...</p>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-gray-900">Error</h1>
        <p className="mt-2 text-gray-600">{error}</p>
        <Button
          onClick={() => router.push(`/courses/${courseId}`)}
          className="mt-4"
        >
          Back to Course
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/courses/${courseId}`)}
          >
            ← Back to Course
          </Button>
        </div>

        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>
          {renderContent()}
        </Card>
      </div>
    </div>
  );
}
