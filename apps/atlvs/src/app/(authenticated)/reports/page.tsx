'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  FileText,
  Download,
  Filter,
  ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Body,
  Box,
  Button,
  Card,
  Container,
  EnterprisePageHeader,
  Grid,
  H2,
  MainContent,
  Select,
  Skeleton,
  Stack,
  Text,
} from '@ghxstship/ui';

interface ReportSummary {
  total_revenue: number;
  total_bookings: number;
  total_contacts: number;
  total_proposals: number;
  revenue_trend: number;
  bookings_trend: number;
}

const REPORT_CATEGORIES = [
  {
    id: 'financial',
    name: 'Financial Reports',
    icon: DollarSign,
    reports: [
      { id: 'revenue', name: 'Revenue Summary', path: '/reports/revenue' },
      { id: 'payments', name: 'Payment Report', path: '/reports/payments' },
      { id: 'deposits', name: 'Deposit Tracking', path: '/reports/deposits' },
      { id: 'ar', name: 'Accounts Receivable', path: '/reports/accounts-receivable' },
    ],
  },
  {
    id: 'operations',
    name: 'Operations Reports',
    icon: Calendar,
    reports: [
      { id: 'bookings', name: 'Booking Report', path: '/reports/bookings' },
      { id: 'calendar', name: 'Calendar Utilization', path: '/reports/calendar-utilization' },
      { id: 'spaces', name: 'Space Performance', path: '/reports/space-performance' },
      { id: 'staff', name: 'Staff Schedule', path: '/reports/staff-schedule' },
    ],
  },
  {
    id: 'sales',
    name: 'Sales Reports',
    icon: TrendingUp,
    reports: [
      { id: 'pipeline', name: 'Pipeline Report', path: '/reports/pipeline' },
      { id: 'proposals', name: 'Proposal Conversion', path: '/reports/proposals' },
      { id: 'lead-forms', name: 'Lead Form Analytics', path: '/reports/lead-forms' },
      { id: 'sources', name: 'Lead Sources', path: '/reports/lead-sources' },
    ],
  },
  {
    id: 'customers',
    name: 'Customer Reports',
    icon: Users,
    reports: [
      { id: 'contacts', name: 'Contact Report', path: '/reports/contacts' },
      { id: 'repeat', name: 'Repeat Customers', path: '/reports/repeat-customers' },
      { id: 'lifetime', name: 'Customer Lifetime Value', path: '/reports/lifetime-value' },
    ],
  },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30d');

  const { data: summary, isLoading } = useQuery({
    queryKey: ['reports-summary', dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/reports/summary?period=${dateRange}`);
      if (!response.ok) {
        return {
          total_revenue: 0,
          total_bookings: 0,
          total_contacts: 0,
          total_proposals: 0,
          revenue_trend: 0,
          bookings_trend: 0,
        } as ReportSummary;
      }
      return response.json() as Promise<ReportSummary>;
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

  const formatTrend = (trend: number) => {
    const sign = trend >= 0 ? '+' : '';
    return `${sign}${trend.toFixed(1)}%`;
  };

  return (
    <>
      <EnterprisePageHeader
        title="Reports"
        subtitle="Analyze your business performance"
      />
      <Box className="px-6 py-3 border-b border-border flex items-center justify-end gap-3">
        <Select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="365d">Last Year</option>
          <option value="custom">Custom Range</option>
        </Select>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </Box>
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Grid cols={4} gap={4}>
              <Card className="p-4">
                <Stack direction="horizontal" gap={3} className="items-center mb-2">
                  <Box className="p-2 bg-success-100 rounded-card">
                    <DollarSign className="h-5 w-5 text-success-600" />
                  </Box>
                  <Text size="sm" className="text-muted-foreground">Total Revenue</Text>
                </Stack>
                {isLoading ? (
                  <Skeleton className="h-8" />
                ) : (
                  <>
                    <Body className="font-weight-bold">
                      {formatCurrency(summary?.total_revenue || 0)}
                    </Body>
                    <Body size="xs" className={(summary?.revenue_trend || 0) >= 0 ? 'text-success-600' : 'text-error-600'}>
                      {formatTrend(summary?.revenue_trend || 0)} vs last period
                    </Body>
                  </>
                )}
              </Card>
              <Card className="p-4">
                <Stack direction="horizontal" gap={3} className="items-center mb-2">
                  <Box className="p-2 bg-info-100 rounded-card">
                    <Calendar className="h-5 w-5 text-info-600" />
                  </Box>
                  <Text size="sm" className="text-muted-foreground">Total Bookings</Text>
                </Stack>
                {isLoading ? (
                  <Skeleton className="h-8" />
                ) : (
                  <>
                    <Body className="font-weight-bold">
                      {summary?.total_bookings || 0}
                    </Body>
                    <Body size="xs" className={(summary?.bookings_trend || 0) >= 0 ? 'text-success-600' : 'text-error-600'}>
                      {formatTrend(summary?.bookings_trend || 0)} vs last period
                    </Body>
                  </>
                )}
              </Card>
              <Card className="p-4">
                <Stack direction="horizontal" gap={3} className="items-center mb-2">
                  <Box className="p-2 bg-violet-100 rounded-card">
                    <Users className="h-5 w-5 text-violet-600" />
                  </Box>
                  <Text size="sm" className="text-muted-foreground">New Contacts</Text>
                </Stack>
                {isLoading ? (
                  <Skeleton className="h-8" />
                ) : (
                  <Body className="font-weight-bold">
                    {summary?.total_contacts || 0}
                  </Body>
                )}
              </Card>
              <Card className="p-4">
                <Stack direction="horizontal" gap={3} className="items-center mb-2">
                  <Box className="p-2 bg-warning-100 rounded-card">
                    <FileText className="h-5 w-5 text-warning-600" />
                  </Box>
                  <Text size="sm" className="text-muted-foreground">Proposals Sent</Text>
                </Stack>
                {isLoading ? (
                  <Skeleton className="h-8" />
                ) : (
                  <Body className="font-weight-bold">
                    {summary?.total_proposals || 0}
                  </Body>
                )}
              </Card>
            </Grid>

            <Grid cols={2} gap={6}>
              {REPORT_CATEGORIES.map((category) => (
                <Card key={category.id}>
                  <Box className="p-4 border-b border-border">
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <category.icon className="h-5 w-5 text-primary" />
                      <H2>{category.name}</H2>
                    </Stack>
                  </Box>
                  <Box className="divide-y divide-border">
                    {category.reports.map((report) => (
                      <Link
                        key={report.id}
                        href={report.path}
                        className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                      >
                        <Text size="sm">{report.name}</Text>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </Box>
                </Card>
              ))}
            </Grid>

            <Card className="p-6">
              <H2 className="mb-4">Quick Actions</H2>
              <Grid cols={4} gap={4}>
                <Button variant="outline" className="flex-col h-auto py-4">
                  <BarChart3 className="h-5 w-5 mb-2" />
                  Custom Report
                </Button>
                <Button variant="outline" className="flex-col h-auto py-4">
                  <Download className="h-5 w-5 mb-2" />
                  Export Data
                </Button>
                <Button variant="outline" className="flex-col h-auto py-4">
                  <Filter className="h-5 w-5 mb-2" />
                  Saved Filters
                </Button>
                <Button variant="outline" className="flex-col h-auto py-4">
                  <Calendar className="h-5 w-5 mb-2" />
                  Schedule Report
                </Button>
              </Grid>
            </Card>
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
