'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Download, Calendar, DollarSign, TrendingUp, PieChart, AlertCircle, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface FinancialReport {
  id: string;
  name: string;
  type: 'profit_loss' | 'balance_sheet' | 'cash_flow' | 'revenue' | 'expenses' | 'custom';
  period_start: string;
  period_end: string;
  status: 'draft' | 'generated' | 'scheduled';
  generated_at?: string;
  file_url?: string;
  summary?: ReportSummary;
}

interface ReportSummary {
  total_revenue?: number;
  total_expenses?: number;
  net_income?: number;
  gross_margin?: number;
}

const DEMO_REPORTS: FinancialReport[] = [
  {
    id: 'FR-001',
    name: 'Q4 2024 Profit & Loss',
    type: 'profit_loss',
    period_start: '2024-10-01',
    period_end: '2024-12-31',
    status: 'generated',
    generated_at: '2025-01-05T10:00:00Z',
    file_url: '/reports/q4-2024-pnl.pdf',
    summary: { total_revenue: 485000, total_expenses: 312000, net_income: 173000, gross_margin: 35.7 },
  },
  {
    id: 'FR-002',
    name: 'Annual Revenue Report 2024',
    type: 'revenue',
    period_start: '2024-01-01',
    period_end: '2024-12-31',
    status: 'generated',
    generated_at: '2025-01-02T09:00:00Z',
    file_url: '/reports/annual-revenue-2024.pdf',
    summary: { total_revenue: 1850000 },
  },
  {
    id: 'FR-003',
    name: 'Monthly Expense Report - Dec 2024',
    type: 'expenses',
    period_start: '2024-12-01',
    period_end: '2024-12-31',
    status: 'generated',
    generated_at: '2025-01-01T08:00:00Z',
    file_url: '/reports/dec-2024-expenses.pdf',
    summary: { total_expenses: 98500 },
  },
  {
    id: 'FR-004',
    name: 'Q1 2025 Forecast',
    type: 'custom',
    period_start: '2025-01-01',
    period_end: '2025-03-31',
    status: 'scheduled',
  },
];

const REPORT_TYPES = [
  { id: 'profit_loss', name: 'Profit & Loss', icon: TrendingUp },
  { id: 'balance_sheet', name: 'Balance Sheet', icon: PieChart },
  { id: 'cash_flow', name: 'Cash Flow', icon: DollarSign },
  { id: 'revenue', name: 'Revenue', icon: TrendingUp },
  { id: 'expenses', name: 'Expenses', icon: DollarSign },
  { id: 'custom', name: 'Custom', icon: FileText },
];

export default function FinancialReportsPage() {
  const queryClient = useQueryClient();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['financial-reports', typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter) params.set('type', typeFilter);
      const response = await fetch(`/api/reports/financial?${params}`);
      if (!response.ok) {
        return { reports: DEMO_REPORTS };
      }
      const result = await response.json();
      return result.reports?.length ? result : { reports: DEMO_REPORTS };
    },
  });

  const reports: FinancialReport[] = data?.reports || DEMO_REPORTS;

  const filteredReports = typeFilter
    ? reports.filter((r) => r.type === typeFilter)
    : reports;

  const generateReport = useMutation({
    mutationFn: async (reportConfig: Partial<FinancialReport>) => {
      const response = await fetch('/api/reports/financial/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportConfig),
      });
      if (!response.ok) throw new Error('Failed to generate report');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-reports'] });
      setShowGenerateModal(false);
    },
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'profit_loss':
        return 'bg-success/20 text-success';
      case 'revenue':
        return 'bg-primary/20 text-primary';
      case 'expenses':
        return 'bg-warning/20 text-warning';
      case 'cash_flow':
        return 'bg-secondary/20 text-secondary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated':
        return 'bg-success/20 text-success';
      case 'scheduled':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const totalRevenue = reports
    .filter((r) => r.summary?.total_revenue)
    .reduce((sum, r) => Math.max(sum, r.summary?.total_revenue || 0), 0);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Failed to load financial reports</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['financial-reports'] })}
            className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-button"
          >
            Retry
          </button>
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
            <h1 className="text-h2-md font-weight-bold text-foreground">Financial Reports</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              Generate and manage financial reports
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
        >
          <FileText className="h-4 w-4" />
          <span className="text-body-sm font-weight-medium">Generate Report</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Total Reports</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{reports.length}</p>
        </div>
        <div className="bg-background border-2 border-success/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-success" />
            <span className="text-body-sm text-muted-foreground">Total Revenue</span>
          </div>
          <p className="text-h3-md font-weight-bold text-success">
            ${(totalRevenue / 1000000).toFixed(2)}M
          </p>
        </div>
        <div className="bg-background border-2 border-warning/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-warning" />
            <span className="text-body-sm text-muted-foreground">Scheduled</span>
          </div>
          <p className="text-h3-md font-weight-bold text-warning">
            {reports.filter((r) => r.status === 'scheduled').length}
          </p>
        </div>
        <div className="bg-background border-2 border-secondary/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            <span className="text-body-sm text-muted-foreground">Avg Margin</span>
          </div>
          <p className="text-h3-md font-weight-bold text-secondary">
            {reports.filter((r) => r.summary?.gross_margin).length > 0
              ? `${(reports.filter((r) => r.summary?.gross_margin).reduce((sum, r) => sum + (r.summary?.gross_margin || 0), 0) / reports.filter((r) => r.summary?.gross_margin).length).toFixed(1)}%`
              : '—'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:border-primary"
        >
          <option value="">All Types</option>
          {REPORT_TYPES.map((type) => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['financial-reports'] })}
          className="p-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {filteredReports.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No financial reports
          </h3>
          <p className="text-body-sm text-muted-foreground mb-4">
            Generate your first financial report
          </p>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button"
          >
            <FileText className="h-4 w-4" />
            Generate Report
          </button>
        </div>
      ) : (
        <div className="bg-background border-2 border-border rounded-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase">
                  Report
                </th>
                <th className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase">
                  Period
                </th>
                <th className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase">
                  Summary
                </th>
                <th className="text-right px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-weight-medium text-foreground">{report.name}</p>
                      {report.generated_at && (
                        <p className="text-body-xs text-muted-foreground">
                          Generated: {new Date(report.generated_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${getTypeColor(report.type)}`}>
                      {REPORT_TYPES.find((t) => t.id === report.type)?.name || report.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-body-sm text-muted-foreground">
                    {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${getStatusColor(report.status)}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {report.summary ? (
                      <div className="text-body-xs">
                        {report.summary.total_revenue && (
                          <span className="text-success">Rev: ${(report.summary.total_revenue / 1000).toFixed(0)}K</span>
                        )}
                        {report.summary.net_income && (
                          <span className="ml-2 text-primary">Net: ${(report.summary.net_income / 1000).toFixed(0)}K</span>
                        )}
                        {report.summary.gross_margin && (
                          <span className="ml-2 text-secondary">{report.summary.gross_margin}%</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-body-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {report.file_url && (
                        <a
                          href={report.file_url}
                          download
                          className="p-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                      <Link
                        href={`/reports/financial/${report.id}`}
                        className="px-3 py-1.5 text-body-xs bg-muted rounded-button hover:bg-muted/80 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-lg w-full mx-4">
            <h3 className="text-h4-md font-weight-semibold text-foreground mb-4">
              Generate Financial Report
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                generateReport.mutate({
                  name: formData.get('name') as string,
                  type: formData.get('type') as FinancialReport['type'],
                  period_start: formData.get('period_start') as string,
                  period_end: formData.get('period_end') as string,
                  status: 'draft',
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Report Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Q1 2025 Profit & Loss"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Report Type *
                </label>
                <select
                  name="type"
                  required
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                >
                  {REPORT_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Period Start *
                  </label>
                  <input
                    type="date"
                    name="period_start"
                    required
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Period End *
                  </label>
                  <input
                    type="date"
                    name="period_end"
                    required
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generateReport.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {generateReport.isPending ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
