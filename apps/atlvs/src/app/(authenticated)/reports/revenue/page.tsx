'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Body,
  Button,
  H1,
  H2,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

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
          <Body className="text-destructive">Failed to load revenue report</Body>
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
            <H1 className="text-h2-md font-weight-bold text-foreground">Revenue Report</H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Financial performance summary
            </Body>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="365d">Last Year</option>
          </Select>
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
            <Text className="text-body-sm text-muted-foreground">Total Revenue</Text>
          </div>
          <Body className="text-h2-md font-weight-bold text-foreground">
            {formatCurrency(data?.total_revenue || 0)}
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-info-100 rounded-card">
              <TrendingUp className="h-5 w-5 text-error-600" />
            </div>
            <Text className="text-body-sm text-muted-foreground">Confirmed</Text>
          </div>
          <Body className="text-h2-md font-weight-bold text-foreground">
            {formatCurrency(data?.confirmed_revenue || 0)}
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-warning-100 rounded-card">
              <Calendar className="h-5 w-5 text-warning-600" />
            </div>
            <Text className="text-body-sm text-muted-foreground">Pending</Text>
          </div>
          <Body className="text-h2-md font-weight-bold text-foreground">
            {formatCurrency(data?.pending_revenue || 0)}
          </Body>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Revenue by Month</H2>
          {!data?.by_month || data.by_month.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Body className="text-body-sm">No data available</Body>
            </div>
          ) : (
            <div className="space-y-3">
              {data.by_month.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-card">
                  <div>
                    <Body className="text-body-sm font-weight-medium text-foreground">{month.month}</Body>
                    <Body className="text-body-xs text-muted-foreground">{month.bookings} bookings</Body>
                  </div>
                  <Body className="text-body-md font-weight-semibold text-foreground">
                    {formatCurrency(month.revenue)}
                  </Body>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Revenue by Event Type</H2>
          {!data?.by_event_type || data.by_event_type.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Body className="text-body-sm">No data available</Body>
            </div>
          ) : (
            <div className="space-y-3">
              {data.by_event_type.map((type, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-card">
                  <div className="flex items-center justify-between mb-2">
                    <Text className="text-body-sm font-weight-medium text-foreground capitalize">
                      {type.event_type.replace('_', ' ')}
                    </Text>
                    <Text className="text-body-sm text-muted-foreground">
                      {formatCurrency(type.revenue)}
                    </Text>
                  </div>
                  <div className="h-2 bg-muted rounded-avatar overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-avatar"
                      style={{ width: `${type.percentage}%` }}
                    />
                  </div>
                  <Body className="text-body-xs text-muted-foreground mt-1">
                    {type.percentage.toFixed(1)}% of total
                  </Body>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Revenue by Space</H2>
        {!data?.by_space || data.by_space.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Body className="text-body-sm">No data available</Body>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead className="text-left py-3 px-4 text-body-sm font-weight-medium text-muted-foreground">Space</TableHead>
                  <TableHead className="text-right py-3 px-4 text-body-sm font-weight-medium text-muted-foreground">Bookings</TableHead>
                  <TableHead className="text-right py-3 px-4 text-body-sm font-weight-medium text-muted-foreground">Revenue</TableHead>
                  <TableHead className="text-right py-3 px-4 text-body-sm font-weight-medium text-muted-foreground">Avg/Booking</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {data.by_space.map((space, index) => (
                  <TableRow key={index} className="hover:bg-muted/30">
                    <TableCell className="py-3 px-4 text-body-sm text-foreground">{space.space_name}</TableCell>
                    <TableCell className="py-3 px-4 text-body-sm text-foreground text-right">{space.bookings}</TableCell>
                    <TableCell className="py-3 px-4 text-body-sm font-weight-medium text-foreground text-right">
                      {formatCurrency(space.revenue)}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-body-sm text-muted-foreground text-right">
                      {formatCurrency(space.bookings > 0 ? space.revenue / space.bookings : 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
