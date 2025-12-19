'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bug, Plus, Search, Clock, AlertCircle, CheckCircle, Filter, Upload, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'confirmed' | 'in_progress' | 'fixed' | 'closed' | 'wont_fix';
  category: string;
  created_at: string;
  updated_at: string;
  reporter: string;
  browser?: string;
  os?: string;
}

const DEMO_BUGS: BugReport[] = [
  { id: 'BUG-001', title: 'PDF export fails for large budget reports', description: 'When exporting budget reports with more than 100 line items to PDF, the export fails with a timeout error.', severity: 'high', status: 'in_progress', category: 'Export', created_at: '2025-01-13T10:00:00Z', updated_at: '2025-01-13T14:00:00Z', reporter: 'John D.', browser: 'Chrome 120', os: 'macOS' },
  { id: 'BUG-002', title: 'Calendar sync duplicates events', description: 'When syncing with Google Calendar, some events are being duplicated.', severity: 'medium', status: 'confirmed', category: 'Integrations', created_at: '2025-01-12T09:00:00Z', updated_at: '2025-01-12T15:00:00Z', reporter: 'Sarah M.', browser: 'Firefox 121', os: 'Windows 11' },
  { id: 'BUG-003', title: 'Notification preferences not saving', description: 'Changes to email notification preferences are not persisting after page refresh.', severity: 'low', status: 'fixed', category: 'Settings', created_at: '2025-01-10T11:00:00Z', updated_at: '2025-01-11T10:00:00Z', reporter: 'Mike R.', browser: 'Safari 17', os: 'iOS' },
  { id: 'BUG-004', title: 'App crashes on expense submission', description: 'The app crashes when submitting an expense with an attachment larger than 5MB.', severity: 'critical', status: 'reported', category: 'Expenses', created_at: '2025-01-13T08:00:00Z', updated_at: '2025-01-13T08:00:00Z', reporter: 'Lisa K.', browser: 'Chrome 120', os: 'Android' },
  { id: 'BUG-005', title: 'Incorrect timezone in call sheets', description: 'Call sheet times are displaying in UTC instead of the production timezone.', severity: 'high', status: 'fixed', category: 'Scheduling', created_at: '2025-01-08T14:00:00Z', updated_at: '2025-01-09T16:00:00Z', reporter: 'Tom H.', browser: 'Edge 120', os: 'Windows 10' },
];

const CATEGORIES = ['All', 'Export', 'Integrations', 'Settings', 'Expenses', 'Scheduling', 'UI', 'Authentication', 'API'];
const SEVERITY_OPTIONS = ['all', 'low', 'medium', 'high', 'critical'];
const STATUS_OPTIONS = ['all', 'reported', 'confirmed', 'in_progress', 'fixed', 'closed'];

export default function BugReportsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [newReport, setNewReport] = useState<{
    title: string;
    description: string;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    steps_to_reproduce: string;
    browser: string;
    os: string;
  }>({
    title: '',
    description: '',
    category: 'UI',
    severity: 'medium',
    steps_to_reproduce: '',
    browser: '',
    os: '',
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['bug-reports', categoryFilter, severityFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/feedback/bugs?${params}`);
      if (!response.ok) {
        return { bugs: DEMO_BUGS };
      }
      return response.json();
    },
  });

  const bugs: BugReport[] = data?.bugs || DEMO_BUGS;

  const createReport = useMutation({
    mutationFn: async (reportData: typeof newReport) => {
      const formData = new FormData();
      Object.entries(reportData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });
      
      const response = await fetch('/api/feedback/bugs', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to submit report');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bug-reports'] });
      setShowNewReportModal(false);
      setNewReport({ title: '', description: '', category: 'UI', severity: 'medium', steps_to_reproduce: '', browser: '', os: '' });
      setAttachments([]);
    },
  });

  const filteredBugs = bugs.filter((bug) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!bug.title.toLowerCase().includes(query) && !bug.description.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning/10 text-warning';
      case 'medium': return 'bg-primary/10 text-primary';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-muted text-muted-foreground';
      case 'confirmed': return 'bg-warning/10 text-warning';
      case 'in_progress': return 'bg-info/10 text-info';
      case 'fixed': return 'bg-success/10 text-success';
      case 'closed': return 'bg-muted text-muted-foreground';
      case 'wont_fix': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reported': return <AlertCircle className="h-4 w-4" />;
      case 'confirmed': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'fixed': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading bug reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="text-destructive">Failed to load bug reports</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/help"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-h2-md font-weight-bold text-foreground flex items-center gap-2">
              <Bug className="h-6 w-6" />
              Bug Reports
            </h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              Report issues and track their resolution
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowNewReportModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Report Bug
        </button>
      </div>

      {/* Filters */}
      <div className="bg-background border-2 border-border rounded-card p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search bugs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
            >
              {SEVERITY_OPTIONS.map((sev) => (
                <option key={sev} value={sev}>
                  {sev === 'all' ? 'All Severity' : sev.charAt(0).toUpperCase() + sev.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bug List */}
      <div className="bg-background border-2 border-border rounded-card">
        {filteredBugs.length === 0 ? (
          <div className="p-8 text-center">
            <Bug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-body-md text-muted-foreground">No bug reports found</p>
            <button
              onClick={() => setShowNewReportModal(true)}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
            >
              Report the First Bug
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredBugs.map((bug) => (
              <div key={bug.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-body-xs text-muted-foreground font-mono">{bug.id}</span>
                      <span className={`px-2 py-0.5 text-body-xs rounded capitalize ${getSeverityColor(bug.severity)}`}>
                        {bug.severity}
                      </span>
                      <span className={`px-2 py-0.5 text-body-xs rounded capitalize flex items-center gap-1 ${getStatusColor(bug.status)}`}>
                        {getStatusIcon(bug.status)}
                        {bug.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-body-md font-weight-medium text-foreground">{bug.title}</h3>
                    <p className="text-body-sm text-muted-foreground mt-1 line-clamp-2">{bug.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-body-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(bug.created_at)}
                      </span>
                      <span className="px-2 py-0.5 bg-muted rounded">{bug.category}</span>
                      <span>by {bug.reporter}</span>
                      {bug.browser && <span>{bug.browser}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Report Modal */}
      {showNewReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-lg w-full mx-4">
            <h3 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Report a Bug
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createReport.mutate(newReport);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newReport.title}
                  onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                  required
                  placeholder="Brief description of the bug"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Description *
                </label>
                <textarea
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  required
                  rows={3}
                  placeholder="What happened? What did you expect to happen?"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Steps to Reproduce
                </label>
                <textarea
                  value={newReport.steps_to_reproduce}
                  onChange={(e) => setNewReport({ ...newReport, steps_to_reproduce: e.target.value })}
                  rows={3}
                  placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Category
                  </label>
                  <select
                    value={newReport.category}
                    onChange={(e) => setNewReport({ ...newReport, category: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  >
                    {CATEGORIES.slice(1).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Severity
                  </label>
                  <select
                    value={newReport.severity}
                    onChange={(e) => setNewReport({ ...newReport, severity: e.target.value as 'low' | 'medium' | 'high' | 'critical' })}
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  >
                    <option value="low">Low - Minor issue</option>
                    <option value="medium">Medium - Affects workflow</option>
                    <option value="high">High - Major feature broken</option>
                    <option value="critical">Critical - System unusable</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Browser
                  </label>
                  <input
                    type="text"
                    value={newReport.browser}
                    onChange={(e) => setNewReport({ ...newReport, browser: e.target.value })}
                    placeholder="e.g., Chrome 120"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Operating System
                  </label>
                  <input
                    type="text"
                    value={newReport.os}
                    onChange={(e) => setNewReport({ ...newReport, os: e.target.value })}
                    placeholder="e.g., macOS 14"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Attachments
                </label>
                <div className="border-2 border-dashed border-border rounded-card p-4">
                  {attachments.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-button">
                          <span className="text-body-sm truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="p-1 hover:bg-background rounded-button"
                          >
                            <X className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="flex items-center justify-center gap-2 p-2 cursor-pointer hover:bg-muted rounded-button transition-colors">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-body-sm text-muted-foreground">Add screenshots or files</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.txt,.log"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewReportModal(false)}
                  className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createReport.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createReport.isPending ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
