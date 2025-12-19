'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, AlertTriangle, CheckCircle, Clock, Filter } from 'lucide-react';
import { useVendorIssues, useCreateVendorIssue, useUpdateVendorIssue, type VendorIssue } from '@/hooks/useVendorPerformance';
import { useVendorProfile } from '@/hooks/useVendorProfiles';

const SEVERITY_CONFIG = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', color: 'bg-warning/20 text-warning' },
  high: { label: 'High', color: 'bg-destructive/20 text-destructive' },
  critical: { label: 'Critical', color: 'bg-destructive text-destructive-foreground' },
};

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-destructive/20 text-destructive' },
  in_progress: { label: 'In Progress', color: 'bg-warning/20 text-warning' },
  resolved: { label: 'Resolved', color: 'bg-success/20 text-success' },
  closed: { label: 'Closed', color: 'bg-muted text-muted-foreground' },
  escalated: { label: 'Escalated', color: 'bg-destructive text-destructive-foreground' },
};

const ISSUE_TYPES = [
  'Quality Issue',
  'Late Delivery',
  'Communication',
  'Billing Dispute',
  'Contract Violation',
  'Safety Concern',
  'Other',
];

export default function VendorIssuesPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');

  const { data: vendorData } = useVendorProfile(id);
  const { data: issuesData, isLoading, error } = useVendorIssues(id, {
    status: statusFilter || undefined,
    severity: severityFilter || undefined,
  });
  const createMutation = useCreateVendorIssue();
  const updateMutation = useUpdateVendorIssue();

  const [formData, setFormData] = useState({
    issue_type: '',
    severity: 'medium' as VendorIssue['severity'],
    title: '',
    description: '',
  });

  const vendor = vendorData?.vendor;
  const issues = issuesData?.issues || [];
  const stats = issuesData?.stats;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.issue_type || !formData.description) return;

    await createMutation.mutateAsync({
      vendorId: id,
      input: {
        organization_id: 'current',
        issue_type: formData.issue_type,
        severity: formData.severity,
        title: formData.title,
        description: formData.description,
      },
    });
    setShowForm(false);
    setFormData({ issue_type: '', severity: 'medium', title: '', description: '' });
  };

  const handleResolve = async (issueId: string) => {
    await updateMutation.mutateAsync({
      vendorId: id,
      issueId,
      input: { status: 'resolved' },
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="h-48 bg-muted rounded-card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to load issues. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href={`/vendors/${id}`}
            className="p-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </a>
          <div>
            <h1 className="text-h2-md font-weight-bold text-foreground">
              Issues: {vendor?.name || 'Vendor'}
            </h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              Track and resolve vendor-related issues
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-button border-2 border-destructive font-weight-medium text-body-sm hover:bg-destructive/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Report Issue
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-background border-2 border-border rounded-card p-4">
            <p className="text-body-xs text-muted-foreground mb-1">Total Issues</p>
            <p className="text-h3-md font-weight-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-background border-2 border-destructive/50 rounded-card p-4">
            <p className="text-body-xs text-muted-foreground mb-1">Open</p>
            <p className="text-h3-md font-weight-bold text-destructive">{stats.open}</p>
          </div>
          <div className="bg-background border-2 border-warning/50 rounded-card p-4">
            <p className="text-body-xs text-muted-foreground mb-1">In Progress</p>
            <p className="text-h3-md font-weight-bold text-warning">{stats.in_progress}</p>
          </div>
          <div className="bg-background border-2 border-success/50 rounded-card p-4">
            <p className="text-body-xs text-muted-foreground mb-1">Resolved</p>
            <p className="text-h3-md font-weight-bold text-success">{stats.resolved}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-background border-2 border-destructive/50 rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Report New Issue</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Issue Type *
                </label>
                <select
                  value={formData.issue_type}
                  onChange={(e) => setFormData({ ...formData, issue_type: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="">Select type</option>
                  {ISSUE_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Severity *
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as VendorIssue['severity'] })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {Object.entries(SEVERITY_CONFIG).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Title *
              </label>
              <input
                type="text"
                placeholder="Brief summary of the issue"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Description *
              </label>
              <textarea
                rows={3}
                placeholder="Detailed description of the issue..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-button border-2 border-destructive font-weight-medium text-body-sm hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? 'Reporting...' : 'Report Issue'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Severity</option>
          {Object.entries(SEVERITY_CONFIG).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {issues.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
          <h3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No issues found
          </h3>
          <p className="text-body-sm text-muted-foreground">
            {statusFilter || severityFilter ? 'Try adjusting your filters' : 'No issues have been reported for this vendor'}
          </p>
        </div>
      )}

      {issues.length > 0 && (
        <div className="space-y-4">
          {issues.map((issue) => {
            const severityConfig = SEVERITY_CONFIG[issue.severity];
            const statusConfig = STATUS_CONFIG[issue.status];

            return (
              <div key={issue.id} className="bg-background border-2 border-border rounded-card p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-5 w-5 ${
                      issue.severity === 'critical' ? 'text-destructive' :
                      issue.severity === 'high' ? 'text-destructive' :
                      issue.severity === 'medium' ? 'text-warning' : 'text-muted-foreground'
                    }`} />
                    <div>
                      <h3 className="text-body-md font-weight-semibold text-foreground">{issue.title}</h3>
                      <p className="text-body-xs text-muted-foreground">
                        {issue.issue_type} • Reported {new Date(issue.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${severityConfig.color}`}>
                      {severityConfig.label}
                    </span>
                    <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                <p className="text-body-sm text-foreground mb-4">{issue.description}</p>

                {issue.resolution && (
                  <div className="bg-success/10 border-l-4 border-success p-3 mb-4">
                    <p className="text-body-xs text-muted-foreground mb-1">Resolution</p>
                    <p className="text-body-sm">{issue.resolution}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-body-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Updated {new Date(issue.updated_at).toLocaleDateString()}
                  </div>
                  {issue.status !== 'resolved' && issue.status !== 'closed' && (
                    <button
                      onClick={() => handleResolve(issue.id)}
                      disabled={updateMutation.isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-success text-success-foreground rounded-button text-body-xs font-weight-medium hover:bg-success/90 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
