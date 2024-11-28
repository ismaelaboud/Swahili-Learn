'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, DragHandleDots2Icon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getCookie } from '@/lib/cookies';

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
    sectionId: string;
  }>;
}

export default function SectionEditor({ params }: Props) {
  const { courseId, sectionId } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSection = async () => {
      try {
        const token = getCookie('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch(`http://localhost:3001/api/sections/${sectionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch section');
        }

        const data = await response.json();
        setTitle(data.title);
        setDescription(data.description || '');
        setLessons(data.lessons);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch section');
        toast.error('Failed to fetch section details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSection();
  }, [sectionId, router]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = getCookie('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/sections/${sectionId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update section');
      }

      toast.success('Section updated successfully');
    } catch (error) {
      toast.error('Failed to update section');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLesson = async () => {
    try {
      const token = getCookie('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/lessons/${sectionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Lesson',
          content: '',
          type: 'TEXT',
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to create lesson');
      }

      const newLesson = await response.json();
      setLessons([...lessons, newLesson]);
      toast.success('Lesson created successfully');
    } catch (error) {
      toast.error('Failed to create lesson');
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(lessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order locally
    setLessons(items);

    try {
      const token = getCookie('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Send the new order to the backend
      const response = await fetch(`http://localhost:3001/api/lessons/${sectionId}/reorder`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonIds: items.map(lesson => lesson.id),
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to reorder lessons');
      }
    } catch (error) {
      toast.error('Failed to reorder lessons');
      // Fetch lessons again to reset the order
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
          onClick={() => router.push(`/instructor/courses/${courseId}`)}
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
            onClick={() => router.push(`/instructor/courses/${courseId}`)}
          >
            ← Back to Course
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Section Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter section title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter section description"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Lessons</h2>
          <Button onClick={handleAddLesson}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lesson
          </Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="lessons">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {lessons.map((lesson, index) => (
                  <Draggable
                    key={lesson.id}
                    draggableId={lesson.id}
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
                              {lesson.title}
                            </div>
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/instructor/courses/${courseId}/sections/${sectionId}/lessons/${lesson.id}`)}
                            >
                              Edit
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 capitalize">
                              Type: {lesson.type.toLowerCase().replace('_', ' ')}
                            </span>
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
    </div>
  );
}
