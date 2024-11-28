'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

interface QuizPreviewProps {
  content: {
    title: string;
    description: string;
    questions: Question[];
    passingScore: number;
  };
  onComplete?: (score: number, answers: Record<string, string>) => void;
}

export default function QuizPreview({ content, onComplete }: QuizPreviewProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    let correctAnswers = 0;
    content.questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / content.questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);
    onComplete?.(finalScore, answers);
  };

  const isAnswerCorrect = (questionId: string) => {
    const question = content.questions.find((q) => q.id === questionId);
    return question && answers[questionId] === question.correctAnswer;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{content.title}</h2>
        <p className="text-muted-foreground mt-2">{content.description}</p>
        {!submitted && (
          <p className="text-sm text-muted-foreground mt-4">
            Passing score: {content.passingScore}%
          </p>
        )}
        {submitted && (
          <div className="mt-4 p-4 rounded-lg bg-muted">
            <p className="text-lg font-medium">
              Your score: {score}% {score >= content.passingScore ? '(Passed)' : '(Failed)'}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {content.questions.map((question) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-start gap-2">
                <span>{question.text}</span>
                {submitted && (
                  isAnswerCorrect(question.id) ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(question.type === 'multiple_choice' || question.type === 'true_false') && (
                <RadioGroup
                  value={answers[question.id]}
                  onValueChange={(value) => {
                    if (!submitted) {
                      setAnswers({ ...answers, [question.id]: value });
                    }
                  }}
                  className="space-y-2"
                >
                  {(question.type === 'true_false' ? ['true', 'false'] : question.options).map(
                    (option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={option}
                          id={`${question.id}-${index}`}
                          disabled={submitted}
                        />
                        <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
                      </div>
                    )
                  )}
                </RadioGroup>
              )}

              {question.type === 'short_answer' && (
                <Input
                  value={answers[question.id] || ''}
                  onChange={(e) => {
                    if (!submitted) {
                      setAnswers({ ...answers, [question.id]: e.target.value });
                    }
                  }}
                  disabled={submitted}
                  placeholder="Enter your answer"
                />
              )}

              {submitted && question.explanation && (
                <div className="mt-4">
                  <p className="text-sm font-medium">Explanation:</p>
                  <p className="text-sm text-muted-foreground">{question.explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!submitted && (
        <Button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length !== content.questions.length}
        >
          Submit Quiz
        </Button>
      )}
    </div>
  );
}
