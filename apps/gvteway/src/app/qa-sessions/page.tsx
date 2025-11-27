'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ConsumerNavigationPublic } from '../../components/navigation';
import {
  Container,
  Section,
  H1,
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
  Modal,
  LoadingSpinner,
  StatCard,
  Form,
} from '@ghxstship/ui';

interface QASession {
  id: string;
  artist_id: string;
  artist_name: string;
  artist_image?: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'upcoming' | 'live' | 'ended' | 'archived';
  questions_count: number;
  attendees_count: number;
  is_member_only: boolean;
}

interface Question {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  content: string;
  upvotes: number;
  is_answered: boolean;
  answer?: string;
  answered_at?: string;
  created_at: string;
}

export default function QASessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<QASession[]>([]);
  const [selectedSession, setSelectedSession] = useState<QASession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAskModal, setShowAskModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live' | 'archived'>('all');

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);

      const response = await fetch(`/api/qa-sessions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      setError('Failed to load Q&A sessions');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchQuestions = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/qa-sessions/${sessionId}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (err) {
      setError('Failed to load questions');
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (selectedSession) {
      fetchQuestions(selectedSession.id);
    }
  }, [selectedSession, fetchQuestions]);

  const handleAskQuestion = async () => {
    if (!selectedSession || !newQuestion.trim()) return;

    try {
      const response = await fetch(`/api/qa-sessions/${selectedSession.id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newQuestion }),
      });

      if (response.ok) {
        setSuccess('Question submitted!');
        setShowAskModal(false);
        setNewQuestion('');
        fetchQuestions(selectedSession.id);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit question');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleUpvote = async (questionId: string) => {
    try {
      await fetch(`/api/qa-sessions/questions/${questionId}/upvote`, { method: 'POST' });
      setQuestions(questions.map(q =>
        q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q
      ));
    } catch (err) {
      setError('Failed to upvote');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      upcoming: 'bg-info-500 text-white',
      live: 'bg-error-500 text-white animate-pulse',
      ended: 'bg-grey-500 text-white',
      archived: 'bg-grey-400 text-white',
    };
    return <Badge className={variants[status] || ''}>{status.toUpperCase()}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading sessions..." />
        </Container>
      </Section>
    );
  }

  const liveSessions = sessions.filter(s => s.status === 'live');
  const upcomingSessions = sessions.filter(s => s.status === 'upcoming');

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
        <Stack gap={2} className="border-b-2 border-black pb-8">
          <H1>Artist Q&A Sessions</H1>
          <Body className="text-grey-600">
            Ask questions and interact with your favorite artists
          </Body>
        </Stack>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Grid cols={4} gap={6} className="mb-8">
          <StatCard
            label="Live Now"
            value={liveSessions.length}
            icon={<Body>🔴</Body>}
          />
          <StatCard
            label="Upcoming"
            value={upcomingSessions.length}
            icon={<Body>📅</Body>}
          />
          <StatCard
            label="Total Sessions"
            value={sessions.length}
            icon={<Body>🎤</Body>}
          />
          <StatCard
            label="Questions Asked"
            value={sessions.reduce((sum, s) => sum + s.questions_count, 0)}
            icon={<Body>❓</Body>}
          />
        </Grid>

        <Stack direction="horizontal" gap={4} className="mb-6">
          <Button
            variant={filter === 'all' ? 'solid' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Sessions
          </Button>
          <Button
            variant={filter === 'live' ? 'solid' : 'outline'}
            onClick={() => setFilter('live')}
          >
            🔴 Live Now
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'solid' : 'outline'}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </Button>
          <Button
            variant={filter === 'archived' ? 'solid' : 'outline'}
            onClick={() => setFilter('archived')}
          >
            Past Sessions
          </Button>
        </Stack>

        {liveSessions.length > 0 && filter !== 'archived' && (
          <Section className="mb-8">
            <H2 className="mb-4">🔴 LIVE NOW</H2>
            <Grid cols={2} gap={6}>
              {liveSessions.map(session => (
                <Card
                  key={session.id}
                  className="p-6 border-2 border-error-500 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedSession(session)}
                >
                  <Stack direction="horizontal" gap={4}>
                    <Stack className="w-20 h-20 rounded-full bg-grey-200 overflow-hidden relative flex-shrink-0">
                      {session.artist_image ? (
                        <Image src={session.artist_image} alt={session.artist_name} fill className="object-cover" />
                      ) : (
                        <Stack className="w-full h-full flex items-center justify-center">
                          <Body className="text-2xl">🎤</Body>
                        </Stack>
                      )}
                    </Stack>
                    <Stack className="flex-1">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        {getStatusBadge(session.status)}
                        {session.is_member_only && <Badge variant="outline">Members Only</Badge>}
                      </Stack>
                      <H3 className="mt-2">{session.title}</H3>
                      <Body className="text-grey-600">{session.artist_name}</Body>
                      <Stack direction="horizontal" gap={4} className="mt-2 text-sm text-grey-500">
                        <Body>{session.attendees_count} watching</Body>
                        <Body>{session.questions_count} questions</Body>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Section>
        )}

        <Grid cols={3} gap={6}>
          {sessions.filter(s => filter === 'all' || s.status === filter).map(session => (
            <Card
              key={session.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedSession(session)}
            >
              <Stack className="relative h-32 bg-grey-100">
                {session.artist_image ? (
                  <Image src={session.artist_image} alt={session.artist_name} fill className="object-cover" />
                ) : (
                  <Stack className="w-full h-full flex items-center justify-center">
                    <Body className="text-4xl">🎤</Body>
                  </Stack>
                )}
                <Stack className="absolute top-2 right-2">
                  {getStatusBadge(session.status)}
                </Stack>
              </Stack>
              <Stack className="p-4" gap={2}>
                <H3 className="line-clamp-1">{session.title}</H3>
                <Body className="text-grey-600">{session.artist_name}</Body>
                <Body className="text-sm text-grey-500">
                  {formatDate(session.scheduled_at)}
                </Body>
                <Stack direction="horizontal" className="justify-between items-center mt-2">
                  <Body className="text-xs text-grey-500">
                    {session.questions_count} questions
                  </Body>
                  {session.is_member_only && (
                    <Badge variant="outline" className="text-xs">Members</Badge>
                  )}
                </Stack>
              </Stack>
            </Card>
          ))}
        </Grid>

        {sessions.length === 0 && (
          <Card className="p-12 text-center">
            <H3 className="mb-4">NO Q&A SESSIONS</H3>
            <Body className="text-grey-600 mb-6">
              Check back soon for upcoming artist Q&A sessions
            </Body>
            <Button variant="solid" onClick={() => router.push('/artists')}>
              Browse Artists
            </Button>
          </Card>
        )}

        <Modal
          open={!!selectedSession}
          onClose={() => {
            setSelectedSession(null);
            setQuestions([]);
          }}
          title=""
        >
          {selectedSession && (
            <Stack gap={6}>
              <Stack direction="horizontal" gap={4} className="items-center">
                <Stack className="w-16 h-16 rounded-full bg-grey-200 overflow-hidden relative flex-shrink-0">
                  {selectedSession.artist_image ? (
                    <Image src={selectedSession.artist_image} alt={selectedSession.artist_name} fill className="object-cover" />
                  ) : (
                    <Stack className="w-full h-full flex items-center justify-center">
                      <Body className="text-xl">🎤</Body>
                    </Stack>
                  )}
                </Stack>
                <Stack className="flex-1">
                  <Stack direction="horizontal" gap={2}>
                    {getStatusBadge(selectedSession.status)}
                  </Stack>
                  <H2>{selectedSession.title}</H2>
                  <Body className="text-grey-600">{selectedSession.artist_name}</Body>
                </Stack>
              </Stack>

              <Body>{selectedSession.description}</Body>

              <Stack direction="horizontal" className="justify-between items-center">
                <H3>Questions ({questions.length})</H3>
                {(selectedSession.status === 'live' || selectedSession.status === 'upcoming') && (
                  <Button variant="solid" onClick={() => setShowAskModal(true)}>
                    Ask a Question
                  </Button>
                )}
              </Stack>

              <Stack gap={4} className="max-h-96 overflow-y-auto">
                {questions.length > 0 ? (
                  questions
                    .sort((a, b) => b.upvotes - a.upvotes)
                    .map(question => (
                      <Card key={question.id} className={`p-4 ${question.is_answered ? 'bg-success-50 border-success-200' : ''}`}>
                        <Stack gap={2}>
                          <Stack direction="horizontal" className="justify-between items-start">
                            <Stack>
                              <Body className="font-bold">{question.content}</Body>
                              <Body className="text-xs text-grey-500">
                                Asked by {question.user_name}
                              </Body>
                            </Stack>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpvote(question.id)}
                            >
                              👍 {question.upvotes}
                            </Button>
                          </Stack>
                          {question.is_answered && question.answer && (
                            <Card className="p-3 bg-white border-l-4 border-success-500 mt-2">
                              <Body className="text-sm font-bold text-success-700">Answer:</Body>
                              <Body className="text-sm">{question.answer}</Body>
                            </Card>
                          )}
                        </Stack>
                      </Card>
                    ))
                ) : (
                  <Body className="text-center text-grey-500 py-8">
                    No questions yet. Be the first to ask!
                  </Body>
                )}
              </Stack>
            </Stack>
          )}
        </Modal>

        <Modal
          open={showAskModal}
          onClose={() => setShowAskModal(false)}
          title="Ask a Question"
        >
          <Form onSubmit={handleAskQuestion}>
            <Stack gap={4}>
              <Field label="Your Question" required>
                <Textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="What would you like to ask?"
                  rows={4}
                  required
                />
              </Field>
              <Body className="text-sm text-grey-500">
                Questions are moderated. Be respectful and keep it relevant.
              </Body>
              <Stack direction="horizontal" gap={4}>
                <Button type="submit" variant="solid">
                  Submit Question
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAskModal(false)}>
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Form>
        </Modal>
        </Stack>
      </Container>
    </Section>
  );
}
