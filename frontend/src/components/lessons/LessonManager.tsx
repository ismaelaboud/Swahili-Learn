'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { getCookie } from '@/lib/cookies';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Editor } from '@/components/editor/Editor';

interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'TEXT' | 'VIDEO' | 'QUIZ' | 'EXERCISE';
  order: number;
}

interface LessonManagerProps {
  sectionId: string;
  courseId: string;
  initialLessons?: Lesson[];
}

export const LessonManager = ({ sectionId, courseId, initialLessons = [] }: LessonManagerProps) => {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonType, setNewLessonType] = useState<Lesson['type']>('TEXT');
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddLesson = async () => {
    if (!newLessonTitle.trim()) {
      toast.error('Please enter a lesson title');
      return;
    }

    if (!newLessonContent.trim()) {
      toast.error('Please enter lesson content');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/lessons/${sectionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getCookie('token')}`,
        },
        body: JSON.stringify({
          title: newLessonTitle,
          content: newLessonContent,
          type: newLessonType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create lesson');
      }

      const newLesson = await response.json();
      setLessons([...lessons, newLesson]);
      setNewLessonTitle('');
      setNewLessonContent('');
      setNewLessonType('TEXT');
      setIsAddingLesson(false);
      toast.success('Lesson created successfully');
    } catch (error) {
      toast.error('Failed to create lesson');
      console.error('Error creating lesson:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getCookie('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }

      setLessons(lessons.filter(lesson => lesson.id !== lessonId));
      toast.success('Lesson deleted successfully');
    } catch (error) {
      toast.error('Failed to delete lesson');
      console.error('Error deleting lesson:', error);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(lessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order property of each lesson
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setLessons(updatedItems);

    try {
      const response = await fetch(`/api/lessons/${sectionId}/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getCookie('token')}`,
        },
        body: JSON.stringify({
          lessonIds: updatedItems.map(item => item.id),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder lessons');
      }

      toast.success('Lessons reordered successfully');
    } catch (error) {
      toast.error('Failed to reorder lessons');
      console.error('Error reordering lessons:', error);
    }
  };

  const getLessonTypeIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'TEXT':
        return '📝';
      case 'VIDEO':
        return '🎥';
      case 'QUIZ':
        return '❓';
      case 'EXERCISE':
        return '💻';
      default:
        return '📄';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Section Lessons</h2>
        <Button
          onClick={() => setIsAddingLesson(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Lesson
        </Button>
      </div>

      {isAddingLesson && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Input
              placeholder="Lesson Title"
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
            />
            <Select
              value={newLessonType}
              onValueChange={(value: Lesson['type']) => setNewLessonType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select lesson type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEXT">Text Lesson</SelectItem>
                <SelectItem value="VIDEO">Video Lesson</SelectItem>
                <SelectItem value="QUIZ">Quiz</SelectItem>
                <SelectItem value="EXERCISE">Coding Exercise</SelectItem>
              </SelectContent>
            </Select>
            <Editor
              value={newLessonContent}
              onChange={setNewLessonContent}
              placeholder="Enter lesson content..."
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingLesson(false);
                  setNewLessonTitle('');
                  setNewLessonContent('');
                  setNewLessonType('TEXT');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddLesson}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Lesson'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                      {...provided.dragHandleProps}
                      className="cursor-move"
                    >
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {getLessonTypeIcon(lesson.type)}
                            </span>
                            <div>
                              <h3 className="text-lg font-semibold">{lesson.title}</h3>
                              <p className="text-sm text-gray-500">
                                {lesson.type.charAt(0) + lesson.type.slice(1).toLowerCase()} Lesson
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.href = `/courses/${courseId}/sections/${sectionId}/lessons/${lesson.id}`}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteLesson(lesson.id)}
                            >
                              Delete
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

      {lessons.length === 0 && !isAddingLesson && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-500">
              No lessons yet. Click &quot;Add Lesson&quot; to create your first lesson.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
