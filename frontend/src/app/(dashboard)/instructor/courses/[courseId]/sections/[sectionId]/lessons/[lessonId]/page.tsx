'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getCookie } from '@/lib/cookies';
import RichTextEditor from '@/components/editor/RichTextEditor';
import FileUpload from '@/components/upload/FileUpload';
import QuizEditor from '@/components/quiz/QuizEditor';

interface Props {
  params: Promise<{
    courseId: string;
    sectionId: string;
    lessonId: string;
  }>;
}

interface LessonContent {
  text?: string;
  videoUrl?: string;
  quizData?: any;
  exerciseData?: any;
  codeData?: any;
}

export default function LessonEditor({ params }: Props) {
  const { courseId, sectionId, lessonId } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<LessonContent>({});
  const [type, setType] = useState<'TEXT' | 'VIDEO' | 'QUIZ' | 'EXERCISE' | 'CODE'>('TEXT');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = getCookie('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch(`http://localhost:3001/api/lessons/${lessonId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch lesson');
        }

        const data = await response.json();
        setTitle(data.title);
        setContent(typeof data.content === 'string' ? { text: data.content } : data.content);
        setType(data.type);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch lesson');
        toast.error('Failed to fetch lesson details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, router]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = getCookie('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          type,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update lesson');
      }

      toast.success('Lesson updated successfully');
    } catch (error) {
      toast.error('Failed to update lesson');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      const token = getCookie('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }

      toast.success('Lesson deleted successfully');
      router.push(`/instructor/courses/${courseId}/sections/${sectionId}`);
    } catch (error) {
      toast.error('Failed to delete lesson');
    }
  };

  const renderContentEditor = () => {
    switch (type) {
      case 'TEXT':
        return (
          <div>
            <label className="text-sm font-medium">Content</label>
            <RichTextEditor
              content={content.text || ''}
              onChange={(text) => setContent({ ...content, text })}
            />
          </div>
        );
      
      case 'VIDEO':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Video Upload</label>
              <FileUpload
                endpoint="lessonVideo"
                onUploadComplete={(url) => setContent({ ...content, videoUrl: url })}
              />
            </div>
            {content.videoUrl && (
              <div>
                <label className="text-sm font-medium">Preview</label>
                <video
                  src={content.videoUrl}
                  controls
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </div>
        );
      
      case 'QUIZ':
        return (
          <div>
            <label className="text-sm font-medium">Quiz Content</label>
            <QuizEditor
              initialContent={content.quizData}
              onChange={(quizData) => setContent({ ...content, quizData })}
            />
          </div>
        );
      
      case 'EXERCISE':
        return (
          <div>
            <p className="text-sm text-muted-foreground">Exercise editor coming soon...</p>
          </div>
        );
      
      case 'CODE':
        return (
          <div>
            <p className="text-sm text-muted-foreground">Code editor coming soon...</p>
          </div>
        );
      
      default:
        return null;
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
          onClick={() => router.push(`/instructor/courses/${courseId}/sections/${sectionId}`)}
          className="mt-4"
        >
          Back to Section
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
            onClick={() => router.push(`/instructor/courses/${courseId}/sections/${sectionId}`)}
          >
            ← Back to Section
          </Button>
          <div className="space-x-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete Lesson
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lesson Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter lesson title"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Type</label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as typeof type)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lesson type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEXT">Text</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="QUIZ">Quiz</SelectItem>
                  <SelectItem value="EXERCISE">Exercise</SelectItem>
                  <SelectItem value="CODE">Code</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renderContentEditor()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
