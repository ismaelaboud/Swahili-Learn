'use client';

import { useEffect, useState } from 'react';
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
import { Loader2, Plus, GripVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getCookie } from '@/lib/cookies';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string;
  type: 'TEXT' | 'VIDEO' | 'QUIZ' | 'EXERCISE' | 'CODE';
  order: number;
}

interface Props {
  params: {
    courseId: string;
    sectionId: string;
  };
}

export default function SectionEditor({ params }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSection();
  }, []);

  const fetchSection = async () => {
    try {
      setIsLoading(true);
      const token = getCookie('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/courses/${params.courseId}/sections/${params.sectionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch section');
      }

      const data = await response.json();
      setTitle(data.title || '');
      setDescription(data.description || '');
      setLessons(data.lessons || []);
    } catch (error) {
      toast.error('Failed to load section');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = getCookie('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/courses/${params.courseId}/sections/${params.sectionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update section');
      }

      toast.success('Section updated successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update section');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(lessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order property for each lesson
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setLessons(updatedItems);

    try {
      const token = getCookie('token');
      await fetch(`/api/courses/${params.courseId}/sections/${params.sectionId}/lessons/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lessons: updatedItems.map((lesson) => ({
            id: lesson.id,
            order: lesson.order,
          })),
        }),
      });

      toast.success('Lessons reordered successfully');
    } catch (error) {
      toast.error('Failed to update lesson order');
      // Revert the state if the API call fails
      fetchSection();
    }
  };

  const handleAddLesson = () => {
    router.push(
      `/instructor/courses/${params.courseId}/sections/${params.sectionId}/lessons/create`
    );
  };

  const handleEditLesson = (lessonId: string) => {
    router.push(
      `/instructor/courses/${params.courseId}/sections/${params.sectionId}/lessons/${lessonId}`
    );
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      const token = getCookie('token');
      const response = await fetch(
        `/api/courses/${params.courseId}/sections/${params.sectionId}/lessons/${lessonId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }

      setLessons(lessons.filter((lesson) => lesson.id !== lessonId));
      toast.success('Lesson deleted successfully');
    } catch (error) {
      toast.error('Failed to delete lesson');
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
          <h1 className="text-3xl font-bold">Edit Section</h1>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/instructor/courses/${params.courseId}`)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Section Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter section title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter section description"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Lessons</CardTitle>
            <Button onClick={handleAddLesson}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </Button>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="lessons">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {lessons && lessons.length > 0 ? (
                      lessons.map((lesson, index) => (
                        <Draggable
                          key={lesson.id}
                          draggableId={lesson.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-4">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-5 w-5 text-gray-500" />
                                </div>
                                <div>
                                  <h3 className="font-medium">{lesson.title}</h3>
                                  <p className="text-sm text-gray-500">
                                    {lesson.type}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditLesson(lesson.id)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteLesson(lesson.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No lessons yet.</p>
                        <Button
                          variant="outline"
                          onClick={handleAddLesson}
                          className="mt-4"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Lesson
                        </Button>
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
