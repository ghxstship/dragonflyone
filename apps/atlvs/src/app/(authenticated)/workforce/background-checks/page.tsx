"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// Layout provided by route group
import { Eye, RefreshCw } from 'lucide-react';
import {
  Badge,
  Body,
  DetailDrawer,
  Grid,
  ListPage,
  RecordFormModal,
  Text,
  type DetailSection,
  type FormFieldConfig,
  type ListPageAction,
  type ListPageColumn,
  type ListPageFilter,
} from '@ghxstship/ui';
import { createExportHandler, createImportHandler, getImportTemplates, useBackgroundChecks, type BackgroundCheck as APIBackgroundCheck } from '@ghxstship/config';
import { DEMO_BACKGROUND_CHECKS_FULL } from '../../../../lib/demo-data';

type BackgroundCheck = APIBackgroundCheck & { [key: string]: unknown };

const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
  switch (status) {
    case "Completed": return "solid";
    case "In Progress": case "Pending": return "outline";
    case "Failed": case "Expired": case "Renewal Due": return "ghost";
    default: return "outline";
  }
};

const columns: ListPageColumn<BackgroundCheck>[] = [
  { key: "employeeName", label: "Employee", accessor: "employeeName", sortable: true },
  { key: "department", label: "Department", accessor: "department" },
  { key: "checkType", label: "Check Type", accessor: "checkType" },
  { key: "provider", label: "Provider", accessor: "provider", render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: "requestDate", label: "Requested", accessor: "requestDate", sortable: true },
  { key: "status", label: "Status", accessor: "status", sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
  { key: "result", label: "Result", accessor: (r) => r.result || "—", render: (v) => v !== "—" ? <Badge variant={v === "Clear" ? "solid" : "ghost"}>{String(v)}</Badge> : <Text>—</Text> },
];

const filters: ListPageFilter[] = [
  { key: "status", label: "Status", options: [
    { value: "Pending", label: "Pending" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
    { value: "Renewal Due", label: "Renewal Due" },
    { value: "Expired", label: "Expired" },
  ]},
  { key: "checkType", label: "Check Type", options: [
    { value: "Criminal", label: "Criminal" },
    { value: "Criminal + Employment", label: "Criminal + Employment" },
    { value: "Criminal + Credit + Employment", label: "Criminal + Credit + Employment" },
    { value: "Criminal + Drug Screen", label: "Criminal + Drug Screen" },
  ]},
];

const formFields: FormFieldConfig[] = [
  { name: "employeeName", label: "Employee Name", type: "text", required: true },
  { name: "department", label: "Department", type: "select", required: true, options: [
    { value: "Production", label: "Production" },
    { value: "Finance", label: "Finance" },
    { value: "Operations", label: "Operations" },
    { value: "Audio", label: "Audio" },
    { value: "Lighting", label: "Lighting" },
    { value: "Video", label: "Video" },
  ]},
  { name: "checkType", label: "Check Type", type: "select", required: true, options: [
    { value: "Criminal", label: "Criminal Only" },
    { value: "Criminal + Employment", label: "Criminal + Employment" },
    { value: "Criminal + Credit + Employment", label: "Criminal + Credit + Employment" },
    { value: "Criminal + Drug Screen", label: "Criminal + Drug Screen" },
  ]},
  { name: "provider", label: "Provider", type: "select", options: [
    { value: "Checkr", label: "Checkr" },
    { value: "Sterling", label: "Sterling" },
    { value: "GoodHire", label: "GoodHire" },
  ]},
];

export default function BackgroundChecksPage() {
  const router = useRouter();
  const { checks: apiChecks, summary, isLoading, error, createCheckAsync, deleteChecksAsync, renewChecksAsync, refetch } = useBackgroundChecks();
  const [selectedCheck, setSelectedCheck] = useState<BackgroundCheck | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Use API data or fall back to demo data
  const checks: BackgroundCheck[] = apiChecks.length > 0 ? (apiChecks as BackgroundCheck[]) : (DEMO_BACKGROUND_CHECKS_FULL as BackgroundCheck[]);

  const pendingCount = summary?.pending || checks.filter(c => c.status === "Pending" || c.status === "In Progress").length;
  const renewalDueCount = summary?.renewalDue || checks.filter(c => c.status === "Renewal Due").length;
  const expiredCount = summary?.expired || checks.filter(c => c.status === "Expired").length;
  const completedCount = summary?.completed || checks.filter(c => c.status === "Completed").length;

  const rowActions: ListPageAction<BackgroundCheck>[] = [
    { id: "view", label: "View Details", icon: <Eye className="size-4" />, onClick: (r) => { setSelectedCheck(r); setDrawerOpen(true); } },
    { id: "renew", label: "Renew", icon: <RefreshCw className="size-4" />, onClick: (r) => router.push(`/workforce/background-checks/${r.id}/renew`) },
  ];

  const stats = [
    { label: "Pending", value: pendingCount },
    { label: "Completed", value: completedCount },
    { label: "Renewal Due", value: renewalDueCount },
    { label: "Expired", value: expiredCount },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createCheckAsync({
        employeeId: String(data.employeeId || ''),
        employeeName: String(data.employeeName || ''),
        department: String(data.department || ''),
        checkType: String(data.checkType || 'Criminal'),
        provider: String(data.provider || 'Checkr'),
        requestDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
      });
      refetch();
      setCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to create background check:', err);
    }
  };

  const detailSections: DetailSection[] = selectedCheck ? [
    { id: "overview", title: "Background Check Details", content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Employee:</strong> {selectedCheck.employeeName}</Body>
        <Body size="sm"><strong>Department:</strong> {selectedCheck.department}</Body>
        <Body size="sm"><strong>Check Type:</strong> {selectedCheck.checkType}</Body>
        <Body size="sm"><strong>Provider:</strong> {selectedCheck.provider}</Body>
        <Body size="sm"><strong>Requested:</strong> {selectedCheck.requestDate}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedCheck.status}</Body>
        {selectedCheck.completedDate && <Body size="sm"><strong>Completed:</strong> {selectedCheck.completedDate}</Body>}
        {selectedCheck.expiryDate && <Body size="sm"><strong>Expires:</strong> {selectedCheck.expiryDate}</Body>}
        {selectedCheck.result && <Body size="sm"><strong>Result:</strong> {selectedCheck.result}</Body>}
        {selectedCheck.notes && <Body size="sm" className="col-span-2"><strong>Notes:</strong> {selectedCheck.notes}</Body>}
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<BackgroundCheck, 'id'>>({

    entityType: 'background-checks',

    requiredFields: ['employeeName', 'department', 'checkType'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/background-checks', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('background-checks');


  return (
    <>
      <ListPage<BackgroundCheck>
        title="Background Checks"
        subtitle="Employee background check tracking and compliance"
        data={checks}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error as Error | undefined}
        onRetry={() => refetch()}
        searchPlaceholder="Search employees..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedCheck(r); setDrawerOpen(true); }}
        createLabel="Request Check"
        onCreate={() => setCreateModalOpen(true)}
        entityType="background-checks"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['employeeName', 'department', 'checkType', 'provider', 'requestDate', 'status', 'result']}
        onExport={createExportHandler({
          filename: "background-checks",
          getData: () => checks.map(c => ({
            id: c.id,
            employeeName: c.employeeName,
            checkType: c.checkType,
            status: c.status,
            requestDate: c.requestDate,
            completionDate: c.completedDate || '',
            result: c.result || '',
          })),
        })}
        stats={stats}
        emptyMessage="No background checks found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await deleteChecksAsync(ids);
            refetch();
          } else if (action === 'renew') {
            await renewChecksAsync(ids);
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
        title="Request Background Check"
        fields={formFields}
        onSubmit={handleCreate}
      />

      {selectedCheck && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedCheck}
          title={(c) => c.employeeName}
          subtitle={(c) => `${c.checkType} • ${c.status}`}
          sections={detailSections}
        />
      )}
    </>
  );
}
