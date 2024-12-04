'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, GripVertical } from 'lucide-react';
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
  description: string | null;
  order: number;
  type: 'VIDEO' | 'TEXT' | 'QUIZ';
}

interface Props {
  params: {
    courseId: string;
  };
}

export default function CourseEditor({ params }: Props) {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setIsLoading(true);
      const token = getCookie('token');
      const response = await fetch(`/api/courses/${params.courseId}/sections`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sections');
      }

      const data = await response.json();
      setSections(data);
    } catch (error) {
      toast.error('Failed to load course sections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order property for each section
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setSections(updatedItems);

    try {
      const token = getCookie('token');
      await fetch(`/api/courses/${params.courseId}/sections/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sections: updatedItems.map((section) => ({
            id: section.id,
            order: section.order,
          })),
        }),
      });

      toast.success('Sections reordered successfully');
    } catch (error) {
      toast.error('Failed to update section order');
      // Revert the state if the API call fails
      fetchSections();
    }
  };

  const handleAddSection = () => {
    router.push(`/instructor/courses/${params.courseId}/sections/create`);
  };

  const handleEditSection = (sectionId: string) => {
    router.push(`/instructor/courses/${params.courseId}/sections/${sectionId}`);
  };

  const handleAddLesson = (sectionId: string) => {
    router.push(
      `/instructor/courses/${params.courseId}/sections/${sectionId}/lessons/create`
    );
  };

  const handleEditLesson = (sectionId: string, lessonId: string) => {
    router.push(
      `/instructor/courses/${params.courseId}/sections/${sectionId}/lessons/${lessonId}`
    );
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Course Content</h1>
        <Button onClick={handleAddSection}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {sections.map((section, index) => (
                <Draggable
                  key={section.id}
                  draggableId={section.id}
                  index={index}
                >
                  {(provided) => (
                    <Card
                      className="mb-4"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg font-medium">
                          <div className="flex items-center">
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-5 w-5 mr-2 text-gray-500" />
                            </div>
                            {section.title}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {section.description && (
                            <p className="text-sm text-gray-500">
                              {section.description}
                            </p>
                          )}
                          <div className="flex flex-col space-y-2">
                            {section.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                              >
                                <span className="text-sm">{lesson.title}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleEditLesson(section.id, lesson.id)
                                  }
                                >
                                  Edit
                                </Button>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSection(section.id)}
                            >
                              Edit Section
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAddLesson(section.id)}
                            >
                              Add Lesson
                            </Button>
                          </div>
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

      {sections.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-40">
            <p className="text-muted-foreground mb-4">
              No sections yet. Add your first section to get started.
            </p>
            <Button onClick={handleAddSection}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
