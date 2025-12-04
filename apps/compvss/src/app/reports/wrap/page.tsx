'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, CheckCircle, Send, FileText, TrendingUp, DollarSign, Users } from 'lucide-react';
import { CompvssAppLayout } from '../../../components/app-layout';
import { useWrapReports, useReportStats } from '../../../hooks/useReports';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  Grid,
  Stack,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';

interface WrapReport {
  id: string;
  title: string;
  status: string;
  total_shows: number;
  total_attendance: number;
  total_revenue: number;
  total_expenses: number;
  net_profit?: number;
  submitted_at?: string;
  production?: { id: string; title: string };
  submitter?: { id: string; first_name: string; last_name: string };
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  approved: 'success',
  submitted: 'warning',
  reviewed: 'info',
  draft: 'default',
};

const columns: ListPageColumn<WrapReport>[] = [
  { 
    key: 'title', 
    label: 'Title', 
    accessor: 'title', 
    sortable: true,
  },
  { 
    key: 'production', 
    label: 'Production', 
    accessor: (row) => row.production?.title || '—',
    sortable: true,
  },
  { 
    key: 'total_shows', 
    label: 'Shows', 
    accessor: 'total_shows', 
    sortable: true,
  },
  { 
    key: 'total_attendance', 
    label: 'Attendance', 
    accessor: 'total_attendance', 
    sortable: true,
    render: (value) => value ? Number(value).toLocaleString() : '—'
  },
  { 
    key: 'total_revenue', 
    label: 'Revenue', 
    accessor: 'total_revenue', 
    sortable: true,
    render: (value) => value ? `$${Number(value).toLocaleString()}` : '—'
  },
  { 
    key: 'net_profit', 
    label: 'Net Profit', 
    accessor: 'net_profit', 
    sortable: true,
    render: (value) => {
      if (value === null || value === undefined) return '—';
      const num = Number(value);
      const color = num >= 0 ? 'text-success' : 'text-error';
      return <Body className={color}>${Math.abs(num).toLocaleString()}{num < 0 ? ' (Loss)' : ''}</Body>;
    }
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
  { name: 'title', label: 'Report Title', type: 'text', required: true, placeholder: 'e.g., Summer Festival 2024 Wrap Report', colSpan: 2 },
  { name: 'total_shows', label: 'Total Shows', type: 'number', required: true, placeholder: '0' },
  { name: 'total_attendance', label: 'Total Attendance', type: 'number', required: true, placeholder: '0' },
  { name: 'total_revenue', label: 'Total Revenue', type: 'number', required: true, placeholder: '0.00' },
  { name: 'total_expenses', label: 'Total Expenses', type: 'number', required: true, placeholder: '0.00' },
  { name: 'total_incidents', label: 'Total Incidents', type: 'number', placeholder: '0' },
  { name: 'capacity_utilization', label: 'Capacity Utilization (%)', type: 'number', placeholder: '0' },
  { name: 'successes', label: 'Successes', type: 'textarea', colSpan: 2, placeholder: 'What went well...' },
  { name: 'challenges', label: 'Challenges', type: 'textarea', colSpan: 2, placeholder: 'What could be improved...' },
  { name: 'recommendations', label: 'Recommendations', type: 'textarea', colSpan: 2, placeholder: 'Recommendations for future...' },
];

export default function WrapReportsPage() {
  const router = useRouter();
  const { data: reports, isLoading, error, refetch } = useWrapReports();
  const { data: stats } = useReportStats();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WrapReport | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const rowActions: ListPageAction<WrapReport>[] = [
    { 
      id: 'view', 
      label: 'View Report', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => router.push(`/reports/wrap/${row.id}`) 
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
      onClick: (_row) => {},
      hidden: (row) => row.status !== 'draft'
    },
    { 
      id: 'approve', 
      label: 'Approve', 
      icon: <CheckCircle className="size-4" />, 
      onClick: (_row) => {},
      hidden: (row) => row.status !== 'submitted'
    },
  ];

  const handleCreate = async (_data: Record<string, unknown>) => {
    // TODO: Implement create
    setCreateModalOpen(false);
    refetch();
  };

  const pageStats = [
    { label: 'Total Wrap Reports', value: stats?.totalWrap || 0 },
    { label: 'Pending Review', value: stats?.wrapPending || 0 },
    { label: 'Approved', value: stats?.wrapApproved || 0 },
    { label: 'Total Revenue', value: stats?.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : '$0' },
  ];

  const detailSections: DetailSection[] = selectedReport ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Production</Body>
            <Body>{selectedReport.production?.title || '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Total Shows</Body>
            <Body>{selectedReport.total_shows}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Total Attendance</Body>
            <Body>{selectedReport.total_attendance?.toLocaleString()}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Total Revenue</Body>
            <Body>${selectedReport.total_revenue?.toLocaleString()}</Body>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'financials',
      title: 'Financial Summary',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Revenue</Body>
            <Body className="text-success">${selectedReport.total_revenue?.toLocaleString()}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Expenses</Body>
            <Body className="text-error">${selectedReport.total_expenses?.toLocaleString()}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Net Profit</Body>
            <Body className={selectedReport.net_profit && selectedReport.net_profit >= 0 ? 'text-success' : 'text-error'}>
              ${Math.abs(selectedReport.net_profit || 0).toLocaleString()}
              {selectedReport.net_profit && selectedReport.net_profit < 0 ? ' (Loss)' : ''}
            </Body>
          </Stack>
        </Grid>
      ),
    },
  ] : [];

  return (
    <CompvssAppLayout>
      <ListPage<WrapReport>
        title="Wrap Reports"
        subtitle="Post-production summary reports with financial and operational metrics"
        data={reports || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search wrap reports..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => router.push(`/reports/wrap/${row.id}`)}
        createLabel="New Wrap Report"
        onCreate={() => setCreateModalOpen(true)}
        stats={pageStats}
        emptyMessage="No wrap reports yet"
        emptyAction={{ label: 'Create First Report', onClick: () => setCreateModalOpen(true) }}
        breadcrumbs={[
          { label: 'COMPVSS', href: '/dashboard' }, 
          { label: 'Reports' },
          { label: 'Wrap' }
        ]}
        quickActions={[
          { id: 'daily', label: 'Daily Reports', icon: <FileText className="size-4" />, onClick: () => router.push('/reports/daily') },
        ]}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Wrap Report"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
        defaultValues={{ total_shows: 0, total_attendance: 0, total_revenue: 0, total_expenses: 0, total_incidents: 0 }}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedReport}
        title={(r) => r.title}
        subtitle={(r) => r.production?.title || 'No production'}
        sections={detailSections}
        onEdit={(r) => router.push(`/reports/wrap/${r.id}`)}
      />
    </CompvssAppLayout>
  );
}
