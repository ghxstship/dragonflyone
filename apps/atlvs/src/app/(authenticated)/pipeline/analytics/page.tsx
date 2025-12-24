'use client';

import {
  Body,
  Button,
  H1,
  H2,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, DollarSign, Users, Target, BarChart3, PieChart } from 'lucide-react';
import { usePipelineAnalytics } from '@/hooks/usePipeline';

export default function PipelineAnalyticsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const { data, isLoading, error } = usePipelineAnalytics(period);

  const summary = data?.summary || {
    total_deals: 0,
    open_deals: 0,
    closed_won: 0,
    closed_lost: 0,
    win_rate: 0,
    pipeline_value: 0,
    weighted_pipeline: 0,
    revenue_this_period: 0,
    deals_created_this_period: 0,
    avg_deal_size: 0,
  };

  const stageDistribution = data?.stage_distribution || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
          <Body className="text-destructive">Failed to load analytics</Body>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/pipeline"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground">Pipeline Analytics</H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Track your sales performance and conversion rates
            </Body>
          </div>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((p) => (
            <Button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-button text-body-sm font-weight-medium border-2 transition-colors ${
                period === p
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : '1 Year'}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <Text className="text-body-sm text-muted-foreground">Total Deals</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">{summary.total_deals}</Body>
          <Body className="text-body-xs text-muted-foreground mt-1">
            {summary.open_deals} open
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-success" />
            <Text className="text-body-sm text-muted-foreground">Win Rate</Text>
          </div>
          <Body className={`text-h3-md font-weight-bold ${
            summary.win_rate >= 50 ? 'text-success' : summary.win_rate >= 30 ? 'text-warning' : 'text-destructive'
          }`}>
            {summary.win_rate.toFixed(1)}%
          </Body>
          <Body className="text-body-xs text-muted-foreground mt-1">
            {summary.closed_won} won / {summary.closed_lost} lost
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-warning" />
            <Text className="text-body-sm text-muted-foreground">Pipeline Value</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">
            {formatCurrency(summary.pipeline_value)}
          </Body>
          <Body className="text-body-xs text-muted-foreground mt-1">
            {formatCurrency(summary.weighted_pipeline)} weighted
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            <Text className="text-body-sm text-muted-foreground">Revenue</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">
            {formatCurrency(summary.revenue_this_period)}
          </Body>
          <Body className="text-body-xs text-muted-foreground mt-1">
            This period
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <Text className="text-body-sm text-muted-foreground">Avg Deal Size</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">
            {formatCurrency(summary.avg_deal_size)}
          </Body>
          <Body className="text-body-xs text-muted-foreground mt-1">
            {summary.deals_created_this_period} new deals
          </Body>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-4">
            <H2 className="text-h4-md font-weight-semibold text-foreground">Stage Distribution</H2>
            <PieChart className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {stageDistribution.map((stage) => {
              const percentage = summary.total_deals > 0 
                ? (stage.count / summary.total_deals) * 100 
                : 0;
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <Text className="text-body-sm text-foreground capitalize">
                      {stage.stage.replace('_', ' ')}
                    </Text>
                    <div className="flex items-center gap-4">
                      <Text className="text-body-xs text-muted-foreground">
                        {stage.count} deals
                      </Text>
                      <Text className="text-body-sm font-weight-medium text-foreground w-24 text-right">
                        {formatCurrency(stage.value)}
                      </Text>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-avatar overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-avatar"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-4">
            <H2 className="text-h4-md font-weight-semibold text-foreground">Conversion Funnel</H2>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {['lead', 'qualified', 'proposal', 'negotiation', 'closed_won'].map((stage) => {
              const stageData = stageDistribution.find(s => s.stage === stage);
              const count = stageData?.count || 0;
              const maxCount = Math.max(...stageDistribution.map(s => s.count), 1);
              const width = (count / maxCount) * 100;

              return (
                <div key={stage} className="flex items-center gap-4">
                  <Text className="text-body-sm text-muted-foreground w-24 capitalize">
                    {stage.replace('_', ' ')}
                  </Text>
                  <div className="flex-1 h-8 bg-muted rounded overflow-hidden">
                    <div
                      className={`h-full flex items-center justify-end px-2 ${
                        stage === 'closed_won' ? 'bg-success' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.max(width, 5)}%` }}
                    >
                      <Text className="text-body-xs font-weight-medium text-white">
                        {count}
                      </Text>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
