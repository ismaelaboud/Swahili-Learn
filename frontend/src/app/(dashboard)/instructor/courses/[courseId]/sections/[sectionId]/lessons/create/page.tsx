'use client';

import { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getCookie } from '@/lib/cookies';
import dynamic from 'next/dynamic';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Dynamically import the rich text editor to avoid SSR issues
const RichTextEditor = dynamic(() => import('@/components/editor/RichTextEditor'), {
  ssr: false,
});

// Lesson content types
const LESSON_TYPES = [
  { value: 'TEXT', label: 'Text Lesson' },
  { value: 'VIDEO', label: 'Video Lesson' },
  { value: 'QUIZ', label: 'Quiz' },
  { value: 'CODE', label: 'Code Exercise' },
] as const;

interface Props {
  params: {
    courseId: string;
    sectionId: string;
  };
}

export default function CreateLesson({ params }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<(typeof LESSON_TYPES)[number]['value']>('TEXT');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const token = getCookie('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const lessonData = {
        title,
        description,
        type,
        isFree,
        content: type === 'TEXT' ? content : null,
        videoUrl: type === 'VIDEO' ? videoUrl : null,
      };

      const response = await fetch(
        `/api/courses/${params.courseId}/sections/${params.sectionId}/lessons`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(lessonData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create lesson');
      }

      toast.success('Lesson created successfully');
      router.push(
        `/instructor/courses/${params.courseId}/sections/${params.sectionId}`
      );
    } catch (error) {
      toast.error('Failed to create lesson');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Create New Lesson</h1>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/instructor/courses/${params.courseId}/sections/${params.sectionId}`
                )
              }
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Lesson
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lesson Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter lesson title"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter lesson description"
              />
            </div>

            <div className="space-y-2">
              <Label>Lesson Type</Label>
              <Select value={type} onValueChange={(value: any) => setType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lesson type" />
                </SelectTrigger>
                <SelectContent>
                  {LESSON_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="free-preview"
                checked={isFree}
                onCheckedChange={setIsFree}
              />
              <Label htmlFor="free-preview">
                Make this lesson available for free preview
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lesson Content</CardTitle>
          </CardHeader>
          <CardContent>
            {type === 'TEXT' && (
              <div className="space-y-4">
                <RichTextEditor
                  value={content}
                  onChange={(value) => setContent(value)}
                />
              </div>
            )}

            {type === 'VIDEO' && (
              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                />
              </div>
            )}

            {type === 'QUIZ' && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Quiz editor will be implemented soon.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setType('TEXT')}
                  className="mt-4"
                >
                  Switch to Text Lesson
                </Button>
              </div>
            )}

            {type === 'CODE' && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Code exercise editor will be implemented soon.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setType('TEXT')}
                  className="mt-4"
                >
                  Switch to Text Lesson
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
