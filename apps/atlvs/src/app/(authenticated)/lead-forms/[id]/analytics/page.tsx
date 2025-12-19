'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Users, Target, BarChart3, PieChart } from 'lucide-react';
import { useLeadForm } from '@/hooks/useLeadForms';
import { useQuery } from '@tanstack/react-query';

export default function LeadFormAnalyticsPage() {
  const params = useParams();
  const formId = params.id as string;
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const { data: form } = useLeadForm(formId);

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['lead-form-analytics', formId, period],
    queryFn: async () => {
      const response = await fetch(`/api/lead-forms/${formId}/analytics?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    enabled: !!formId,
  });

  const summary = analytics?.summary || {
    total_submissions: 0,
    this_period: 0,
    conversion_rate: 0,
    avg_time_to_convert: 0,
  };

  const trend = analytics?.trend || [];
  const statusBreakdown = analytics?.status_breakdown || [];
  const sourceBreakdown = analytics?.source_breakdown || [];

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <p className="text-destructive">Failed to load analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/lead-forms/${formId}`}
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-h2-md font-weight-bold text-foreground">Form Analytics</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              {form?.name || 'Lead Form'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-button text-body-sm font-weight-medium border-2 transition-colors ${
                period === p
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Total Submissions</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{summary.total_submissions}</p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-success" />
            <span className="text-body-sm text-muted-foreground">This Period</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{summary.this_period}</p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-warning" />
            <span className="text-body-sm text-muted-foreground">Conversion Rate</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">
            {summary.conversion_rate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-secondary" />
            <span className="text-body-sm text-muted-foreground">Avg Convert Time</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">
            {summary.avg_time_to_convert > 0 ? `${summary.avg_time_to_convert}d` : 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h4-md font-weight-semibold text-foreground">Submissions Trend</h2>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          {trend.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          ) : (
            <div className="h-48 flex items-end gap-1">
              {trend.map((day: { date: string; count: number }) => {
                const maxCount = Math.max(...trend.map((d: { count: number }) => d.count), 1);
                const height = (day.count / maxCount) * 100;
                return (
                  <div
                    key={day.date}
                    className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t relative group"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-2 py-1 rounded text-body-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {day.count} submissions
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h4-md font-weight-semibold text-foreground">Status Breakdown</h2>
            <PieChart className="h-5 w-5 text-muted-foreground" />
          </div>
          {statusBreakdown.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          ) : (
            <div className="space-y-3">
              {statusBreakdown.map((item: { status: string; count: number; percentage: number }) => (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-body-sm text-foreground capitalize">{item.status}</span>
                    <span className="text-body-sm text-muted-foreground">
                      {item.count} ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-avatar overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-avatar"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {sourceBreakdown.length > 0 && (
        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Top Sources</h2>
          <div className="grid grid-cols-4 gap-4">
            {sourceBreakdown.slice(0, 4).map((source: { source: string; count: number }) => (
              <div key={source.source} className="p-4 bg-muted/30 rounded-card">
                <p className="text-body-sm text-muted-foreground truncate">{source.source}</p>
                <p className="text-h4-md font-weight-bold text-foreground">{source.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
