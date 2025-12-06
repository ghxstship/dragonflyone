"use client";

import { useState, useEffect, useCallback } from "react";
import { Eye } from "lucide-react";
import { AtlvsAppLayout } from "../../components/app-layout";
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
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";

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
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedLog(r); setDrawerOpen(true); } },
  ];

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'audit',
    requiredFields: ['action', 'resource_type'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
      fetchAuditLogs();
    },
  });

  const importTemplates = getImportTemplates('audit').length > 0 
    ? getImportTemplates('audit') 
    : [{ id: 'default', name: 'Audit Import', mapping: { action: 'action', resource_type: 'resource_type', resource_id: 'resource_id', user_email: 'user_email' } }];

  const stats = [
    { label: 'Total Events', value: summary?.total || logs.length },
    { label: 'Today', value: summary?.today || 0 },
    { label: 'Active Users', value: summary?.active_users || 0 },
    { label: 'Failed Attempts', value: summary?.failed_attempts || 0 },
  ];

  const detailSections: DetailSection[] = selectedLog ? [
    { id: 'overview', title: 'Audit Log Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Timestamp:</strong> {selectedLog.timestamp || new Date(selectedLog.created_at).toLocaleString()}</Body>
        <Body size="sm"><strong>User:</strong> {selectedLog.user?.email || selectedLog.user_email || '—'}</Body>
        <Body size="sm"><strong>Action:</strong> {selectedLog.action}</Body>
        <Body size="sm"><strong>Resource:</strong> {selectedLog.resource_type}/{selectedLog.resource_id}</Body>
        <Body size="sm"><strong>IP Address:</strong> {selectedLog.ip_address || '—'}</Body>
        {selectedLog.details && <Body size="sm" className="col-span-2"><strong>Details:</strong> {selectedLog.details}</Body>}
      </Grid>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
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
        entityType="audit"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['action', 'resource_type', 'resource_id', 'user_email']}
        onExport={createExportHandler({
          filename: "audit-logs",
          getData: () => logs.map(l => ({
            id: l.id,
            timestamp: l.timestamp,
            user_email: l.user?.email || l.user_email || '',
            action: l.action,
            resource_type: l.resource_type,
            resource_id: l.resource_id,
            details: l.details || '',
            ip_address: l.ip_address || '',
          })),
        })}
        stats={stats}
        emptyMessage="No audit logs found"
showFavorite
        showSettings
      />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedLog} title={(l) => l.action} subtitle={(l) => l.user?.email || l.user_email || 'Unknown user'} sections={detailSections} />
    </AtlvsAppLayout>
  );
}
