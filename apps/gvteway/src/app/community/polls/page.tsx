'use client';

import { useState } from 'react';

import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Button,
  Card,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Kicker,
} from '@ghxstship/ui';
import { useCommunityPollsData } from '@/hooks/useCommunityPolls';

export default function CommunityPollsPage() {
  const [voting, setVoting] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState('active');
  const [category, setCategory] = useState('all');

  const {
    polls,
    isLoading: loading,
    error,
    refetch,
    vote,
  } = useCommunityPollsData({ status: filter, category });

  const handleVote = async (pollId: string, optionId: string) => {
    setVoting(pollId);
    setLocalError(null);

    try {
      await vote({ pollId, optionId });
      setSuccess('Vote recorded!');
      refetch();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to vote');
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
    return <GvtewayLoadingLayout />;
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Community</Kicker>
              <H2 size="lg" className="text-white">Community Polls</H2>
              <Body className="text-on-dark-muted">
                Vote on upcoming events, setlists, and more
              </Body>
            </Stack>

        {(error || localError) && (
          <Alert variant="error" className="mb-6">
            {error instanceof Error ? error.message : localError || String(error)}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6">
            {success}
          </Alert>
        )}

        <Stack direction="horizontal" gap={4}>
          <Stack direction="horizontal" gap={2}>
            {['active', 'closed', 'all'].map(f => (
              <Button
                key={f}
                variant={filter === f ? 'solid' : 'outlineInk'}
                inverted={filter === f}
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
            inverted
          >
            <option value="all">All Categories</option>
            <option value="setlist">Setlist Requests</option>
            <option value="venue">Venue Choices</option>
            <option value="merch">Merchandise</option>
            <option value="general">General</option>
          </Select>
        </Stack>

        {polls.length > 0 ? (
          <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
            {polls.map(poll => (
              <Card key={poll.id} inverted className="p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" className="items-start justify-between">
                    <Stack gap={1}>
                      <Badge variant="outline">{poll.category}</Badge>
                      {poll.event_title && (
                        <Body size="sm" className="text-on-dark-disabled">{poll.event_title}</Body>
                      )}
                    </Stack>
                    {poll.status === 'active' && poll.ends_at && (
                      <Badge variant="solid">
                        {getTimeRemaining(poll.ends_at)}
                      </Badge>
                    )}
                    {poll.status === 'closed' && (
                      <Badge variant="outline">Closed</Badge>
                    )}
                  </Stack>

                  <H3 className="text-white">{poll.question}</H3>
                  {poll.description && (
                    <Body className="text-on-dark-muted">{poll.description}</Body>
                  )}

                  <Stack gap={2}>
                    {poll.options.map(option => {
                      const isVoted = poll.user_voted === option.id;
                      const showResults = poll.status === 'closed' || poll.user_voted;

                      return (
                        <Stack key={option.id} gap={1}>
                          {!showResults ? (
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
                                  isVoted ? 'bg-black' : 'bg-ink-200'
                                } rounded transition-all`}
                                style={{ '--progress-width': `${option.percentage}%`, width: 'var(--progress-width)' } as React.CSSProperties}
                              />
                              <Stack
                                direction="horizontal"
                                className="relative z-10 p-3 justify-between"
                              >
                                <Body className={isVoted ? 'text-white font-weight-medium' : ''}>
                                  {option.text}
                                  {isVoted && ' ✓'}
                                </Body>
                                <Body className={`font-mono ${isVoted ? 'text-white' : 'text-ink-600'}`}>
                                  {option.percentage}%
                                </Body>
                              </Stack>
                            </Stack>
                          )}
                        </Stack>
                      );
                    })}
                  </Stack>

                  <Body size="sm" className="text-on-dark-disabled">
                    {poll.total_votes} vote{poll.total_votes !== 1 ? 's' : ''}
                  </Body>
                </Stack>
              </Card>
            ))}
          </Grid>
        ) : (
          <Card inverted className="p-12 text-center">
            <H3 className="mb-4 text-white">No Polls Found</H3>
            <Body className="text-on-dark-muted">
              {filter === 'active'
                ? 'No active polls at the moment. Check back soon!'
                : 'No polls match your current filters.'}
            </Body>
          </Card>
        )}
          </Stack>
    </GvtewayAppLayout>
  );
}
