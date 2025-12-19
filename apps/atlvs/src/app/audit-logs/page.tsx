'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import { useAuditLogs, useAuditLogStats } from '../../hooks/useAuditLogs';
import {
  ListPage,
  Badge,
  DetailDrawer,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from '@ghxstship/ui';

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_name?: string;
  ip_address?: string;
  request_method?: string;
  request_path?: string;
  response_status?: number;
  duration_ms?: number;
  created_at: string;
  user?: {
    id: string;
    full_name?: string;
    email: string;
  };
}

const actionColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost'> = {
  create: 'success',
  update: 'warning',
  delete: 'error',
  view: 'info',
  login: 'success',
  logout: 'ghost',
};

const columns: ListPageColumn<AuditLog>[] = [
  {
    key: 'created_at',
    label: 'Timestamp',
    accessor: 'created_at',
    sortable: true,
    render: (value) => new Date(String(value)).toLocaleString(),
  },
  {
    key: 'user',
    label: 'User',
    accessor: (row) => row.user?.full_name || row.user?.email || 'System',
  },
  {
    key: 'action',
    label: 'Action',
    accessor: 'action',
    sortable: true,
    render: (value) => (
      <Badge variant={actionColors[String(value)] || 'ghost'}>
        {String(value).toUpperCase()}
      </Badge>
    ),
  },
  {
    key: 'resource_type',
    label: 'Resource',
    accessor: 'resource_type',
    sortable: true,
  },
  {
    key: 'resource_name',
    label: 'Name',
    accessor: 'resource_name',
    render: (value): React.ReactNode => (value ? String(value) : '—'),
  },
  {
    key: 'ip_address',
    label: 'IP Address',
    accessor: 'ip_address',
    render: (value): React.ReactNode => (value ? String(value) : '—'),
  },
  {
    key: 'response_status',
    label: 'Status',
    accessor: 'response_status',
    render: (value) => {
      if (!value) return '—';
      const status = Number(value);
      const variant = status < 400 ? 'success' : status < 500 ? 'warning' : 'error';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
];

const filters: ListPageFilter[] = [
  {
    key: 'action',
    label: 'Action',
    options: [
      { value: 'create', label: 'Create' },
      { value: 'update', label: 'Update' },
      { value: 'delete', label: 'Delete' },
      { value: 'view', label: 'View' },
      { value: 'login', label: 'Login' },
      { value: 'logout', label: 'Logout' },
    ],
  },
  {
    key: 'resource_type',
    label: 'Resource Type',
    options: [
      { value: 'project', label: 'Project' },
      { value: 'event', label: 'Event' },
      { value: 'invoice', label: 'Invoice' },
      { value: 'expense', label: 'Expense' },
      { value: 'user', label: 'User' },
      { value: 'vendor', label: 'Vendor' },
    ],
  },
];

export default function AuditLogsPage() {
  const { data: logsData, isLoading, error, refetch } = useAuditLogs();
  const { data: stats } = useAuditLogStats();

  const logs = logsData?.logs || [];

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const rowActions: ListPageAction<AuditLog>[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: <Eye className="size-4" />,
      onClick: (row) => {
        setSelectedLog(row);
        setDrawerOpen(true);
      },
    },
  ];

  const pageStats = [
    { label: 'Total Logs', value: stats?.total || 0 },
    { label: 'Actions', value: Object.keys(stats?.by_action || {}).length },
    { label: 'Resources', value: Object.keys(stats?.by_resource || {}).length },
  ];

  const detailSections: DetailSection[] = selectedLog ? [
    {
      id: 'overview',
      title: 'Log Details',
      content: (
        <Grid cols={2} gap={4}>
          <Body size="sm"><strong>Timestamp:</strong> {new Date(selectedLog.created_at).toLocaleString()}</Body>
          <Body size="sm"><strong>User:</strong> {selectedLog.user?.full_name || selectedLog.user?.email || 'System'}</Body>
          <Body size="sm"><strong>Action:</strong> {selectedLog.action}</Body>
          <Body size="sm"><strong>Resource Type:</strong> {selectedLog.resource_type}</Body>
          <Body size="sm"><strong>Resource Name:</strong> {selectedLog.resource_name || '—'}</Body>
          <Body size="sm"><strong>IP Address:</strong> {selectedLog.ip_address || '—'}</Body>
          <Body size="sm"><strong>Method:</strong> {selectedLog.request_method || '—'}</Body>
          <Body size="sm"><strong>Path:</strong> {selectedLog.request_path || '—'}</Body>
          <Body size="sm"><strong>Status:</strong> {selectedLog.response_status || '—'}</Body>
          <Body size="sm"><strong>Duration:</strong> {selectedLog.duration_ms ? `${selectedLog.duration_ms}ms` : '—'}</Body>
        </Grid>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<AuditLog>
        title="Audit Logs"
        subtitle="Track all system activity and changes"
        data={logs}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search logs..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => {
          setSelectedLog(row);
          setDrawerOpen(true);
        }}
        stats={pageStats}
        emptyMessage="No audit logs found"
      />

      <DetailDrawer<AuditLog>
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedLog}
        title="Audit Log Details"
        sections={detailSections}
      />
    </AtlvsAppLayout>
  );
}
