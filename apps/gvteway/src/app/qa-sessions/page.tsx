'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Button,
  Card,
  Field,
  Textarea,
  Grid,
  Stack,
  Badge,
  Alert,
  Modal,
  StatCard,
  Form,
  Kicker,
} from '@ghxstship/ui';
import { useQASessionsData, useSessionQuestions, type QASession } from '@/hooks/useQASessions';

export default function QASessionsPage() {
  const router = useRouter();
  const [selectedSession, setSelectedSession] = useState<QASession | null>(null);
  const [showAskModal, setShowAskModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live' | 'archived'>('all');

  const {
    sessions,
    isLoading: loading,
    error,
    askQuestion,
  } = useQASessionsData(filter);

  const { data: questions = [], refetch: refetchQuestions } = useSessionQuestions(selectedSession?.id || '');

  const handleAskQuestion = async () => {
    if (!selectedSession || !newQuestion.trim()) return;

    try {
      await askQuestion({ sessionId: selectedSession.id, content: newQuestion });
      setSuccess('Question submitted!');
      setShowAskModal(false);
      setNewQuestion('');
      refetchQuestions();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to submit question');
    }
  };

  const handleUpvote = async (questionId: string) => {
    try {
      await fetch(`/api/qa-sessions/questions/${questionId}/upvote`, { method: 'POST' });
      refetchQuestions();
    } catch {
      setLocalError('Failed to upvote');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'live') {
      return <Badge variant="solid" className="animate-pulse">{status.toUpperCase()}</Badge>;
    }
    return <Badge variant={status === 'upcoming' ? 'solid' : 'outline'}>{status.toUpperCase()}</Badge>;
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
    return <GvtewayLoadingLayout />;
  }

  const liveSessions = sessions.filter(s => s.status === 'live');
  const upcomingSessions = sessions.filter(s => s.status === 'upcoming');

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Q&A</Kicker>
              <H2 size="lg" className="text-white">Artist Q&A Sessions</H2>
              <Body className="text-on-dark-muted">
                Ask questions and interact with your favorite artists
              </Body>
            </Stack>

        {(error || localError) && (
          <Alert variant="error" className="mb-6" onClose={() => setLocalError(null)}>
            {error instanceof Error ? error.message : localError || String(error)}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Grid cols={4} gap={6}>
          <StatCard
            label="Live Now"
            value={liveSessions.length.toString()}
            inverted
          />
          <StatCard
            label="Upcoming"
            value={upcomingSessions.length.toString()}
            inverted
          />
          <StatCard
            label="Total Sessions"
            value={sessions.length.toString()}
            inverted
          />
          <StatCard
            label="Questions Asked"
            value={sessions.reduce((sum, s) => sum + s.questions_count, 0).toString()}
            inverted
          />
        </Grid>

        <Stack direction="horizontal" gap={4}>
          <Button
            variant={filter === 'all' ? 'solid' : 'outlineInk'}
            inverted={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All Sessions
          </Button>
          <Button
            variant={filter === 'live' ? 'solid' : 'outlineInk'}
            inverted={filter === 'live'}
            onClick={() => setFilter('live')}
          >
            🔴 Live Now
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'solid' : 'outlineInk'}
            inverted={filter === 'upcoming'}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </Button>
          <Button
            variant={filter === 'archived' ? 'solid' : 'outlineInk'}
            inverted={filter === 'archived'}
            onClick={() => setFilter('archived')}
          >
            Past Sessions
          </Button>
        </Stack>

        {liveSessions.length > 0 && filter !== 'archived' && (
          <Stack gap={4}>
            <H2 className="text-white">🔴 Live Now</H2>
            <Grid cols={2} gap={6}>
              {liveSessions.map(session => (
                <Card
                  key={session.id}
                  inverted
                  interactive
                  className="cursor-pointer p-6 ring-2 ring-error-500"
                  onClick={() => setSelectedSession(session)}
                >
                  <Stack direction="horizontal" gap={4}>
                    <Stack className="relative size-20 flex-shrink-0 overflow-hidden rounded-avatar bg-ink-800">
                      {session.artist_image ? (
                        <Image src={session.artist_image} alt={session.artist_name} fill className="object-cover" />
                      ) : (
                        <Stack className="flex size-full items-center justify-center">
                          <Body className="text-h3-md">🍤</Body>
                        </Stack>
                      )}
                    </Stack>
                    <Stack className="flex-1">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        {getStatusBadge(session.status)}
                        {session.is_member_only && <Badge variant="outline">Members Only</Badge>}
                      </Stack>
                      <H3 className="mt-2 text-white">{session.title}</H3>
                      <Body className="text-on-dark-muted">{session.artist_name}</Body>
                      <Stack direction="horizontal" gap={4} className="mt-2 text-on-dark-disabled">
                        <Body size="sm">{session.attendees_count} watching</Body>
                        <Body size="sm">{session.questions_count} questions</Body>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        )}

        <Grid cols={3} gap={6}>
          {sessions.filter(s => filter === 'all' || s.status === filter).map(session => (
            <Card
              key={session.id}
              inverted
              interactive
              className="cursor-pointer overflow-hidden"
              onClick={() => setSelectedSession(session)}
            >
              <Stack className="relative h-32 bg-ink-900">
                {session.artist_image ? (
                  <Image src={session.artist_image} alt={session.artist_name} fill className="object-cover" />
                ) : (
                  <Stack className="flex size-full items-center justify-center">
                    <Body className="text-h3-md">🍤</Body>
                  </Stack>
                )}
                <Stack className="absolute right-2 top-2">
                  {getStatusBadge(session.status)}
                </Stack>
              </Stack>
              <Stack className="p-4" gap={2}>
                <H3 className="line-clamp-1 text-white">{session.title}</H3>
                <Body className="text-on-dark-muted">{session.artist_name}</Body>
                <Body size="sm" className="text-on-dark-disabled">
                  {formatDate(session.scheduled_at)}
                </Body>
                <Stack direction="horizontal" className="mt-2 items-center justify-between">
                  <Body size="sm" className="font-mono text-on-dark-disabled">
                    {session.questions_count} questions
                  </Body>
                  {session.is_member_only && (
                    <Badge variant="outline">Members</Badge>
                  )}
                </Stack>
              </Stack>
            </Card>
          ))}
        </Grid>

        {sessions.length === 0 && (
          <Card inverted className="p-12 text-center">
            <H3 className="mb-4 text-white">No Q&A Sessions</H3>
            <Body className="mb-6 text-on-dark-muted">
              Check back soon for upcoming artist Q&A sessions
            </Body>
            <Button variant="solid" inverted onClick={() => router.push('/artists')}>
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
                <Stack className="relative size-16 shrink-0 overflow-hidden rounded-avatar bg-ink-200">
                  {selectedSession.artist_image ? (
                    <Image src={selectedSession.artist_image} alt={selectedSession.artist_name} fill className="object-cover" />
                  ) : (
                    <Stack className="flex size-full items-center justify-center">
                      <Body className="text-h6-md">🎤</Body>
                    </Stack>
                  )}
                </Stack>
                <Stack className="flex-1">
                  <Stack direction="horizontal" gap={2}>
                    {getStatusBadge(selectedSession.status)}
                  </Stack>
                  <H2>{selectedSession.title}</H2>
                  <Body className="text-on-light-muted">{selectedSession.artist_name}</Body>
                </Stack>
              </Stack>

              <Body>{selectedSession.description}</Body>

              <Stack direction="horizontal" className="items-center justify-between">
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
                      <Card key={question.id} className={`p-4 ${question.is_answered ? 'ring-2 ring-success-400' : ''}`}>
                        <Stack gap={2}>
                          <Stack direction="horizontal" className="items-start justify-between">
                            <Stack>
                              <Body className="font-display">{question.content}</Body>
                              <Body size="sm" className="font-mono text-on-light-muted">
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
                            <Card className="mt-2 border-l-4 border-success-500 p-3">
                              <Body size="sm" className="font-display text-success-700">Answer:</Body>
                              <Body size="sm">{question.answer}</Body>
                            </Card>
                          )}
                        </Stack>
                      </Card>
                    ))
                ) : (
                  <Body className="py-8 text-center text-on-light-muted">
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
              <Body size="sm" className="text-on-light-muted">
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
    </GvtewayAppLayout>
  );
}
