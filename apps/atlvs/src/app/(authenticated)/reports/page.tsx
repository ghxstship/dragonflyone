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
import { Button } from '@ghxstship/ui';

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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Reports</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Analyze your business performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="365d">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
          <Button variant="outline" size="sm" icon={<Download className="h-4 w-4" />} iconPosition="left">
            Export All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-success-100 rounded-card">
              <DollarSign className="h-5 w-5 text-success-600" />
            </div>
            <span className="text-body-sm text-muted-foreground">Total Revenue</span>
          </div>
          {isLoading ? (
            <div className="h-8 bg-muted animate-pulse rounded" />
          ) : (
            <>
              <p className="text-h3-md font-weight-bold text-foreground">
                {formatCurrency(summary?.total_revenue || 0)}
              </p>
              <p className={`text-body-xs ${(summary?.revenue_trend || 0) >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                {formatTrend(summary?.revenue_trend || 0)} vs last period
              </p>
            </>
          )}
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-info-100 rounded-card">
              <Calendar className="h-5 w-5 text-info-600" />
            </div>
            <span className="text-body-sm text-muted-foreground">Total Bookings</span>
          </div>
          {isLoading ? (
            <div className="h-8 bg-muted animate-pulse rounded" />
          ) : (
            <>
              <p className="text-h3-md font-weight-bold text-foreground">
                {summary?.total_bookings || 0}
              </p>
              <p className={`text-body-xs ${(summary?.bookings_trend || 0) >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                {formatTrend(summary?.bookings_trend || 0)} vs last period
              </p>
            </>
          )}
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-100 rounded-card">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
            <span className="text-body-sm text-muted-foreground">New Contacts</span>
          </div>
          {isLoading ? (
            <div className="h-8 bg-muted animate-pulse rounded" />
          ) : (
            <p className="text-h3-md font-weight-bold text-foreground">
              {summary?.total_contacts || 0}
            </p>
          )}
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-warning-100 rounded-card">
              <FileText className="h-5 w-5 text-warning-600" />
            </div>
            <span className="text-body-sm text-muted-foreground">Proposals Sent</span>
          </div>
          {isLoading ? (
            <div className="h-8 bg-muted animate-pulse rounded" />
          ) : (
            <p className="text-h3-md font-weight-bold text-foreground">
              {summary?.total_proposals || 0}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {REPORT_CATEGORIES.map((category) => (
          <div key={category.id} className="bg-background border-2 border-border rounded-card">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <category.icon className="h-5 w-5 text-primary" />
              <h2 className="text-h4-md font-weight-semibold text-foreground">{category.name}</h2>
            </div>
            <div className="divide-y divide-border">
              {category.reports.map((report) => (
                <Link
                  key={report.id}
                  href={report.path}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <span className="text-body-sm text-foreground">{report.name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h4-md font-weight-semibold text-foreground">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Button variant="outline" size="md" icon={<BarChart3 className="h-5 w-5" />} iconPosition="left" className="flex-col h-auto py-4">
            Custom Report
          </Button>
          <Button variant="outline" size="md" icon={<Download className="h-5 w-5" />} iconPosition="left" className="flex-col h-auto py-4">
            Export Data
          </Button>
          <Button variant="outline" size="md" icon={<Filter className="h-5 w-5" />} iconPosition="left" className="flex-col h-auto py-4">
            Saved Filters
          </Button>
          <Button variant="outline" size="md" icon={<Calendar className="h-5 w-5" />} iconPosition="left" className="flex-col h-auto py-4">
            Schedule Report
          </Button>
        </div>
      </div>
    </div>
  );
}
