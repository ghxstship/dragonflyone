'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ConsumerNavigationPublic } from '../../../components/navigation';
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
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  LoadingSpinner,
} from '@ghxstship/ui';

interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

interface Poll {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  total_votes: number;
  status: 'active' | 'closed' | 'upcoming';
  ends_at?: string;
  created_at: string;
  event_id?: string;
  event_title?: string;
  user_voted?: string;
  category: string;
}

export default function CommunityPollsPage() {
  const router = useRouter();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState('active');
  const [category, setCategory] = useState('all');

  const fetchPolls = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: filter,
        ...(category !== 'all' && { category }),
      });

      const response = await fetch(`/api/community/polls?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPolls(data.polls || []);
      }
    } catch (err) {
      console.error('Failed to fetch polls');
    } finally {
      setLoading(false);
    }
  }, [filter, category]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const handleVote = async (pollId: string, optionId: string) => {
    setVoting(pollId);
    setError(null);

    try {
      const response = await fetch(`/api/community/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option_id: optionId }),
      });

      if (response.ok) {
        setSuccess('Vote recorded!');
        fetchPolls();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to vote');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setVoting(null);
    }
  };

  const getTimeRemaining = (endsAt: string) => {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Ending soon';
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading polls..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
        <Stack gap={2} className="border-b-2 border-black pb-8">
          <H1>Community Polls</H1>
          <Body className="text-grey-600">
            Vote on upcoming events, setlists, and more
          </Body>
        </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6">
            {success}
          </Alert>
        )}

        <Stack direction="horizontal" gap={4} className="mb-8">
          <Stack direction="horizontal" gap={2}>
            {['active', 'closed', 'all'].map(f => (
              <Button
                key={f}
                variant={filter === f ? 'solid' : 'outline'}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </Stack>

          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-48"
          >
            <option value="all">All Categories</option>
            <option value="setlist">Setlist Requests</option>
            <option value="venue">Venue Choices</option>
            <option value="merch">Merchandise</option>
            <option value="general">General</option>
          </Select>
        </Stack>

        {polls.length > 0 ? (
          <Grid cols={2} gap={6}>
            {polls.map(poll => (
              <Card key={poll.id} className="p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between items-start">
                    <Stack gap={1}>
                      <Badge variant="outline">{poll.category}</Badge>
                      {poll.event_title && (
                        <Body className="text-sm text-grey-500">{poll.event_title}</Body>
                      )}
                    </Stack>
                    {poll.status === 'active' && poll.ends_at && (
                      <Badge className="bg-info-500 text-white">
                        {getTimeRemaining(poll.ends_at)}
                      </Badge>
                    )}
                    {poll.status === 'closed' && (
                      <Badge className="bg-grey-500 text-white">Closed</Badge>
                    )}
                  </Stack>

                  <H3>{poll.question}</H3>
                  {poll.description && (
                    <Body className="text-grey-600">{poll.description}</Body>
                  )}

                  <Stack gap={2}>
                    {poll.options.map(option => {
                      const isVoted = poll.user_voted === option.id;
                      const showResults = poll.status === 'closed' || poll.user_voted;

                      return (
                        <Stack key={option.id} gap={1}>
                          {poll.status === 'active' && !poll.user_voted ? (
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => handleVote(poll.id, option.id)}
                              disabled={voting === poll.id}
                            >
                              {option.text}
                            </Button>
                          ) : (
                            <Stack className="relative">
                              <Stack
                                className={`absolute inset-0 ${
                                  isVoted ? 'bg-black' : 'bg-grey-200'
                                } rounded transition-all`}
                                style={{ '--progress-width': `${option.percentage}%`, width: 'var(--progress-width)' } as React.CSSProperties}
                              />
                              <Stack
                                direction="horizontal"
                                className="relative z-10 p-3 justify-between"
                              >
                                <Body className={isVoted ? 'text-white font-medium' : ''}>
                                  {option.text}
                                  {isVoted && ' ✓'}
                                </Body>
                                <Body className={`font-mono ${isVoted ? 'text-white' : 'text-grey-600'}`}>
                                  {option.percentage}%
                                </Body>
                              </Stack>
                            </Stack>
                          )}
                        </Stack>
                      );
                    })}
                  </Stack>

                  <Body className="text-sm text-grey-500">
                    {poll.total_votes} vote{poll.total_votes !== 1 ? 's' : ''}
                  </Body>
                </Stack>
              </Card>
            ))}
          </Grid>
        ) : (
          <Card className="p-12 text-center">
            <H3 className="mb-4">NO POLLS FOUND</H3>
            <Body className="text-grey-600">
              {filter === 'active'
                ? 'No active polls at the moment. Check back soon!'
                : 'No polls match your current filters.'}
            </Body>
          </Card>
        )}
        </Stack>
      </Container>
    </Section>
  );
}
