'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, DragHandleDots2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getCookie } from '@/lib/cookies';

interface Section {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'TEXT' | 'VIDEO' | 'QUIZ' | 'EXERCISE' | 'CODE';
  order: number;
}

interface Props {
  params: Promise<{
    courseId: string;
  }>;
}

export default function CourseEditor({ params }: Props) {
  const { courseId } = use(params);
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const token = getCookie('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch(`http://localhost:3001/api/sections/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch sections');
        }

        const data = await response.json();
        setSections(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch sections');
        toast.error('Failed to fetch course sections');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSections();
  }, [courseId, router]);

  const handleAddSection = async () => {
    try {
      const token = getCookie('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/sections/${courseId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Section',
          description: 'Add a description for this section',
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to create section');
      }

      const newSection = await response.json();
      setSections([...sections, newSection]);
      toast.success('Section created successfully');
    } catch (error) {
      toast.error('Failed to create section');
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order locally
    setSections(items);

    try {
      const token = getCookie('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Send the new order to the backend
      const response = await fetch(`http://localhost:3001/api/sections/${courseId}/reorder`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionIds: items.map(section => section.id),
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to reorder sections');
      }
    } catch (error) {
      toast.error('Failed to reorder sections');
      // Fetch sections again to reset the order
      router.refresh();
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
          onClick={() => router.push('/instructor/courses')}
          className="mt-4"
        >
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Course Content</h1>
        <Button onClick={handleAddSection}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {sections.map((section, index) => (
                <Draggable
                  key={section.id}
                  draggableId={section.id}
                  index={index}
                >
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <CardHeader
                        {...provided.dragHandleProps}
                        className="flex flex-row items-center justify-between space-y-0 pb-2"
                      >
                        <CardTitle className="text-lg font-medium">
                          <div className="flex items-center">
                            <DragHandleDots2Icon className="h-5 w-5 mr-2 text-gray-500" />
                            {section.title}
                          </div>
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/instructor/courses/${courseId}/sections/${section.id}`)}
                        >
                          Edit
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          {section.description || 'No description'}
                        </p>
                        <div className="mt-4">
                          <p className="text-sm font-medium">Lessons: {section.lessons.length}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
