'use client';

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
  const proposalId = params.id as string;

  const { data: proposal, isLoading: proposalLoading } = useProposal(proposalId);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
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
            <h1 className="text-h2-md font-weight-bold text-foreground">Proposal Analytics</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              {proposal?.name || 'Proposal'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-info-100 rounded-card">
              <Eye className="h-5 w-5 text-info-600" />
            </div>
            <span className="text-body-sm text-muted-foreground">Total Views</span>
          </div>
          <p className="text-h2-md font-weight-bold text-foreground">
            {analytics?.total_views || 0}
          </p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-success-100 rounded-card">
              <Users className="h-5 w-5 text-success-600" />
            </div>
            <span className="text-body-sm text-muted-foreground">Unique Views</span>
          </div>
          <p className="text-h2-md font-weight-bold text-foreground">
            {analytics?.unique_views || 0}
          </p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-100 rounded-card">
              <Clock className="h-5 w-5 text-violet-600" />
            </div>
            <span className="text-body-sm text-muted-foreground">Avg. Time</span>
          </div>
          <p className="text-h2-md font-weight-bold text-foreground">
            {formatDuration(analytics?.average_time_spent || 0)}
          </p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-warning-100 rounded-card">
              <Calendar className="h-5 w-5 text-warning-600" />
            </div>
            <span className="text-body-sm text-muted-foreground">Last Viewed</span>
          </div>
          <p className="text-body-md font-weight-medium text-foreground">
            {analytics?.last_viewed_at ? formatDate(analytics.last_viewed_at) : 'Never'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">View History</h2>
          {!analytics?.view_history || analytics.view_history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-body-sm">No views yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {analytics.view_history.map((view) => (
                <div
                  key={view.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-card"
                >
                  <div>
                    <p className="text-body-sm font-weight-medium text-foreground">
                      {formatDate(view.viewed_at)}
                    </p>
                    <p className="text-body-xs text-muted-foreground">
                      Time spent: {formatDuration(view.time_spent_seconds)}
                    </p>
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
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Sections Viewed</h2>
          {!analytics?.sections_viewed || analytics.sections_viewed.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MousePointer className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-body-sm">No section data available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.sections_viewed.map((section) => (
                <div key={section.section_id} className="p-3 bg-muted/30 rounded-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-body-sm font-weight-medium text-foreground">
                      {section.section_title}
                    </span>
                    <span className="text-body-xs text-muted-foreground">
                      {section.views} views
                    </span>
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
        <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Engagement Insights</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center p-4 bg-muted/20 rounded-card">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-body-sm text-muted-foreground">Engagement Score</p>
            <p className="text-h3-md font-weight-bold text-foreground mt-1">
              {analytics?.total_views && analytics.average_time_spent
                ? Math.min(100, Math.round((analytics.total_views * analytics.average_time_spent) / 10))
                : 0}%
            </p>
          </div>
          <div className="text-center p-4 bg-muted/20 rounded-card">
            <Eye className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-body-sm text-muted-foreground">Return Rate</p>
            <p className="text-h3-md font-weight-bold text-foreground mt-1">
              {analytics?.total_views && analytics?.unique_views
                ? Math.round(((analytics.total_views - analytics.unique_views) / analytics.total_views) * 100)
                : 0}%
            </p>
          </div>
          <div className="text-center p-4 bg-muted/20 rounded-card">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-body-sm text-muted-foreground">Total Time Spent</p>
            <p className="text-h3-md font-weight-bold text-foreground mt-1">
              {formatDuration(
                (analytics?.average_time_spent || 0) * (analytics?.total_views || 0)
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
