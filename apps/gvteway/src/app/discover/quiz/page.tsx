'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConsumerNavigationPublic } from '@/components/navigation';
import {
  Container,
  Section,
  H2,
  H3,
  Body,
  Button,
  Card,
  Grid,
  Stack,
  Badge,
  Alert,
  LoadingSpinner,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  Kicker,
} from '@ghxstship/ui';
import Image from 'next/image';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple';
  options: { id: string; label: string; icon?: string }[];
}

interface QuizResult {
  categories: string[];
  genres: string[];
  price_range: string;
  vibe: string;
  recommended_events: {
    id: string;
    title: string;
    date: string;
    venue: string;
    image?: string;
    match_score: number;
  }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'event_type',
    question: 'What type of events do you enjoy most?',
    type: 'multiple',
    options: [
      { id: 'concert', label: 'Concerts', icon: '🎸' },
      { id: 'festival', label: 'Festivals', icon: '🎪' },
      { id: 'theater', label: 'Theater', icon: '🎭' },
      { id: 'sports', label: 'Sports', icon: '⚽' },
      { id: 'comedy', label: 'Comedy', icon: '😂' },
      { id: 'dance', label: 'Dance/Club', icon: '💃' },
    ],
  },
  {
    id: 'music_genre',
    question: 'What music genres do you love?',
    type: 'multiple',
    options: [
      { id: 'pop', label: 'Pop', icon: '🎤' },
      { id: 'rock', label: 'Rock', icon: '🎸' },
      { id: 'hiphop', label: 'Hip-Hop', icon: '🎧' },
      { id: 'electronic', label: 'Electronic', icon: '🎹' },
      { id: 'country', label: 'Country', icon: '🤠' },
      { id: 'jazz', label: 'Jazz/Blues', icon: '🎷' },
      { id: 'classical', label: 'Classical', icon: '🎻' },
      { id: 'latin', label: 'Latin', icon: '💃' },
    ],
  },
  {
    id: 'crowd_size',
    question: 'What crowd size do you prefer?',
    type: 'single',
    options: [
      { id: 'intimate', label: 'Intimate (under 500)', icon: '👥' },
      { id: 'medium', label: 'Medium (500-5,000)', icon: '👥👥' },
      { id: 'large', label: 'Large (5,000-20,000)', icon: '👥👥👥' },
      { id: 'massive', label: 'Massive (20,000+)', icon: '🏟️' },
    ],
  },
  {
    id: 'budget',
    question: 'What\'s your typical budget for events?',
    type: 'single',
    options: [
      { id: 'budget', label: 'Budget-friendly (under $50)', icon: '💵' },
      { id: 'moderate', label: 'Moderate ($50-$150)', icon: '💵💵' },
      { id: 'premium', label: 'Premium ($150-$300)', icon: '💵💵💵' },
      { id: 'vip', label: 'VIP/No limit', icon: '💎' },
    ],
  },
  {
    id: 'vibe',
    question: 'What vibe are you looking for?',
    type: 'single',
    options: [
      { id: 'energetic', label: 'High energy & dancing', icon: '⚡' },
      { id: 'chill', label: 'Chill & relaxed', icon: '😌' },
      { id: 'social', label: 'Social & networking', icon: '🤝' },
      { id: 'immersive', label: 'Immersive & artistic', icon: '🎨' },
    ],
  },
  {
    id: 'frequency',
    question: 'How often do you attend events?',
    type: 'single',
    options: [
      { id: 'weekly', label: 'Weekly', icon: '📅' },
      { id: 'monthly', label: 'Monthly', icon: '📆' },
      { id: 'quarterly', label: 'A few times a year', icon: '🗓️' },
      { id: 'special', label: 'Special occasions only', icon: '🎉' },
    ],
  },
];

export default function DiscoveryQuizPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = QUIZ_QUESTIONS[currentStep];
  const isLastQuestion = currentStep === QUIZ_QUESTIONS.length - 1;

  const handleOptionSelect = (optionId: string) => {
    const questionId = currentQuestion.id;
    const currentAnswers = answers[questionId] || [];

    if (currentQuestion.type === 'single') {
      setAnswers({ ...answers, [questionId]: [optionId] });
    } else {
      if (currentAnswers.includes(optionId)) {
        setAnswers({
          ...answers,
          [questionId]: currentAnswers.filter(a => a !== optionId),
        });
      } else {
        setAnswers({
          ...answers,
          [questionId]: [...currentAnswers, optionId],
        });
      }
    }
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      await submitQuiz();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitQuiz = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/discover/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
      } else {
        setError('Failed to get recommendations');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setCurrentStep(0);
    setAnswers({});
    setResults(null);
  };

  if (loading) {
    return (
      <PageLayout
        background="black"
        header={<ConsumerNavigationPublic />}
        footer={
          <Footer
            logo={<Display size="md">GVTEWAY</Display>}
            copyright="© 2024 GHXSTSHIP INDUSTRIES."
          >
            <FooterColumn title="Discover">
              <FooterLink href="/discover/quiz">Quiz</FooterLink>
            </FooterColumn>
          </Footer>
        }
      >
        <Section background="black" className="relative min-h-screen overflow-hidden py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
          <Container className="relative z-10 flex min-h-[60vh] items-center justify-center">
            <Stack className="items-center" gap={4}>
              <LoadingSpinner size="lg" />
              <Body className="text-on-dark-muted">Finding your perfect events...</Body>
            </Stack>
          </Container>
        </Section>
      </PageLayout>
    );
  }

  if (results) {
    return (
      <PageLayout
        background="black"
        header={<ConsumerNavigationPublic />}
        footer={
          <Footer
            logo={<Display size="md">GVTEWAY</Display>}
            copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
          >
            <FooterColumn title="Discover">
              <FooterLink href="/discover/quiz">Quiz</FooterLink>
              <FooterLink href="/browse">Browse Events</FooterLink>
            </FooterColumn>
            <FooterColumn title="Legal">
              <FooterLink href="/legal/privacy">Privacy</FooterLink>
              <FooterLink href="/legal/terms">Terms</FooterLink>
            </FooterColumn>
          </Footer>
        }
      >
        <Section background="black" className="relative min-h-screen overflow-hidden py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
          <Container className="relative z-10">
            <Stack gap={10}>
              {/* Page Header */}
              <Stack gap={2}>
                <Kicker colorScheme="on-dark">Results</Kicker>
                <H2 size="lg" className="text-white">Your Results</H2>
                <Body className="text-on-dark-muted">Based on your preferences, here&apos;s what we recommend</Body>
              </Stack>

          <Grid cols={3} gap={8}>
            <Stack className="col-span-2" gap={6}>
              <Card className="p-6">
                <H2 className="mb-6">RECOMMENDED EVENTS</H2>
                <Stack gap={4}>
                  {results.recommended_events.map(event => (
                    <Card
                      key={event.id}
                      className="p-4 cursor-pointer hover:bg-ink-50"
                      onClick={() => router.push(`/events/${event.id}`)}
                    >
                      <Stack direction="horizontal" gap={4}>
                        {event.image && (
                          <Stack className="w-24 h-24 bg-ink-200 rounded overflow-hidden flex-shrink-0 relative">
                            <Image
                              src={event.image}
                              alt={event.title}
                              fill
                              className="object-cover"
                            />
                          </Stack>
                        )}
                        <Stack className="flex-1">
                          <Stack direction="horizontal" className="justify-between items-start">
                            <Body className="font-bold">{event.title}</Body>
                            <Badge className="bg-success-500 text-white">
                              {event.match_score}% Match
                            </Badge>
                          </Stack>
                          <Body className="text-ink-600">{event.date}</Body>
                          <Body className="text-ink-500 text-body-sm">{event.venue}</Body>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Card>
            </Stack>

            <Stack gap={6}>
              <Card className="p-6">
                <H3 className="mb-4">YOUR PROFILE</H3>
                <Stack gap={4}>
                  <Stack>
                    <Label className="text-ink-500">Categories</Label>
                    <Stack direction="horizontal" gap={2} className="flex-wrap mt-1">
                      {results.categories.map(cat => (
                        <Badge key={cat}>{cat}</Badge>
                      ))}
                    </Stack>
                  </Stack>

                  <Stack>
                    <Label className="text-ink-500">Genres</Label>
                    <Stack direction="horizontal" gap={2} className="flex-wrap mt-1">
                      {results.genres.map(genre => (
                        <Badge key={genre} variant="outline">{genre}</Badge>
                      ))}
                    </Stack>
                  </Stack>

                  <Stack>
                    <Label className="text-ink-500">Budget</Label>
                    <Body>{results.price_range}</Body>
                  </Stack>

                  <Stack>
                    <Label className="text-ink-500">Vibe</Label>
                    <Body>{results.vibe}</Body>
                  </Stack>
                </Stack>
              </Card>

              <Stack gap={2}>
                <Button variant="solid" onClick={() => router.push('/browse')}>
                  Browse All Events
                </Button>
                <Button variant="outline" onClick={handleRetake}>
                  Retake Quiz
                </Button>
              </Stack>
            </Stack>
          </Grid>
            </Stack>
          </Container>
        </Section>
      </PageLayout>
    );
  }

  const selectedOptions = answers[currentQuestion.id] || [];

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Discover">
            <FooterLink href="/discover/quiz">Quiz</FooterLink>
            <FooterLink href="/browse">Browse Events</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Discover</Kicker>
              <H2 size="lg" className="text-white">Discovery Quiz</H2>
              <Body className="text-on-dark-muted">Answer a few questions to find your perfect events</Body>
            </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Stack className="max-w-2xl mx-auto" gap={8}>
          <Stack className="w-full bg-ink-200 h-2 rounded-full overflow-hidden">
            <Stack
              className="bg-black h-full transition-all"
              style={{ '--progress-width': `${((currentStep + 1) / QUIZ_QUESTIONS.length) * 100}%`, width: 'var(--progress-width)' } as React.CSSProperties}
            />
          </Stack>

          <Card className="p-8">
            <Body className="text-ink-500 mb-2">
              Question {currentStep + 1} of {QUIZ_QUESTIONS.length}
            </Body>
            <H2 className="mb-6">{currentQuestion.question}</H2>

            {currentQuestion.type === 'multiple' && (
              <Body className="text-ink-500 mb-4">Select all that apply</Body>
            )}

            <Grid cols={2} gap={3}>
              {currentQuestion.options.map(option => (
                <Card
                  key={option.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedOptions.includes(option.id)
                      ? 'bg-black text-white'
                      : 'hover:bg-ink-100'
                  }`}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <Stack direction="horizontal" gap={3} className="items-center">
                    {option.icon && <Body className="text-h5-md">{option.icon}</Body>}
                    <Body className={selectedOptions.includes(option.id) ? 'text-white' : ''}>
                      {option.label}
                    </Body>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Card>

          <Stack direction="horizontal" className="justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <Button
              variant="solid"
              onClick={handleNext}
              disabled={selectedOptions.length === 0}
            >
              {isLastQuestion ? 'Get Results' : 'Next'}
            </Button>
          </Stack>
        </Stack>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <Body className={`text-body-sm font-weight-medium ${className || ''}`}>{children}</Body>;
}
