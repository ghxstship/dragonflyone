'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@ghxstship/ui';

interface RevenueData {
  period: string;
  total_revenue: number;
  confirmed_revenue: number;
  pending_revenue: number;
  by_month: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  by_event_type: Array<{
    event_type: string;
    revenue: number;
    percentage: number;
  }>;
  by_space: Array<{
    space_name: string;
    revenue: number;
    bookings: number;
  }>;
}

export default function RevenueReportPage() {
  const [period, setPeriod] = useState('30d');

  const { data, isLoading, error } = useQuery({
    queryKey: ['revenue-report', period],
    queryFn: async () => {
      const response = await fetch(`/api/reports/revenue?period=${period}`);
      if (!response.ok) {
        return {
          period,
          total_revenue: 0,
          confirmed_revenue: 0,
          pending_revenue: 0,
          by_month: [],
          by_event_type: [],
          by_space: [],
        } as RevenueData;
      }
      return response.json() as Promise<RevenueData>;
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading revenue report...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <p className="text-destructive">Failed to load revenue report</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/reports"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-h2-md font-weight-bold text-foreground">Revenue Report</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              Financial performance summary
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="365d">Last Year</option>
          </select>
          <Button variant="solid" size="sm" icon={<Download className="h-4 w-4" />} iconPosition="left">
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-success-100 rounded-card">
              <DollarSign className="h-5 w-5 text-success-600" />
            </div>
            <span className="text-body-sm text-muted-foreground">Total Revenue</span>
          </div>
          <p className="text-h2-md font-weight-bold text-foreground">
            {formatCurrency(data?.total_revenue || 0)}
          </p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-info-100 rounded-card">
              <TrendingUp className="h-5 w-5 text-error-600" />
            </div>
            <span className="text-body-sm text-muted-foreground">Confirmed</span>
          </div>
          <p className="text-h2-md font-weight-bold text-foreground">
            {formatCurrency(data?.confirmed_revenue || 0)}
          </p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-warning-100 rounded-card">
              <Calendar className="h-5 w-5 text-warning-600" />
            </div>
            <span className="text-body-sm text-muted-foreground">Pending</span>
          </div>
          <p className="text-h2-md font-weight-bold text-foreground">
            {formatCurrency(data?.pending_revenue || 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Revenue by Month</h2>
          {!data?.by_month || data.by_month.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-body-sm">No data available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.by_month.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-card">
                  <div>
                    <p className="text-body-sm font-weight-medium text-foreground">{month.month}</p>
                    <p className="text-body-xs text-muted-foreground">{month.bookings} bookings</p>
                  </div>
                  <p className="text-body-md font-weight-semibold text-foreground">
                    {formatCurrency(month.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Revenue by Event Type</h2>
          {!data?.by_event_type || data.by_event_type.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-body-sm">No data available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.by_event_type.map((type, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-body-sm font-weight-medium text-foreground capitalize">
                      {type.event_type.replace('_', ' ')}
                    </span>
                    <span className="text-body-sm text-muted-foreground">
                      {formatCurrency(type.revenue)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-avatar overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-avatar"
                      style={{ width: `${type.percentage}%` }}
                    />
                  </div>
                  <p className="text-body-xs text-muted-foreground mt-1">
                    {type.percentage.toFixed(1)}% of total
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Revenue by Space</h2>
        {!data?.by_space || data.by_space.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-body-sm">No data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-body-sm font-weight-medium text-muted-foreground">Space</th>
                  <th className="text-right py-3 px-4 text-body-sm font-weight-medium text-muted-foreground">Bookings</th>
                  <th className="text-right py-3 px-4 text-body-sm font-weight-medium text-muted-foreground">Revenue</th>
                  <th className="text-right py-3 px-4 text-body-sm font-weight-medium text-muted-foreground">Avg/Booking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.by_space.map((space, index) => (
                  <tr key={index} className="hover:bg-muted/30">
                    <td className="py-3 px-4 text-body-sm text-foreground">{space.space_name}</td>
                    <td className="py-3 px-4 text-body-sm text-foreground text-right">{space.bookings}</td>
                    <td className="py-3 px-4 text-body-sm font-weight-medium text-foreground text-right">
                      {formatCurrency(space.revenue)}
                    </td>
                    <td className="py-3 px-4 text-body-sm text-muted-foreground text-right">
                      {formatCurrency(space.bookings > 0 ? space.revenue / space.bookings : 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
