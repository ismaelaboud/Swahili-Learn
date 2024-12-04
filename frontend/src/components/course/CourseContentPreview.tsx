'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, PlayCircle, BookOpen, Code } from 'lucide-react';

interface CourseContentPreviewProps {
  content: any;
  onComplete?: () => void;
}

export default function CourseContentPreview({
  content,
  onComplete,
}: CourseContentPreviewProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  const renderLectureContent = (lecture: any) => (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: lecture.content }} />
      </div>

      {lecture.learningObjectives?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Learning Objectives</h3>
          <ul className="list-disc pl-5 space-y-1">
            {lecture.learningObjectives.map((objective: string, index: number) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>
      )}

      {lecture.keyPoints?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Key Points</h3>
          <ul className="list-disc pl-5 space-y-1">
            {lecture.keyPoints.map((point: string, index: number) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {lecture.codeExamples?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Code Examples</h3>
          <div className="space-y-4">
            {lecture.codeExamples.map((example: string, index: number) => (
              <pre
                key={index}
                className="bg-gray-100 p-4 rounded-lg overflow-x-auto"
              >
                <code>{example}</code>
              </pre>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderQuizContent = (quiz: any) => (
    <div className="space-y-6">
      {quiz.questions.map((question: any, index: number) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>Question {index + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium">{question.question}</p>
            <div className="space-y-2">
              {question.options.map((option: string, optionIndex: number) => (
                <Button
                  key={optionIndex}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // Handle quiz answer selection
                    if (optionIndex === question.correctAnswer) {
                      toast.success('Correct answer!');
                    } else {
                      toast.error('Incorrect. Try again!');
                    }
                  }}
                >
                  {option}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderExerciseContent = (exercise: any) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Instructions</h3>
        <ul className="list-decimal pl-5 space-y-1">
          {exercise.instructions.map((instruction: string, index: number) => (
            <li key={index}>{instruction}</li>
          ))}
        </ul>
      </div>

      {exercise.starterCode && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Starter Code</h3>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>{exercise.starterCode}</code>
          </pre>
        </div>
      )}

      {exercise.hints?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Hints</h3>
          <div className="space-y-2">
            {exercise.hints.map((hint: string, index: number) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  toast.info(`Hint ${index + 1}: ${hint}`);
                }}
              >
                Show Hint {index + 1}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (content.type) {
      case 'LECTURE':
        return renderLectureContent(content);
      case 'QUIZ':
        return renderQuizContent(content);
      case 'EXERCISE':
        return renderExerciseContent(content);
      default:
        return <p>Unsupported content type</p>;
    }
  };

  const getContentIcon = () => {
    switch (content.type) {
      case 'LECTURE':
        return <BookOpen className="h-5 w-5" />;
      case 'VIDEO':
        return <PlayCircle className="h-5 w-5" />;
      case 'QUIZ':
        return <CheckCircle className="h-5 w-5" />;
      case 'EXERCISE':
        return <Code className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getContentIcon()}
            <CardTitle>{content.title}</CardTitle>
          </div>
          {!isCompleted && onComplete && (
            <Button onClick={() => {
              setIsCompleted(true);
              onComplete();
            }}>
              Mark as Complete
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
