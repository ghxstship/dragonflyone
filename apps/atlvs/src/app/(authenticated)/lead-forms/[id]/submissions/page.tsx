'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Download, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useLeadForm } from '@/hooks/useLeadForms';
import { useQuery } from '@tanstack/react-query';
import {
  Body,
  Button,
  H1,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

interface Submission {
  id: string;
  form_id: string;
  data: Record<string, unknown>;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected';
  source_url?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export default function LeadFormSubmissionsPage() {
  const params = useParams();
  const formId = params.id as string;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: form } = useLeadForm(formId);

  const { data: submissionsData, isLoading, error } = useQuery({
    queryKey: ['lead-form-submissions', formId, statusFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (statusFilter) queryParams.set('status', statusFilter);
      const response = await fetch(`/api/lead-forms/${formId}/submissions?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch submissions');
      return response.json();
    },
    enabled: !!formId,
  });

  const submissions: Submission[] = submissionsData?.submissions || [];

  const filteredSubmissions = submissions.filter((sub) => {
    if (!searchQuery) return true;
    const dataString = JSON.stringify(sub.data).toLowerCase();
    return dataString.includes(searchQuery.toLowerCase());
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'converted':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'new':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'converted':
        return 'bg-success-100 text-success-800';
      case 'rejected':
        return 'bg-error-100 text-error-800';
      case 'new':
        return 'bg-warning-100 text-warning-800';
      case 'contacted':
        return 'bg-info-100 text-info-800';
      case 'qualified':
        return 'bg-violet-100 text-violet-800';
      default:
        return 'bg-ink-100 text-ink-800';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/lead-forms/${formId}`}
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground">Submissions</H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              {form?.name || 'Lead Form'} • {submissions.length} total submissions
            </Body>
          </div>
        </div>
        <Button variant="outline" size="sm" icon={<Download className="h-4 w-4" />} iconPosition="left">
          Export CSV
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>

      {error ? (
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <Body className="text-destructive">Failed to load submissions</Body>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <Body className="text-body-md text-muted-foreground">
            {searchQuery || statusFilter ? 'No submissions match your filters' : 'No submissions yet'}
          </Body>
        </div>
      ) : (
        <div className="bg-background border-2 border-border rounded-card overflow-hidden">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/30">
                <TableHead className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Data
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="px-4 py-3 text-right text-body-sm font-weight-medium text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id} className="border-b border-border hover:bg-muted/30">
                  <TableCell className="px-4 py-3 text-body-sm text-muted-foreground">
                    {formatDate(submission.created_at)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="max-w-md">
                      {Object.entries(submission.data).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="text-body-sm">
                          <Text className="text-muted-foreground">{key}:</Text>{' '}
                          <Text className="text-foreground">{String(value)}</Text>
                        </div>
                      ))}
                      {Object.keys(submission.data).length > 3 && (
                        <Text className="text-body-xs text-muted-foreground">
                          +{Object.keys(submission.data).length - 3} more fields
                        </Text>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Text className={`inline-flex items-center gap-1 px-2 py-1 rounded text-body-xs capitalize ${getStatusColor(submission.status)}`}>
                      {getStatusIcon(submission.status)}
                      {submission.status}
                    </Text>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="p-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
