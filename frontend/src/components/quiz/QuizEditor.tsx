'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

interface QuizEditorProps {
  initialContent?: {
    title: string;
    description: string;
    questions: Question[];
    passingScore?: number;
  };
  onChange: (content: any) => void;
}

export default function QuizEditor({ initialContent, onChange }: QuizEditorProps) {
  const [title, setTitle] = useState(initialContent?.title || '');
  const [description, setDescription] = useState(initialContent?.description || '');
  const [questions, setQuestions] = useState<Question[]>(initialContent?.questions || []);
  const [passingScore, setPassingScore] = useState(initialContent?.passingScore || 70);

  const updateContent = (newData: any) => {
    const content = {
      title,
      description,
      questions,
      passingScore,
      ...newData,
    };
    onChange(content);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      type: 'multiple_choice',
      options: ['', ''],
      correctAnswer: '',
    };
    const newQuestions = [...questions, newQuestion];
    setQuestions(newQuestions);
    updateContent({ questions: newQuestions });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value,
    };
    setQuestions(newQuestions);
    updateContent({ questions: newQuestions });
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options = [
      ...(newQuestions[questionIndex].options || []),
      '',
    ];
    setQuestions(newQuestions);
    updateContent({ questions: newQuestions });
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    if (!newQuestions[questionIndex].options) {
      newQuestions[questionIndex].options = [];
    }
    newQuestions[questionIndex].options![optionIndex] = value;
    setQuestions(newQuestions);
    updateContent({ questions: newQuestions });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    updateContent({ questions: newQuestions });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options?.filter(
      (_, i) => i !== optionIndex
    );
    setQuestions(newQuestions);
    updateContent({ questions: newQuestions });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Quiz Title</label>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              updateContent({ title: e.target.value });
            }}
            placeholder="Enter quiz title"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              updateContent({ description: e.target.value });
            }}
            placeholder="Enter quiz description"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Passing Score (%)</label>
          <Input
            type="number"
            min="0"
            max="100"
            value={passingScore}
            onChange={(e) => {
              setPassingScore(Number(e.target.value));
              updateContent({ passingScore: Number(e.target.value) });
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Questions</h3>
          <Button onClick={addQuestion} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {questions.map((question, questionIndex) => (
          <Card key={question.id} className="relative">
            <CardContent className="pt-6 space-y-4">
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(questionIndex)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium">Question Type</label>
                <Select
                  value={question.type}
                  onValueChange={(value: 'multiple_choice' | 'true_false' | 'short_answer') => {
                    updateQuestion(questionIndex, 'type', value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Question Text</label>
                <Textarea
                  value={question.text}
                  onChange={(e) =>
                    updateQuestion(questionIndex, 'text', e.target.value)
                  }
                  placeholder="Enter question text"
                />
              </div>

              {question.type === 'multiple_choice' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Options</label>
                  {question.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) =>
                          updateOption(questionIndex, optionIndex, e.target.value)
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(questionIndex, optionIndex)}
                        disabled={question.options?.length === 2}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addOption(questionIndex)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              )}

              {question.type === 'true_false' && (
                <div>
                  <label className="text-sm font-medium">Correct Answer</label>
                  <Select
                    value={question.correctAnswer as string}
                    onValueChange={(value) =>
                      updateQuestion(questionIndex, 'correctAnswer', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {question.type === 'multiple_choice' && (
                <div>
                  <label className="text-sm font-medium">Correct Answer</label>
                  <Select
                    value={question.correctAnswer as string}
                    onValueChange={(value) =>
                      updateQuestion(questionIndex, 'correctAnswer', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options?.map((option, optionIndex) => (
                        <SelectItem key={optionIndex} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {question.type === 'short_answer' && (
                <div>
                  <label className="text-sm font-medium">Correct Answer</label>
                  <Input
                    value={question.correctAnswer as string}
                    onChange={(e) =>
                      updateQuestion(questionIndex, 'correctAnswer', e.target.value)
                    }
                    placeholder="Enter correct answer"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Explanation (Optional)</label>
                <Textarea
                  value={question.explanation || ''}
                  onChange={(e) =>
                    updateQuestion(questionIndex, 'explanation', e.target.value)
                  }
                  placeholder="Enter explanation for the correct answer"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
