'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Container,
  Section,
  Display,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  LoadingSpinner,
  Text,
  Box,
} from '@ghxstship/ui';
import Image from 'next/image';

interface SurveyQuestion {
  id: string;
  type: 'rating' | 'text' | 'multiple_choice' | 'checkbox' | 'scale';
  question: string;
  required: boolean;
  options?: string[];
  min_label?: string;
  max_label?: string;
}

interface Survey {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_image?: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  expires_at?: string;
}

export default function SurveyPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const fetchSurvey = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/surveys/${surveyId}`);
      if (response.ok) {
        const data = await response.json();
        setSurvey(data.survey);
      } else {
        setError('Survey not found');
      }
    } catch (err) {
      setError('Failed to load survey');
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  useEffect(() => {
    fetchSurvey();
  }, [fetchSurvey]);

  const handleSubmit = async () => {
    if (!survey) return;

    // Validate required questions
    const unanswered = survey.questions.filter(
      q => q.required && !answers[q.id]
    );

    if (unanswered.length > 0) {
      setError(`Please answer all required questions`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/surveys/${surveyId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit survey');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const updateAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const renderQuestion = (question: SurveyQuestion) => {
    switch (question.type) {
      case 'rating':
        return (
          <Stack direction="horizontal" gap={2}>
            {[1, 2, 3, 4, 5].map(star => (
              <Button
                key={star}
                type="button"
                variant="ghost"
                className={`text-3xl p-2 ${
                  star <= (answers[question.id] || 0) ? 'text-yellow-500' : 'text-gray-300'
                }`}
                onClick={() => updateAnswer(question.id, star)}
              >
                ★
              </Button>
            ))}
          </Stack>
        );

      case 'scale':
        return (
          <Stack gap={2}>
            <Stack direction="horizontal" className="justify-between">
              <Body className="text-sm text-gray-500">{question.min_label || '1'}</Body>
              <Body className="text-sm text-gray-500">{question.max_label || '10'}</Body>
            </Stack>
            <Stack direction="horizontal" gap={1}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <Button
                  key={num}
                  type="button"
                  variant={answers[question.id] === num ? 'solid' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => updateAnswer(question.id, num)}
                >
                  {num}
                </Button>
              ))}
            </Stack>
          </Stack>
        );

      case 'multiple_choice':
        return (
          <Stack gap={2}>
            {question.options?.map(option => (
              <Button
                key={option}
                type="button"
                variant={answers[question.id] === option ? 'solid' : 'outline'}
                className="w-full text-left justify-start"
                onClick={() => updateAnswer(question.id, option)}
              >
                {option}
              </Button>
            ))}
          </Stack>
        );

      case 'checkbox':
        const selected = answers[question.id] || [];
        return (
          <Stack gap={2}>
            {question.options?.map(option => (
              <Button
                key={option}
                type="button"
                variant={selected.includes(option) ? 'solid' : 'outline'}
                className="w-full text-left justify-start"
                onClick={() => {
                  const newSelected = selected.includes(option)
                    ? selected.filter((o: string) => o !== option)
                    : [...selected, option];
                  updateAnswer(question.id, newSelected);
                }}
              >
                {option}
              </Button>
            ))}
          </Stack>
        );

      case 'text':
      default:
        return (
          <Textarea
            value={answers[question.id] || ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            placeholder="Your answer..."
            rows={4}
          />
        );
    }
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </Section>
    );
  }

  if (!survey) {
    return (
      <Section className="min-h-screen bg-white">
        <Container>
          <Card className="p-12 text-center mt-12">
            <H2 className="mb-4">SURVEY NOT FOUND</H2>
            <Body className="text-gray-600 mb-6">
              This survey may have expired or been removed.
            </Body>
            <Button variant="solid" onClick={() => router.push('/my-events')}>
              View My Events
            </Button>
          </Card>
        </Container>
      </Section>
    );
  }

  if (success) {
    return (
      <Section className="min-h-screen bg-white">
        <Container>
          <Card className="p-12 text-center mt-12">
            <H2 className="mb-4">THANK YOU!</H2>
            <Body className="text-gray-600 mb-6">
              Your feedback has been submitted. We appreciate you taking the time to share your experience.
            </Body>
            <Button variant="solid" onClick={() => router.push('/my-events')}>
              Back to My Events
            </Button>
          </Card>
        </Container>
      </Section>
    );
  }

  const questionsPerPage = 3;
  const totalPages = Math.ceil(survey.questions.length / questionsPerPage);
  const currentQuestions = survey.questions.slice(
    currentStep * questionsPerPage,
    (currentStep + 1) * questionsPerPage
  );

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Section className="border-b-2 border-black py-8 mb-8">
          <Display>{survey.title}</Display>
          {survey.description && (
            <Body className="mt-2 text-gray-600">{survey.description}</Body>
          )}
        </Section>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Grid cols={3} gap={8}>
          <Stack className="col-span-2" gap={6}>
            {currentQuestions.map((question, index) => (
              <Card key={question.id} className="p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-start">
                    <Body className="text-gray-500">
                      {currentStep * questionsPerPage + index + 1}.
                    </Body>
                    <Stack className="flex-1">
                      <Body className="font-medium">
                        {question.question}
                        {question.required && <Text className="text-red-500 ml-1">*</Text>}
                      </Body>
                    </Stack>
                  </Stack>
                  {renderQuestion(question)}
                </Stack>
              </Card>
            ))}

            <Stack direction="horizontal" className="justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 0}
              >
                Previous
              </Button>

              <Body className="text-gray-500">
                Page {currentStep + 1} of {totalPages}
              </Body>

              {currentStep < totalPages - 1 ? (
                <Button
                  variant="solid"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="solid"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Survey'}
                </Button>
              )}
            </Stack>
          </Stack>

          <Stack>
            <Card className="p-6 sticky top-6">
              <H3 className="mb-4">EVENT</H3>
              {survey.event_image && (
                <Box className="h-32 bg-gray-100 mb-4 overflow-hidden relative">
                  <Image
                    src={survey.event_image}
                    alt={survey.event_title}
                    fill
                    className="object-cover"
                  />
                </Box>
              )}
              <Body className="font-bold">{survey.event_title}</Body>
              <Body className="text-gray-600 text-sm">{survey.event_date}</Body>

              <Stack className="mt-6 pt-4 border-t border-gray-200">
                <H3 className="mb-2">PROGRESS</H3>
                <Stack className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <Stack
                    className="bg-black h-full transition-all"
                    style={{
                      width: `${(Object.keys(answers).length / survey.questions.length) * 100}%`,
                    }}
                  />
                </Stack>
                <Body className="text-sm text-gray-500 mt-2">
                  {Object.keys(answers).length} of {survey.questions.length} answered
                </Body>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Container>
    </Section>
  );
}
