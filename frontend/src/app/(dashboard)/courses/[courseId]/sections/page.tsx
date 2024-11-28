'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getCookie } from '@/lib/cookies';
import { SectionManager } from '@/components/sections/SectionManager';
import { Loader2 } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: any[];
}

export default function CourseSectionsPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch(`/api/sections/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${getCookie('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch sections');
        }

        const data = await response.json();
        setSections(data);
      } catch (error) {
        console.error('Error fetching sections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSections();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <SectionManager
        courseId={courseId}
        initialSections={sections}
      />
    </div>
  );
}
