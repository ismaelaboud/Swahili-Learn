'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CreateCourseForm } from '@/components/courses/CreateCourseForm';

export default function CreateCoursePage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role !== 'INSTRUCTOR') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'INSTRUCTOR') {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <CreateCourseForm />
      </div>
    </div>
  );
}
