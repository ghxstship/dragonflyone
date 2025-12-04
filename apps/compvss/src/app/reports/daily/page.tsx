'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, CheckCircle, Send, Calendar, Users, DollarSign } from 'lucide-react';
import { CompvssAppLayout } from '../../../components/app-layout';
import { useDailyReports, useReportStats, useSubmitDailyReport, useApproveDailyReport } from '../../../hooks/useReports';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Stack,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';

interface DailyReport {
  id: string;
  report_date: string;
  status: string;
  attendance?: number;
  revenue?: number;
  highlights?: string;
  challenges?: string;
  submitted_at?: string;
  show?: { id: string; title: string; show_date: string };
  submitter?: { id: string; first_name: string; last_name: string };
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  approved: 'success',
  submitted: 'warning',
  reviewed: 'info',
  draft: 'default',
};

const columns: ListPageColumn<DailyReport>[] = [
  { 
    key: 'report_date', 
    label: 'Date', 
    accessor: 'report_date', 
    sortable: true,
    render: (value) => new Date(String(value)).toLocaleDateString()
  },
  { 
    key: 'show', 
    label: 'Show', 
    accessor: (row) => row.show?.title || '—',
    sortable: true,
  },
  { 
    key: 'submitter', 
    label: 'Submitted By', 
    accessor: (row) => row.submitter ? `${row.submitter.first_name} ${row.submitter.last_name}` : '—',
    sortable: true,
  },
  { 
    key: 'attendance', 
    label: 'Attendance', 
    accessor: 'attendance', 
    sortable: true,
    render: (value) => value ? value.toLocaleString() : '—'
  },
  { 
    key: 'revenue', 
    label: 'Revenue', 
    accessor: 'revenue', 
    sortable: true,
    render: (value) => value ? `$${Number(value).toLocaleString()}` : '—'
  },
  { 
    key: 'status', 
    label: 'Status', 
    accessor: 'status', 
    sortable: true,
    render: (value) => (
      <Badge variant={statusColors[String(value)] || 'default'}>
        {String(value).toUpperCase()}
      </Badge>
    )
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'report_date', label: 'Report Date', type: 'date', required: true },
  { name: 'show_id', label: 'Show', type: 'select', options: [] }, // Populated dynamically
  { name: 'weather_conditions', label: 'Weather Conditions', type: 'text', placeholder: 'e.g., Clear, 75°F' },
  { name: 'attendance', label: 'Attendance', type: 'number', placeholder: '0' },
  { name: 'revenue', label: 'Revenue', type: 'number', placeholder: '0.00' },
  { name: 'highlights', label: 'Highlights', type: 'textarea', colSpan: 2, placeholder: 'What went well today...' },
  { name: 'challenges', label: 'Challenges', type: 'textarea', colSpan: 2, placeholder: 'Any issues or challenges...' },
  { name: 'incidents_summary', label: 'Incidents Summary', type: 'textarea', colSpan: 2, placeholder: 'Summary of any incidents...' },
];

export default function DailyReportsPage() {
  const router = useRouter();
  const { data: reports, isLoading, error, refetch } = useDailyReports();
  const { data: stats } = useReportStats();
  const submitMutation = useSubmitDailyReport();
  const approveMutation = useApproveDailyReport();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [reportToApprove, setReportToApprove] = useState<DailyReport | null>(null);

  const filters: ListPageFilter[] = [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'reviewed', label: 'Reviewed' },
        { value: 'approved', label: 'Approved' },
      ]
    },
  ];

  const rowActions: ListPageAction<DailyReport>[] = [
    { 
      id: 'view', 
      label: 'View Report', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => router.push(`/reports/daily/${row.id}`) 
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (row) => { setSelectedReport(row); setDrawerOpen(true); },
      hidden: (row) => row.status === 'approved'
    },
    { 
      id: 'submit', 
      label: 'Submit for Review', 
      icon: <Send className="size-4" />, 
      onClick: async (row) => {
        await submitMutation.mutateAsync(row.id);
        refetch();
      },
      hidden: (row) => row.status !== 'draft'
    },
    { 
      id: 'approve', 
      label: 'Approve', 
      icon: <CheckCircle className="size-4" />, 
      onClick: (row) => { setReportToApprove(row); setApproveDialogOpen(true); },
      hidden: (row) => row.status !== 'submitted'
    },
  ];

  const handleCreate = async (_data: Record<string, unknown>) => {
    // TODO: Implement create
    setCreateModalOpen(false);
    refetch();
  };

  const handleApprove = async () => {
    if (reportToApprove) {
      await approveMutation.mutateAsync({
        id: reportToApprove.id,
        reviewerId: user?.id || '', 
      });
      setApproveDialogOpen(false);
      setReportToApprove(null);
      refetch();
    }
  };

  const pageStats = [
    { label: 'Total Reports', value: stats?.totalDaily || 0 },
    { label: 'Pending Review', value: stats?.dailyPending || 0 },
    { label: 'Approved', value: stats?.dailyApproved || 0 },
    { label: 'Total Attendance', value: stats?.totalAttendance?.toLocaleString() || 0 },
  ];

  const detailSections: DetailSection[] = selectedReport ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Date</Body>
            <Body>{new Date(selectedReport.report_date).toLocaleDateString()}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Show</Body>
            <Body>{selectedReport.show?.title || '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Attendance</Body>
            <Body>{selectedReport.attendance?.toLocaleString() || '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Revenue</Body>
            <Body>{selectedReport.revenue ? `$${selectedReport.revenue.toLocaleString()}` : '—'}</Body>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'highlights',
      title: 'Highlights',
      content: <Body>{selectedReport.highlights || 'No highlights recorded.'}</Body>,
    },
    {
      id: 'challenges',
      title: 'Challenges',
      content: <Body>{selectedReport.challenges || 'No challenges recorded.'}</Body>,
    },
  ] : [];

  return (
    <CompvssAppLayout>
      <ListPage<DailyReport>
        title="Daily Reports"
        subtitle="Track daily operations, attendance, and revenue"
        data={reports || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search reports..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => router.push(`/reports/daily/${row.id}`)}
        createLabel="New Daily Report"
        onCreate={() => setCreateModalOpen(true)}
        stats={pageStats}
        emptyMessage="No daily reports yet"
        emptyAction={{ label: 'Create First Report', onClick: () => setCreateModalOpen(true) }}
        breadcrumbs={[
          { label: 'COMPVSS', href: '/dashboard' }, 
          { label: 'Reports' },
          { label: 'Daily' }
        ]}
        quickActions={[
          { id: 'wrap', label: 'Wrap Reports', icon: <Calendar className="size-4" />, onClick: () => router.push('/reports/wrap') },
        ]}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Daily Report"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
        defaultValues={{ report_date: new Date().toISOString().split('T')[0] }}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedReport}
        title={(r) => `Daily Report - ${new Date(r.report_date).toLocaleDateString()}`}
        subtitle={(r) => r.show?.title || 'No show'}
        sections={detailSections}
        onEdit={(r) => router.push(`/reports/daily/${r.id}`)}
      />

      <ConfirmDialog
        open={approveDialogOpen}
        title="Approve Report"
        message={`Are you sure you want to approve this daily report for ${reportToApprove ? new Date(reportToApprove.report_date).toLocaleDateString() : ''}?`}
        variant="default"
        confirmLabel="Approve"
        onConfirm={handleApprove}
        onCancel={() => { setApproveDialogOpen(false); setReportToApprove(null); }}
      />
    </CompvssAppLayout>
  );
}
