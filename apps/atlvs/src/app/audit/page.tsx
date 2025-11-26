"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  ListPage,
  Badge,
  DetailDrawer,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";

interface AuditLog {
  id: string;
  timestamp: string;
  user_id?: string;
  user_email?: string;
  user?: { id: string; email: string; full_name: string };
  action: string;
  resource_type: string;
  resource_id: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

interface AuditSummary {
  total: number;
  today: number;
  active_users: number;
  failed_attempts: number;
}

const columns: ListPageColumn<AuditLog>[] = [
  { key: 'timestamp', label: 'Timestamp', accessor: (r) => r.timestamp || new Date(r.created_at).toLocaleString(), sortable: true },
  { key: 'user', label: 'User', accessor: (r) => r.user?.email || r.user_email || '—' },
  { key: 'action', label: 'Action', accessor: 'action', sortable: true, render: (v) => <Badge variant={v === 'delete' ? 'solid' : v === 'create' || v === 'update' ? 'outline' : 'ghost'}>{String(v)}</Badge> },
  { key: 'resource', label: 'Resource', accessor: (r) => `${r.resource_type}/${r.resource_id}` },
  { key: 'details', label: 'Details', accessor: (r) => r.details || '—' },
  { key: 'ip_address', label: 'IP Address', accessor: (r) => r.ip_address || '—' },
];

const filters: ListPageFilter[] = [
  { key: 'action', label: 'Action', options: [{ value: 'login', label: 'Login' }, { value: 'create', label: 'Create' }, { value: 'update', label: 'Update' }, { value: 'delete', label: 'Delete' }, { value: 'download', label: 'Download' }, { value: 'view', label: 'View' }] },
];

export default function AuditPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/kpi/audit-logs');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setLogs(data.logs || []);
      setSummary(data.summary || null);
    } catch { /* fallback */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAuditLogs(); }, [fetchAuditLogs]);

  const rowActions: ListPageAction<AuditLog>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedLog(r); setDrawerOpen(true); } },
  ];

  const stats = [
    { label: 'Total Events', value: summary?.total || logs.length },
    { label: 'Today', value: summary?.today || 0 },
    { label: 'Active Users', value: summary?.active_users || 0 },
    { label: 'Failed Attempts', value: summary?.failed_attempts || 0 },
  ];

  const detailSections: DetailSection[] = selectedLog ? [
    { id: 'overview', title: 'Audit Log Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Timestamp:</strong> {selectedLog.timestamp || new Date(selectedLog.created_at).toLocaleString()}</div>
        <div><strong>User:</strong> {selectedLog.user?.email || selectedLog.user_email || '—'}</div>
        <div><strong>Action:</strong> {selectedLog.action}</div>
        <div><strong>Resource:</strong> {selectedLog.resource_type}/{selectedLog.resource_id}</div>
        <div><strong>IP Address:</strong> {selectedLog.ip_address || '—'}</div>
        {selectedLog.details && <div className="col-span-2"><strong>Details:</strong> {selectedLog.details}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<AuditLog>
        title="Audit Trail"
        subtitle="Track all system activity and user actions"
        data={logs}
        columns={columns}
        rowKey="id"
        loading={loading}
        onRetry={fetchAuditLogs}
        searchPlaceholder="Search logs..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedLog(r); setDrawerOpen(true); }}
        onExport={() => router.push('/audit/export')}
        stats={stats}
        emptyMessage="No audit logs found"
        header={<Navigation />}
      />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedLog} title={(l) => l.action} subtitle={(l) => l.user?.email || l.user_email || 'Unknown user'} sections={detailSections} />
    </>
  );
}
