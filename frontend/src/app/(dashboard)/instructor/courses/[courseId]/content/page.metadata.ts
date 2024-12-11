import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { courseId: string } }): Promise<Metadata> {
  return {
    title: `Course Content - ${params.courseId}`,
    description: `Manage content for course ${params.courseId}`
  };
}
