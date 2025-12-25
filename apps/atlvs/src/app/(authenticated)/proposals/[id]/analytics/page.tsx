'use client';

import {
  Body,
  H1,
  H2,
  Text,
  EmptyState,
} from '@ghxstship/ui';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, Clock, MousePointer, TrendingUp, Calendar, Users } from 'lucide-react';
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
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (analyticsError && !analytics) {
    return (
      <div className="p-6">
        <EmptyState
          title="Error Loading Analytics"
          description={analyticsError instanceof Error ? analyticsError.message : 'Failed to load proposal analytics'}
          action={{ label: 'Retry', onClick: () => window.location.reload() }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/proposals/${proposalId}`}
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground">Proposal Analytics</H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              {proposal?.name || 'Proposal'}
            </Body>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-info-100 rounded-card">
              <Eye className="h-5 w-5 text-info-600" />
            </div>
            <Text className="text-body-sm text-muted-foreground">Total Views</Text>
          </div>
          <Body className="text-h2-md font-weight-bold text-foreground">
            {analytics?.total_views || 0}
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-success-100 rounded-card">
              <Users className="h-5 w-5 text-success-600" />
            </div>
            <Text className="text-body-sm text-muted-foreground">Unique Views</Text>
          </div>
          <Body className="text-h2-md font-weight-bold text-foreground">
            {analytics?.unique_views || 0}
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-100 rounded-card">
              <Clock className="h-5 w-5 text-violet-600" />
            </div>
            <Text className="text-body-sm text-muted-foreground">Avg. Time</Text>
          </div>
          <Body className="text-h2-md font-weight-bold text-foreground">
            {formatDuration(analytics?.average_time_spent || 0)}
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-warning-100 rounded-card">
              <Calendar className="h-5 w-5 text-warning-600" />
            </div>
            <Text className="text-body-sm text-muted-foreground">Last Viewed</Text>
          </div>
          <Body className="text-body-md font-weight-medium text-foreground">
            {analytics?.last_viewed_at ? formatDate(analytics.last_viewed_at) : 'Never'}
          </Body>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">View History</H2>
          {!analytics?.view_history || analytics.view_history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <Body className="text-body-sm">No views yet</Body>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {analytics.view_history.map((view) => (
                <div
                  key={view.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-card"
                >
                  <div>
                    <Body className="text-body-sm font-weight-medium text-foreground">
                      {formatDate(view.viewed_at)}
                    </Body>
                    <Body className="text-body-xs text-muted-foreground">
                      Time spent: {formatDuration(view.time_spent_seconds)}
                    </Body>
                  </div>
                  <div className="flex items-center gap-1 text-body-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(view.time_spent_seconds)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Sections Viewed</H2>
          {!analytics?.sections_viewed || analytics.sections_viewed.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MousePointer className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <Body className="text-body-sm">No section data available</Body>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.sections_viewed.map((section) => (
                <div key={section.section_id} className="p-3 bg-muted/30 rounded-card">
                  <div className="flex items-center justify-between mb-2">
                    <Text className="text-body-sm font-weight-medium text-foreground">
                      {section.section_title}
                    </Text>
                    <Text className="text-body-xs text-muted-foreground">
                      {section.views} views
                    </Text>
                  </div>
                  <div className="h-2 bg-muted rounded-avatar overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-avatar"
                      style={{
                        width: `${Math.min(100, (section.views / (analytics.total_views || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Engagement Insights</H2>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center p-4 bg-muted/20 rounded-card">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
            <Body className="text-body-sm text-muted-foreground">Engagement Score</Body>
            <Body className="text-h3-md font-weight-bold text-foreground mt-1">
              {analytics?.total_views && analytics.average_time_spent
                ? Math.min(100, Math.round((analytics.total_views * analytics.average_time_spent) / 10))
                : 0}%
            </Body>
          </div>
          <div className="text-center p-4 bg-muted/20 rounded-card">
            <Eye className="h-8 w-8 text-primary mx-auto mb-2" />
            <Body className="text-body-sm text-muted-foreground">Return Rate</Body>
            <Body className="text-h3-md font-weight-bold text-foreground mt-1">
              {analytics?.total_views && analytics?.unique_views
                ? Math.round(((analytics.total_views - analytics.unique_views) / analytics.total_views) * 100)
                : 0}%
            </Body>
          </div>
          <div className="text-center p-4 bg-muted/20 rounded-card">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <Body className="text-body-sm text-muted-foreground">Total Time Spent</Body>
            <Body className="text-h3-md font-weight-bold text-foreground mt-1">
              {formatDuration(
                (analytics?.average_time_spent || 0) * (analytics?.total_views || 0)
              )}
            </Body>
          </div>
        </div>
      </div>
    </div>
  );
}
