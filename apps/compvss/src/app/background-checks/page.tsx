"use client";

import { useState } from "react";
import { Eye, RefreshCw, Download } from "lucide-react";
import { CompvssAppLayout } from "../../components/app-layout";
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
} from "@ghxstship/ui";
import { getBadgeVariant, createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";

import {
  useBackgroundChecks,
  useCreateBackgroundCheck,
  useRenewBackgroundCheck,
  useDeleteBackgroundCheck,
  type BackgroundCheck,
} from "../../hooks/useBackgroundChecks";

const getStatusVariant = getBadgeVariant;

const getExpiryLabel = (days?: number) => {
  if (days === undefined) return '—';
  if (days < 0) return `${Math.abs(days)} days ago`;
  return `${days} days`;
};

const columns: ListPageColumn<BackgroundCheck>[] = [
  { key: 'crewMemberName', label: 'Crew Member', accessor: 'crewMemberName', sortable: true },
  { key: 'department', label: 'Department', accessor: 'department', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'checkType', label: 'Check Type', accessor: 'checkType' },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
  { key: 'expirationDate', label: 'Expiration', accessor: (r) => r.expirationDate || '—', sortable: true },
  { key: 'daysUntilExpiry', label: 'Days Left', accessor: (r) => getExpiryLabel(r.daysUntilExpiry), render: (v, r) => {
    const days = r.daysUntilExpiry;
    const colorClass = days === undefined ? '' : days < 0 ? 'text-error-500' : days <= 30 ? 'text-warning-500' : 'text-success-500';
    return <span className={colorClass}>{String(v)}</span>;
  }},
  { key: 'provider', label: 'Provider', accessor: 'provider' },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'Cleared', label: 'Cleared' }, { value: 'Pending', label: 'Pending' }, { value: 'In Progress', label: 'In Progress' }, { value: 'Expired', label: 'Expired' }, { value: 'Flagged', label: 'Flagged' }] },
  { key: 'checkType', label: 'Check Type', options: [{ value: 'Standard', label: 'Standard' }, { value: 'Enhanced', label: 'Enhanced' }, { value: 'Federal', label: 'Federal' }] },
  { key: 'department', label: 'Department', options: [{ value: 'Audio', label: 'Audio' }, { value: 'Lighting', label: 'Lighting' }, { value: 'Stage', label: 'Stage' }, { value: 'Video', label: 'Video' }, { value: 'Rigging', label: 'Rigging' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'crewMemberId', label: 'Crew Member', type: 'select', required: true, options: [{ value: 'CRW-107', label: 'James Wilson' }, { value: 'CRW-108', label: 'Maria Garcia' }], colSpan: 2 },
  { name: 'checkType', label: 'Check Type', type: 'select', required: true, options: [{ value: 'Standard', label: 'Standard' }, { value: 'Enhanced', label: 'Enhanced' }, { value: 'Federal', label: 'Federal' }] },
  { name: 'provider', label: 'Provider', type: 'select', required: true, options: [{ value: 'Sterling', label: 'Sterling' }, { value: 'Checkr', label: 'Checkr' }] },
];

export default function BackgroundChecksPage() {
  const { data: checks = [], isLoading, refetch } = useBackgroundChecks();
  const createCheckMutation = useCreateBackgroundCheck();
  const renewCheckMutation = useRenewBackgroundCheck();
  const deleteCheckMutation = useDeleteBackgroundCheck();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<BackgroundCheck | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const expiringSoon = checks.filter(c => c.daysUntilExpiry !== undefined && c.daysUntilExpiry > 0 && c.daysUntilExpiry <= 30).length;
  const expired = checks.filter(c => c.status === "Expired").length;
  const pending = checks.filter(c => c.status === "Pending" || c.status === "In Progress").length;
  const cleared = checks.filter(c => c.status === "Cleared").length;

  const handleRenew = async (check: BackgroundCheck) => {
    await renewCheckMutation.mutateAsync(check);
    refetch();
  };

  const handleDownload = (check: BackgroundCheck) => {
    const reportData = {
      id: check.id,
      crewMember: check.crewMemberName,
      department: check.department,
      checkType: check.checkType,
      status: check.status,
      provider: check.provider,
      submittedDate: check.submittedDate,
      completedDate: check.completedDate,
      expirationDate: check.expirationDate,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `background-check-${check.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const rowActions: ListPageAction<BackgroundCheck>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedCheck(r); setDrawerOpen(true); } },
    { id: 'renew', label: 'Renew', icon: <RefreshCw className="size-4" />, onClick: handleRenew },
    { id: 'download', label: 'Download Report', icon: <Download className="size-4" />, onClick: handleDownload },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createCheckMutation.mutateAsync({
      crewMemberId: String(data.crewMemberId),
      crewMemberName: data.crewMemberId === 'CRW-107' ? 'James Wilson' : 'Maria Garcia',
      department: 'New',
      checkType: data.checkType as BackgroundCheck['checkType'],
      status: 'Pending',
      submittedDate: new Date().toISOString().split('T')[0],
      provider: String(data.provider),
    });
    refetch();
    setCreateModalOpen(false);
  };

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'background-checks',
    requiredFields: ['crewMemberName', 'checkType', 'provider'],
    onImport: async (records) => {
      for (const record of records) {
        await createCheckMutation.mutateAsync({
          crewMemberId: String(record.crewMemberId || ''),
          crewMemberName: String(record.crewMemberName || ''),
          department: String(record.department || ''),
          checkType: record.checkType as BackgroundCheck['checkType'],
          status: 'Pending',
          submittedDate: new Date().toISOString().split('T')[0],
          provider: String(record.provider || ''),
        });
      }
      refetch();
    },
  });

  const importTemplates = getImportTemplates('background-checks').length > 0 
    ? getImportTemplates('background-checks') 
    : [{ id: 'default', name: 'Background Check Import', mapping: { crewMemberName: 'crewMemberName', department: 'department', checkType: 'checkType', provider: 'provider' } }];

  const stats = [
    { label: 'Cleared', value: cleared },
    { label: 'Pending', value: pending },
    { label: 'Expiring Soon', value: expiringSoon },
    { label: 'Expired', value: expired },
  ];

  const detailSections: DetailSection[] = selectedCheck ? [
    { id: 'overview', title: 'Check Details', content: (
      <Grid cols={2} gap={4}>
        <Stack gap={1}><Body className="font-display">Crew Member</Body><Body>{selectedCheck.crewMemberName}</Body></Stack>
        <Stack gap={1}><Body className="font-display">ID</Body><Body>{selectedCheck.crewMemberId}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Department</Body><Body>{selectedCheck.department}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Check Type</Body><Body>{selectedCheck.checkType}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Status</Body><Body>{selectedCheck.status}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Provider</Body><Body>{selectedCheck.provider}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Submitted</Body><Body>{selectedCheck.submittedDate}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Completed</Body><Body>{selectedCheck.completedDate || 'Pending'}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Expiration</Body><Body>{selectedCheck.expirationDate || '—'}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Days Until Expiry</Body><Body>{getExpiryLabel(selectedCheck.daysUntilExpiry)}</Body></Stack>
      </Grid>
    )},
  ] : [];

  return (
    <CompvssAppLayout>
      <ListPage<BackgroundCheck>
        title="Background Checks"
        subtitle="Crew background check status and renewal management"
        data={checks}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        searchPlaceholder="Search crew members..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedCheck(r); setDrawerOpen(true); }}
        createLabel="Initiate Check"
        onCreate={() => setCreateModalOpen(true)}
        entityType="background-checks"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['crewMemberName', 'department', 'checkType', 'provider']}
        onExport={createExportHandler({
          filename: "background-checks",
          getData: () => checks.map(c => ({
            id: c.id,
            crewMemberName: c.crewMemberName,
            department: c.department,
            checkType: c.checkType,
            status: c.status,
            provider: c.provider,
            submittedDate: c.submittedDate,
            completedDate: c.completedDate || '',
            expirationDate: c.expirationDate || '',
          })),
        })}
        stats={stats}
        emptyMessage="No background checks found"
        emptyAction={{ label: 'Initiate Check', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            for (const id of ids) {
              await deleteCheckMutation.mutateAsync(id);
            }
            refetch();
          } else if (action === 'renew') {
            const checksToRenew = checks.filter(c => ids.includes(c.id));
            for (const check of checksToRenew) {
              await renewCheckMutation.mutateAsync(check);
            }
            refetch();
          }
        }}
        bulkActions={[
          { id: 'renew', label: 'Renew Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Initiate Background Check"
        fields={formFields}
        onSubmit={handleCreate}
      />

      {selectedCheck && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedCheck}
          title={(c) => c.crewMemberName}
          subtitle={(c) => `${c.department} • ${c.checkType}`}
          sections={detailSections}
          actions={[
            { id: 'download', label: 'Download Report', icon: <Download className="size-4" /> },
            ...(selectedCheck.status === 'Expired' ? [{ id: 'renew', label: 'Renew', icon: <RefreshCw className="size-4" /> }] : []),
          ]}
          onAction={(id) => {
            if (id === 'download') handleDownload(selectedCheck);
            if (id === 'renew') handleRenew(selectedCheck);
          }}
        />
      )}
    </CompvssAppLayout>
  );
}
