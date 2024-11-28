'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { getCookie } from '@/lib/cookies';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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
  type: string;
  order: number;
}

interface SectionManagerProps {
  courseId: string;
  initialSections?: Section[];
}

export default function SectionManager({ courseId, initialSections = [] }: SectionManagerProps) {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionDescription, setNewSectionDescription] = useState('');
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) {
      toast.error('Please enter a section title');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/sections/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getCookie('token')}`,
        },
        body: JSON.stringify({
          title: newSectionTitle,
          description: newSectionDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create section');
      }

      const newSection = await response.json();
      setSections([...sections, newSection]);
      setNewSectionTitle('');
      setNewSectionDescription('');
      setIsAddingSection(false);
      toast.success('Section created successfully');
    } catch (error) {
      toast.error('Failed to create section');
      console.error('Error creating section:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section? All lessons within it will be deleted.')) {
      return;
    }

    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getCookie('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete section');
      }

      setSections(sections.filter(section => section.id !== sectionId));
      toast.success('Section deleted successfully');
    } catch (error) {
      toast.error('Failed to delete section');
      console.error('Error deleting section:', error);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order property of each section
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setSections(updatedItems);

    try {
      const response = await fetch(`/api/sections/${courseId}/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getCookie('token')}`,
        },
        body: JSON.stringify({
          sectionIds: updatedItems.map(item => item.id),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder sections');
      }

      toast.success('Sections reordered successfully');
    } catch (error) {
      toast.error('Failed to reorder sections');
      console.error('Error reordering sections:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Sections</h2>
        <Button
          onClick={() => setIsAddingSection(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </Button>
      </div>

      {isAddingSection && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Input
              placeholder="Section Title"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
            />
            <Textarea
              placeholder="Section Description (optional)"
              value={newSectionDescription}
              onChange={(e) => setNewSectionDescription(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingSection(false);
                  setNewSectionTitle('');
                  setNewSectionDescription('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSection}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Section'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                      {...provided.dragHandleProps}
                      className="cursor-move"
                    >
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">{section.title}</h3>
                            {section.description && (
                              <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-2">
                              {section.lessons.length} lesson{section.lessons.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.href = `/courses/${courseId}/sections/${section.id}`}
                            >
                              Manage Lessons
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteSection(section.id)}
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

      {sections.length === 0 && !isAddingSection && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-500">
              No sections yet. Click &quot;Add Section&quot; to create your first section.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
