'use client';

import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Template for different content types
const CONTENT_TYPES = {
  LECTURE: {
    title: '',
    content: '',
    duration: '',
    learningObjectives: [''],
    keyPoints: [''],
    codeExamples: [''],
    references: [''],
  },
  QUIZ: {
    title: '',
    questions: [
      {
        question: '',
        options: [''],
        correctAnswer: 0,
        explanation: '',
      },
    ],
  },
  EXERCISE: {
    title: '',
    description: '',
    instructions: [''],
    starterCode: '',
    solutionCode: '',
    hints: [''],
  },
  PROJECT: {
    title: '',
    description: '',
    requirements: [''],
    resources: [''],
    deliverables: [''],
  },
};

interface CourseTemplateFormProps {
  onSave: (data: any) => void;
  initialData?: any;
}

export default function CourseTemplateForm({
  onSave,
  initialData,
}: CourseTemplateFormProps) {
  const [selectedType, setSelectedType] = useState('LECTURE');
  const [contentData, setContentData] = useState(
    initialData || { ...CONTENT_TYPES[selectedType as keyof typeof CONTENT_TYPES] }
  );

  const handleArrayFieldAdd = (field: string) => {
    setContentData((prev: any) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const handleArrayFieldRemove = (field: string, index: number) => {
    setContentData((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index),
    }));
  };

  const handleArrayFieldChange = (field: string, index: number, value: string) => {
    setContentData((prev: any) => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) =>
        i === index ? value : item
      ),
    }));
  };

  const handleSubmit = async () => {
    try {
      await onSave(contentData);
      toast.success('Content saved successfully');
    } catch (error) {
      toast.error('Failed to save content');
    }
  };

  const renderLectureForm = () => (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={contentData.title}
          onChange={(e) =>
            setContentData({ ...contentData, title: e.target.value })
          }
          placeholder="Enter lecture title"
        />
      </div>

      <div>
        <Label>Content</Label>
        <Textarea
          value={contentData.content}
          onChange={(e) =>
            setContentData({ ...contentData, content: e.target.value })
          }
          placeholder="Enter lecture content"
          className="h-32"
        />
      </div>

      <div>
        <Label>Duration (in minutes)</Label>
        <Input
          type="number"
          value={contentData.duration}
          onChange={(e) =>
            setContentData({ ...contentData, duration: e.target.value })
          }
          placeholder="Enter lecture duration"
        />
      </div>

      <div>
        <Label>Learning Objectives</Label>
        {contentData.learningObjectives.map((objective: string, index: number) => (
          <div key={index} className="flex gap-2 mt-2">
            <Input
              value={objective}
              onChange={(e) =>
                handleArrayFieldChange('learningObjectives', index, e.target.value)
              }
              placeholder={`Objective ${index + 1}`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleArrayFieldRemove('learningObjectives', index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleArrayFieldAdd('learningObjectives')}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Objective
        </Button>
      </div>

      <div>
        <Label>Key Points</Label>
        {contentData.keyPoints.map((point: string, index: number) => (
          <div key={index} className="flex gap-2 mt-2">
            <Input
              value={point}
              onChange={(e) =>
                handleArrayFieldChange('keyPoints', index, e.target.value)
              }
              placeholder={`Key Point ${index + 1}`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleArrayFieldRemove('keyPoints', index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleArrayFieldAdd('keyPoints')}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Key Point
        </Button>
      </div>

      <div>
        <Label>Code Examples</Label>
        {contentData.codeExamples.map((example: string, index: number) => (
          <div key={index} className="flex gap-2 mt-2">
            <Textarea
              value={example}
              onChange={(e) =>
                handleArrayFieldChange('codeExamples', index, e.target.value)
              }
              placeholder={`Code Example ${index + 1}`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleArrayFieldRemove('codeExamples', index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleArrayFieldAdd('codeExamples')}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Code Example
        </Button>
      </div>
    </div>
  );

  const renderQuizForm = () => (
    <div className="space-y-4">
      <div>
        <Label>Quiz Title</Label>
        <Input
          value={contentData.title}
          onChange={(e) =>
            setContentData({ ...contentData, title: e.target.value })
          }
          placeholder="Enter quiz title"
        />
      </div>

      {contentData.questions.map((question: any, qIndex: number) => (
        <Card key={qIndex}>
          <CardHeader>
            <CardTitle className="text-lg">Question {qIndex + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Question</Label>
              <Input
                value={question.question}
                onChange={(e) => {
                  const newQuestions = [...contentData.questions];
                  newQuestions[qIndex].question = e.target.value;
                  setContentData({ ...contentData, questions: newQuestions });
                }}
                placeholder="Enter question"
              />
            </div>

            <div>
              <Label>Options</Label>
              {question.options.map((option: string, oIndex: number) => (
                <div key={oIndex} className="flex gap-2 mt-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newQuestions = [...contentData.questions];
                      newQuestions[qIndex].options[oIndex] = e.target.value;
                      setContentData({ ...contentData, questions: newQuestions });
                    }}
                    placeholder={`Option ${oIndex + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newQuestions = [...contentData.questions];
                      newQuestions[qIndex].options = question.options.filter(
                        (_: any, i: number) => i !== oIndex
                      );
                      setContentData({ ...contentData, questions: newQuestions });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newQuestions = [...contentData.questions];
                  newQuestions[qIndex].options.push('');
                  setContentData({ ...contentData, questions: newQuestions });
                }}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>

            <div>
              <Label>Correct Answer</Label>
              <Select
                value={question.correctAnswer.toString()}
                onValueChange={(value) => {
                  const newQuestions = [...contentData.questions];
                  newQuestions[qIndex].correctAnswer = parseInt(value);
                  setContentData({ ...contentData, questions: newQuestions });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  {question.options.map((_: any, index: number) => (
                    <SelectItem key={index} value={index.toString()}>
                      Option {index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Explanation</Label>
              <Textarea
                value={question.explanation}
                onChange={(e) => {
                  const newQuestions = [...contentData.questions];
                  newQuestions[qIndex].explanation = e.target.value;
                  setContentData({ ...contentData, questions: newQuestions });
                }}
                placeholder="Explain the correct answer"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outline"
        onClick={() => {
          setContentData({
            ...contentData,
            questions: [
              ...contentData.questions,
              {
                question: '',
                options: [''],
                correctAnswer: 0,
                explanation: '',
              },
            ],
          });
        }}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Question
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <Label>Content Type</Label>
        <Select
          value={selectedType}
          onValueChange={(value) => {
            setSelectedType(value);
            setContentData({ ...CONTENT_TYPES[value as keyof typeof CONTENT_TYPES] });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select content type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LECTURE">Lecture</SelectItem>
            <SelectItem value="QUIZ">Quiz</SelectItem>
            <SelectItem value="EXERCISE">Exercise</SelectItem>
            <SelectItem value="PROJECT">Project</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedType === 'LECTURE' && renderLectureForm()}
      {selectedType === 'QUIZ' && renderQuizForm()}

      <Button onClick={handleSubmit} className="w-full">
        Save Content
      </Button>
    </div>
  );
}
