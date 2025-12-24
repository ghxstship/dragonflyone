'use client';

import {
  Body,
  H1,
  H2,
  Link,
  Text,
} from '@ghxstship/ui';

import { ArrowLeft, Clock, DollarSign, AlertTriangle, CheckCircle, Star } from 'lucide-react';
import { useVendorMetrics, useVendorIssues } from '@/hooks/useVendorPerformance';
import { useVendorProfile } from '@/hooks/useVendorProfiles';

export default function VendorMetricsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data: vendorData } = useVendorProfile(id);
  const { data: metricsData, isLoading: metricsLoading } = useVendorMetrics(id, 'monthly', 6);
  const { data: issuesData, isLoading: issuesLoading } = useVendorIssues(id);

  const vendor = vendorData?.vendor;
  const metrics = metricsData?.metrics || [];
  const summary = metricsData?.summary;
  const issues = issuesData?.issues || [];
  
  const isLoading = metricsLoading || issuesLoading;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/vendors/${id}`}
          className="p-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">
            Performance Metrics: {vendor?.name || 'Vendor'}
          </H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Track vendor performance and identify issues
          </Body>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <Text className="text-body-sm text-muted-foreground">Orders Completed</Text>
            </div>
            <Body className="text-h3-md font-weight-bold text-foreground">{summary.completed_orders}</Body>
            <Body className="text-body-xs text-muted-foreground mt-1">
              of {summary.total_orders} total orders
            </Body>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <Text className="text-body-sm text-muted-foreground">Total Revenue</Text>
            </div>
            <Body className="text-h3-md font-weight-bold text-foreground">{formatCurrency(summary.total_revenue)}</Body>
            <Body className="text-body-xs text-muted-foreground mt-1">
              All-time spend with vendor
            </Body>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-warning" />
              <Text className="text-body-sm text-muted-foreground">Avg Rating</Text>
            </div>
            <Body className="text-h3-md font-weight-bold text-foreground">
              {summary.average_rating?.toFixed(1) || 'N/A'}
            </Body>
            <Body className="text-body-xs text-muted-foreground mt-1">
              from {summary.total_reviews} reviews
            </Body>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`h-5 w-5 ${summary.critical_issues > 0 ? 'text-destructive' : 'text-success'}`} />
              <Text className="text-body-sm text-muted-foreground">Open Issues</Text>
            </div>
            <Body className={`text-h3-md font-weight-bold ${summary.open_issues > 0 ? 'text-destructive' : 'text-success'}`}>
              {summary.open_issues}
            </Body>
            <Body className="text-body-xs text-muted-foreground mt-1">
              {summary.critical_issues} critical
            </Body>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Monthly Trends</H2>
          {metrics.length === 0 ? (
            <Body className="text-body-sm text-muted-foreground">No historical data available yet.</Body>
          ) : (
            <div className="space-y-3">
              {metrics.slice(0, 6).map((metric) => (
                <div key={metric.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <Body className="text-body-sm font-weight-medium">
                      {new Date(metric.metric_period).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </Body>
                    <Body className="text-body-xs text-muted-foreground">
                      {metric.total_bookings} orders
                    </Body>
                  </div>
                  <div className="text-right">
                    <Body className="text-body-sm font-weight-medium">{formatCurrency(metric.total_revenue)}</Body>
                    <div className="flex items-center gap-2 text-body-xs">
                      {metric.on_time_rate !== undefined && (
                        <Text className={metric.on_time_rate >= 0.9 ? 'text-success' : 'text-warning'}>
                          {formatPercent(metric.on_time_rate)} on-time
                        </Text>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-4">
            <H2 className="text-h4-md font-weight-semibold text-foreground">Recent Issues</H2>
            <Link
              href={`/vendors/${id}/issues`}
              className="text-body-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {issues.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-10 w-10 text-success mx-auto mb-2" />
              <Body className="text-body-sm text-muted-foreground">No open issues</Body>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.slice(0, 5).map((issue) => (
                <div key={issue.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <Text className={`mt-1 px-2 py-0.5 rounded-badge text-body-xs font-weight-medium ${
                    issue.severity === 'critical' ? 'bg-destructive/10 text-destructive' :
                    issue.severity === 'high' ? 'bg-warning/10 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {issue.severity}
                  </Text>
                  <div className="flex-1 min-w-0">
                    <Body className="text-body-sm font-weight-medium truncate">{issue.title}</Body>
                    <Body className="text-body-xs text-muted-foreground">
                      {issue.status} • {new Date(issue.created_at).toLocaleDateString()}
                    </Body>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {metrics.length > 0 && (
        <div className="bg-background border-2 border-border rounded-card p-6">
          <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Performance Scores</H2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics[0] && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Text className="text-body-sm text-muted-foreground">On-Time Delivery</Text>
                    <Text className={`text-body-sm font-weight-bold ${
                      (metrics[0].on_time_rate || 0) >= 0.9 ? 'text-success' : 
                      (metrics[0].on_time_rate || 0) >= 0.7 ? 'text-warning' : 'text-destructive'
                    }`}>
                      {formatPercent(metrics[0].on_time_rate)}
                    </Text>
                  </div>
                  <div className="h-2 bg-muted rounded-badge overflow-hidden">
                    <div
                      className={`h-full ${
                        (metrics[0].on_time_rate || 0) >= 0.9 ? 'bg-success' : 
                        (metrics[0].on_time_rate || 0) >= 0.7 ? 'bg-warning' : 'bg-destructive'
                      }`}
                      style={{ width: `${(metrics[0].on_time_rate || 0) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Text className="text-body-sm text-muted-foreground">Quality Score</Text>
                    <Text className={`text-body-sm font-weight-bold ${
                      (metrics[0].quality_score || 0) >= 0.9 ? 'text-success' : 
                      (metrics[0].quality_score || 0) >= 0.7 ? 'text-warning' : 'text-destructive'
                    }`}>
                      {formatPercent(metrics[0].quality_score)}
                    </Text>
                  </div>
                  <div className="h-2 bg-muted rounded-badge overflow-hidden">
                    <div
                      className={`h-full ${
                        (metrics[0].quality_score || 0) >= 0.9 ? 'bg-success' : 
                        (metrics[0].quality_score || 0) >= 0.7 ? 'bg-warning' : 'bg-destructive'
                      }`}
                      style={{ width: `${(metrics[0].quality_score || 0) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Text className="text-body-sm text-muted-foreground">Repeat Booking</Text>
                    <Text className="text-body-sm font-weight-bold text-primary">
                      {formatPercent(metrics[0].repeat_booking_rate)}
                    </Text>
                  </div>
                  <div className="h-2 bg-muted rounded-badge overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(metrics[0].repeat_booking_rate || 0) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Text className="text-body-sm text-muted-foreground">Response Time</Text>
                    <Text className="text-body-sm font-weight-bold text-foreground">
                      {metrics[0].response_time_hours ? `${metrics[0].response_time_hours}h` : 'N/A'}
                    </Text>
                  </div>
                  <div className="flex items-center gap-2 text-body-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Average response time
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
