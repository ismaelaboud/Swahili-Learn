'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getCookie } from '@/lib/cookies';
import { LessonManager } from '@/components/lessons/LessonManager';
import { Loader2 } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'TEXT' | 'VIDEO' | 'QUIZ' | 'EXERCISE';
  order: number;
}

export default function SectionLessonsPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const sectionId = params.sectionId as string;
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch(`/api/lessons/${sectionId}`, {
          headers: {
            'Authorization': `Bearer ${getCookie('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch lessons');
        }

        const data = await response.json();
        setLessons(data);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, [sectionId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <LessonManager
        courseId={courseId}
        sectionId={sectionId}
        initialLessons={lessons}
      />
    </div>
  );
}
