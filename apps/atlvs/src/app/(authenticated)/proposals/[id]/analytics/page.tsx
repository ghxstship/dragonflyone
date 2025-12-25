'use client';

import {
  Body,
  Box,
  Card,
  Container,
  Grid,
  H2,
  MainContent,
  Skeleton,
  Stack,
  StatCard,
  Text,
  EmptyState,
  EnterprisePageHeader,
  ProgressBar,
} from '@ghxstship/ui';

import { useParams } from 'next/navigation';
import { Eye, Clock, MousePointer } from 'lucide-react';
import { useProposal } from '@/hooks/useProposals';
import { useQuery } from '@tanstack/react-query';

interface ProposalAnalytics {
  proposal_id: string;
  total_views: number;
  unique_views: number;
  average_time_spent: number;
  last_viewed_at?: string;
  view_history: Array<{
    id: string;
    viewed_at: string;
    time_spent_seconds: number;
    ip_address?: string;
    user_agent?: string;
  }>;
  sections_viewed: Array<{
    section_id: string;
    section_title: string;
    views: number;
    avg_time_spent: number;
  }>;
}

export default function ProposalAnalyticsPage() {
  const params = useParams();
  const proposalId = params?.id as string;

  const { data: proposal, isLoading: proposalLoading } = useProposal(proposalId);

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['proposal-analytics', proposalId],
    queryFn: async () => {
      const response = await fetch(`/api/proposals/${proposalId}/analytics`);
      if (!response.ok) {
        return {
          proposal_id: proposalId,
          total_views: 0,
          unique_views: 0,
          average_time_spent: 0,
          view_history: [],
          sections_viewed: [],
        } as ProposalAnalytics;
      }
      return response.json() as Promise<ProposalAnalytics>;
    },
    enabled: !!proposalId,
  });

  const isLoading = proposalLoading || analyticsLoading;

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader
          title="Proposal Analytics"
          subtitle="Loading..."
        />
        <MainContent padding="lg">
          <Container>
            <Stack gap={6}>
              <Grid cols={4} gap={4}>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </Grid>
              <Skeleton className="h-64" />
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (analyticsError && !analytics) {
    return (
      <>
        <EnterprisePageHeader
          title="Proposal Analytics"
          subtitle="Error"
        />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Error Loading Analytics"
              description={analyticsError instanceof Error ? analyticsError.message : 'Failed to load proposal analytics'}
              action={{ label: 'Retry', onClick: () => window.location.reload() }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title="Proposal Analytics"
        subtitle={proposal?.name || 'Proposal'}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                value={String(analytics?.total_views || 0)}
                label="Total Views"
              />
              <StatCard
                value={String(analytics?.unique_views || 0)}
                label="Unique Views"
              />
              <StatCard
                value={formatDuration(analytics?.average_time_spent || 0)}
                label="Avg. Time"
              />
              <StatCard
                value={analytics?.last_viewed_at ? formatDate(analytics.last_viewed_at) : 'Never'}
                label="Last Viewed"
              />
            </Grid>

            <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
              <Card className="p-6">
                <H2 className="mb-4">View History</H2>
                {!analytics?.view_history || analytics.view_history.length === 0 ? (
                  <EmptyState
                    title="No views yet"
                    description="This proposal hasn't been viewed yet"
                    icon={<Eye className="h-8 w-8" />}
                  />
                ) : (
                  <Stack gap={3} className="max-h-80 overflow-y-auto">
                    {analytics.view_history.map((view) => (
                      <Box
                        key={view.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-card"
                      >
                        <Stack gap={1}>
                          <Body size="sm" className="font-weight-medium">
                            {formatDate(view.viewed_at)}
                          </Body>
                          <Body size="xs" className="text-muted-foreground">
                            Time spent: {formatDuration(view.time_spent_seconds)}
                          </Body>
                        </Stack>
                        <Stack direction="horizontal" gap={1} className="text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <Text size="xs">{formatDuration(view.time_spent_seconds)}</Text>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Card>

              <Card className="p-6">
                <H2 className="mb-4">Sections Viewed</H2>
                {!analytics?.sections_viewed || analytics.sections_viewed.length === 0 ? (
                  <EmptyState
                    title="No section data"
                    description="Section analytics will appear here"
                    icon={<MousePointer className="h-8 w-8" />}
                  />
                ) : (
                  <Stack gap={3}>
                    {analytics.sections_viewed.map((section) => (
                      <Box key={section.section_id} className="p-3 bg-muted/30 rounded-card">
                        <Stack direction="horizontal" className="justify-between mb-2">
                          <Text size="sm" className="font-weight-medium">
                            {section.section_title}
                          </Text>
                          <Text size="xs" className="text-muted-foreground">
                            {section.views} views
                          </Text>
                        </Stack>
                        <ProgressBar
                          value={Math.min(100, (section.views / (analytics.total_views || 1)) * 100)}
                          size="sm"
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Card>
            </Grid>

            <Card className="p-6">
              <H2 className="mb-4">Engagement Insights</H2>
              <Grid cols={3} gap={6} className="sm:grid-cols-1 lg:grid-cols-3">
                <StatCard
                  value={`${analytics?.total_views && analytics.average_time_spent
                    ? Math.min(100, Math.round((analytics.total_views * analytics.average_time_spent) / 10))
                    : 0}%`}
                  label="Engagement Score"
                />
                <StatCard
                  value={`${analytics?.total_views && analytics?.unique_views
                    ? Math.round(((analytics.total_views - analytics.unique_views) / analytics.total_views) * 100)
                    : 0}%`}
                  label="Return Rate"
                />
                <StatCard
                  value={formatDuration(
                    (analytics?.average_time_spent || 0) * (analytics?.total_views || 0)
                  )}
                  label="Total Time Spent"
                />
              </Grid>
            </Card>
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
