'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, FileText, Database, Calendar, Check, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ExportJob {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  download_url?: string;
  file_size?: string;
  records_count?: number;
}

const EXPORT_TYPES = [
  { id: 'projects', label: 'Projects', description: 'All projects with details, budgets, and timelines', icon: FileText },
  { id: 'contacts', label: 'Contacts', description: 'Contact list with all associated data', icon: Database },
  { id: 'invoices', label: 'Invoices', description: 'Invoice history and payment records', icon: FileText },
  { id: 'bookings', label: 'Bookings', description: 'Booking records and schedules', icon: Calendar },
  { id: 'finances', label: 'Financial Reports', description: 'Revenue, expenses, and financial summaries', icon: Database },
  { id: 'all', label: 'Complete Export', description: 'Export all data (may take longer)', icon: Database },
];

const DEMO_EXPORTS: ExportJob[] = [
  { id: 'exp-001', type: 'projects', status: 'completed', created_at: '2025-01-12T10:00:00Z', completed_at: '2025-01-12T10:02:00Z', download_url: '/exports/projects-2025-01-12.csv', file_size: '2.4 MB', records_count: 156 },
  { id: 'exp-002', type: 'contacts', status: 'completed', created_at: '2025-01-10T15:30:00Z', completed_at: '2025-01-10T15:31:00Z', download_url: '/exports/contacts-2025-01-10.csv', file_size: '1.1 MB', records_count: 892 },
  { id: 'exp-003', type: 'invoices', status: 'processing', created_at: '2025-01-13T09:00:00Z' },
];

export default function DataExportPage() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [exportFormat, setExportFormat] = useState('csv');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['export-jobs'],
    queryFn: async () => {
      const response = await fetch('/api/settings/export');
      if (!response.ok) {
        return { jobs: DEMO_EXPORTS };
      }
      return response.json();
    },
    refetchInterval: 5000,
  });

  const jobs: ExportJob[] = data?.jobs || DEMO_EXPORTS;

  const createExport = useMutation({
    mutationFn: async (exportConfig: { type: string; format: string; date_range?: { start: string; end: string } }) => {
      const response = await fetch('/api/settings/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportConfig),
      });
      if (!response.ok) throw new Error('Failed to create export');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-jobs'] });
      setSelectedType(null);
      setDateRange({ start: '', end: '' });
    },
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-success" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success';
      case 'processing':
        return 'bg-primary/10 text-primary';
      case 'pending':
        return 'bg-muted text-muted-foreground';
      case 'failed':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading export settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="text-destructive">Failed to load export settings</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-h2-md font-weight-bold text-foreground flex items-center gap-2">
              <Download className="h-6 w-6" />
              Data Export
            </h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              Export your data for backup or migration
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 hover:bg-muted rounded-button transition-colors"
        >
          <RefreshCw className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Export Types */}
      <div className="bg-background border-2 border-border rounded-card p-6">
        <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Select Data to Export</h2>
        <div className="grid grid-cols-2 gap-4">
          {EXPORT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`text-left p-4 rounded-card border-2 transition-colors ${
                selectedType === type.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <type.icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-body-md font-weight-medium text-foreground">{type.label}</p>
                  <p className="text-body-sm text-muted-foreground">{type.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Export Options */}
      {selectedType && (
        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Export Options</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Format
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                >
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel (XLSX)</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Date Range (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="flex-1 px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="flex-1 px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => setSelectedType(null)}
                className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  createExport.mutate({
                    type: selectedType,
                    format: exportFormat,
                    date_range: dateRange.start ? dateRange : undefined,
                  })
                }
                disabled={createExport.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {createExport.isPending ? 'Starting Export...' : 'Start Export'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export History */}
      <div className="bg-background border-2 border-border rounded-card p-6">
        <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Export History</h2>
        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <Download className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-body-sm text-muted-foreground">No exports yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-card"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(job.status)}
                  <div>
                    <p className="text-body-sm font-weight-medium text-foreground capitalize">
                      {job.type} Export
                    </p>
                    <p className="text-body-xs text-muted-foreground">
                      {formatDate(job.created_at)}
                      {job.records_count && ` • ${job.records_count} records`}
                      {job.file_size && ` • ${job.file_size}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 text-body-xs rounded capitalize ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                  {job.status === 'completed' && job.download_url && (
                    <a
                      href={job.download_url}
                      download
                      className="p-2 text-primary hover:bg-primary/10 rounded-button transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
