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
import { useParams } from 'next/navigation';
import { ArrowLeft, Star, TrendingUp, Package, DollarSign, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { useVendorPerformance } from '@/hooks/useVendors';

export default function VendorPerformancePage() {
  const params = useParams();
  const vendorId = params.id as string;
  const [period, setPeriod] = useState<'3m' | '6m' | '12m'>('12m');

  const { data, isLoading, error } = useVendorPerformance(vendorId, period);

  const metrics = data?.metrics || {
    average_rating: 0,
    total_orders: 0,
    completed_orders: 0,
    total_revenue: 0,
    completion_rate: 0,
    on_time_rate: 0,
    review_count: 0,
  };

  const issues = data?.issues || { total: 0, open: 0, resolved: 0, critical: 0 };
  const monthlyTrend = data?.monthly_trend || [];
  const recentReviews = data?.recent_reviews || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-success';
    if (rating >= 3.5) return 'text-warning';
    return 'text-destructive';
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading performance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <Body className="text-destructive">Failed to load performance data</Body>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/vendors/${vendorId}`}
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground">
              {data?.vendor?.name || 'Vendor'} Performance
            </H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Performance metrics and trends
            </Body>
          </div>
        </div>
        <div className="flex gap-2">
          {(['3m', '6m', '12m'] as const).map((p) => (
            <Button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-button text-body-sm font-weight-medium border-2 transition-colors ${
                period === p
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {p === '3m' ? '3 Months' : p === '6m' ? '6 Months' : '12 Months'}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-warning" />
            <Text className="text-body-sm text-muted-foreground">Rating</Text>
          </div>
          <Body className={`text-h3-md font-weight-bold ${getRatingColor(metrics.average_rating)}`}>
            {metrics.average_rating.toFixed(1)}
            <Text className="text-body-sm text-muted-foreground ml-1">/ 5.0</Text>
          </Body>
          <Body className="text-body-xs text-muted-foreground mt-1">
            {metrics.review_count} reviews
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-primary" />
            <Text className="text-body-sm text-muted-foreground">Orders</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">
            {metrics.completed_orders}
            <Text className="text-body-sm text-muted-foreground ml-1">/ {metrics.total_orders}</Text>
          </Body>
          <Body className="text-body-xs text-muted-foreground mt-1">
            {metrics.completion_rate.toFixed(0)}% completion rate
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-success" />
            <Text className="text-body-sm text-muted-foreground">Revenue</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">
            {formatCurrency(metrics.total_revenue)}
          </Body>
          <Body className="text-body-xs text-muted-foreground mt-1">
            Total spend this period
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-secondary" />
            <Text className="text-body-sm text-muted-foreground">On-Time</Text>
          </div>
          <Body className={`text-h3-md font-weight-bold ${
            metrics.on_time_rate >= 90 ? 'text-success' : 
            metrics.on_time_rate >= 75 ? 'text-warning' : 'text-destructive'
          }`}>
            {metrics.on_time_rate.toFixed(0)}%
          </Body>
          <Body className="text-body-xs text-muted-foreground mt-1">
            Delivery rate
          </Body>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-4">
            <H2 className="text-h4-md font-weight-semibold text-foreground">Monthly Trend</H2>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          {monthlyTrend.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No trend data available
            </div>
          ) : (
            <div className="space-y-3">
              {monthlyTrend.map((month) => (
                <div key={month.month} className="flex items-center gap-4">
                  <Text className="text-body-sm text-muted-foreground w-16">{month.month}</Text>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <Text className="text-body-xs text-foreground">{month.orders} orders</Text>
                      <Text className="text-body-xs font-weight-medium text-foreground">
                        {formatCurrency(month.revenue)}
                      </Text>
                    </div>
                    <div className="h-2 bg-muted rounded-avatar overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-avatar"
                        style={{ 
                          width: `${Math.min(100, (month.revenue / Math.max(...monthlyTrend.map(m => m.revenue || 1))) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-4">
            <H2 className="text-h4-md font-weight-semibold text-foreground">Issues</H2>
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 rounded-card p-4">
              <Body className="text-body-xs text-muted-foreground mb-1">Total Issues</Body>
              <Body className="text-h4-md font-weight-bold text-foreground">{issues.total}</Body>
            </div>
            <div className="bg-warning/10 rounded-card p-4">
              <Body className="text-body-xs text-muted-foreground mb-1">Open</Body>
              <Body className="text-h4-md font-weight-bold text-warning">{issues.open}</Body>
            </div>
            <div className="bg-success/10 rounded-card p-4">
              <Body className="text-body-xs text-muted-foreground mb-1">Resolved</Body>
              <Body className="text-h4-md font-weight-bold text-success">{issues.resolved}</Body>
            </div>
            <div className="bg-destructive/10 rounded-card p-4">
              <Body className="text-body-xs text-muted-foreground mb-1">Critical</Body>
              <Body className="text-h4-md font-weight-bold text-destructive">{issues.critical}</Body>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <H2 className="text-h4-md font-weight-semibold text-foreground">Recent Reviews</H2>
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="divide-y divide-border">
          {recentReviews.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No reviews yet
            </div>
          ) : (
            recentReviews.map((review) => (
              <div key={review.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating ? 'text-warning fill-warning' : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <Text className="text-body-sm font-weight-medium text-foreground">
                        {review.reviewer_name || 'Anonymous'}
                      </Text>
                    </div>
                    {review.review_text && (
                      <Body className="text-body-sm text-muted-foreground mt-2">
                        {review.review_text}
                      </Body>
                    )}
                  </div>
                  <Text className="text-body-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </Text>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
