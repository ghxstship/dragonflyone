"use client";

import { useState } from "react";
import { Eye, Check, Pencil } from "lucide-react";
import { AtlvsAppLayout } from "../../../../components/app-layout";
import {
  ListPage,
  Badge,
  DetailDrawer,
  RecordFormModal,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
  type FormFieldConfig,
} from "@ghxstship/ui";
import { getBadgeVariant, createExportHandler, createImportHandler, getImportTemplates, useMaintenance, type MaintenanceRecord } from "@ghxstship/config";
import { DEMO_MAINTENANCE_RECORDS } from '../../../../lib/demo-data';


const getStatusVariant = getBadgeVariant;

const getPriorityVariant = (priority: string): "solid" | "outline" | "ghost" => {
  switch (priority) { case "Critical": return "solid"; case "High": return "outline"; default: return "ghost"; }
};

const columns: ListPageColumn<MaintenanceRecord>[] = [
  { key: 'assetName', label: 'Asset', accessor: 'assetName', sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'type', label: 'Type', accessor: 'type', render: (v) => <Badge variant={String(v) === "Emergency" ? "solid" : "outline"}>{String(v)}</Badge> },
  { key: 'description', label: 'Description', accessor: 'description' },
  { key: 'priority', label: 'Priority', accessor: 'priority', sortable: true, render: (v) => <Badge variant={getPriorityVariant(String(v))}>{String(v)}</Badge> },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
  { key: 'scheduledDate', label: 'Scheduled', accessor: 'scheduledDate', sortable: true },
  { key: 'cost', label: 'Cost', accessor: (r) => r.cost ? `$${r.cost.toLocaleString()}` : '—' },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'Scheduled', label: 'Scheduled' }, { value: 'In Progress', label: 'In Progress' }, { value: 'Completed', label: 'Completed' }, { value: 'Overdue', label: 'Overdue' }] },
  { key: 'type', label: 'Type', options: [{ value: 'Preventive', label: 'Preventive' }, { value: 'Corrective', label: 'Corrective' }, { value: 'Emergency', label: 'Emergency' }, { value: 'Inspection', label: 'Inspection' }] },
  { key: 'priority', label: 'Priority', options: [{ value: 'Critical', label: 'Critical' }, { value: 'High', label: 'High' }, { value: 'Medium', label: 'Medium' }, { value: 'Low', label: 'Low' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'assetName', label: 'Asset', type: 'text', required: true },
  { name: 'type', label: 'Type', type: 'select', options: [{ value: 'Preventive', label: 'Preventive' }, { value: 'Corrective', label: 'Corrective' }, { value: 'Inspection', label: 'Inspection' }], required: true },
  { name: 'priority', label: 'Priority', type: 'select', options: [{ value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }, { value: 'Critical', label: 'Critical' }], required: true },
  { name: 'scheduledDate', label: 'Scheduled Date', type: 'date', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  { name: 'technician', label: 'Technician', type: 'text' },
];

export default function AssetMaintenancePage() {
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Real API integration with demo fallback
  const { records: apiRecords, isLoading, error, createRecordAsync, updateRecordAsync, deleteRecordsAsync, refetch } = useMaintenance();
  const records = apiRecords.length > 0 ? apiRecords : (DEMO_MAINTENANCE_RECORDS as MaintenanceRecord[]);

  const scheduledCount = records.filter((r) => r.status === "Scheduled").length;
  const inProgressCount = records.filter((r) => r.status === "In Progress").length;
  const overdueCount = records.filter((r) => r.status === "Overdue").length;
  const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createRecordAsync({
        asset_id: String(data.assetId || 'default'),
        maintenance_type: String(data.type),
        priority: String(data.priority),
        scheduled_date: String(data.scheduledDate),
        description: String(data.description),
        technician_id: data.technician ? String(data.technician) : undefined,
      });
      refetch();
      setCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to create maintenance record:', err);
    }
  };

  const handleMarkComplete = async (r: MaintenanceRecord) => {
    try {
      await updateRecordAsync({ id: r.id, updates: { status: 'Completed' } });
      refetch();
    } catch (err) {
      console.error('Failed to mark complete:', err);
    }
  };

  const rowActions: ListPageAction<MaintenanceRecord>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedRecord(r); setDrawerOpen(true); } },
    { id: 'complete', label: 'Mark Complete', icon: <Check className="size-4" />, onClick: handleMarkComplete },
  ];

  const stats = [
    { label: 'Scheduled', value: scheduledCount },
    { label: 'In Progress', value: inProgressCount },
    { label: 'Overdue', value: overdueCount },
    { label: 'YTD Costs', value: `$${(totalCost / 1000).toFixed(1)}K` },
  ];

  const detailSections: DetailSection[] = selectedRecord ? [
    { id: 'overview', title: 'Maintenance Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Asset:</strong> {selectedRecord.assetName}</Body>
        <Body size="sm"><strong>Category:</strong> {selectedRecord.category}</Body>
        <Body size="sm"><strong>Type:</strong> {selectedRecord.type}</Body>
        <Body size="sm"><strong>Priority:</strong> {selectedRecord.priority}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedRecord.status}</Body>
        <Body size="sm"><strong>Scheduled:</strong> {selectedRecord.scheduledDate}</Body>
        {selectedRecord.technician && <Body size="sm"><strong>Technician:</strong> {selectedRecord.technician}</Body>}
        {selectedRecord.cost && <Body size="sm"><strong>Cost:</strong> ${selectedRecord.cost.toLocaleString()}</Body>}
        {selectedRecord.laborHours && <Body size="sm"><strong>Labor Hours:</strong> {selectedRecord.laborHours}</Body>}
        {selectedRecord.notes && <Body size="sm" className="col-span-2"><strong>Notes:</strong> {selectedRecord.notes}</Body>}
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<MaintenanceRecord, 'id'>>({

    entityType: 'asset-maintenance',

    requiredFields: ['assetName', 'type', 'priority'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/asset-maintenance', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      // Refresh data after import
      window.location.reload();
    },
  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('asset-maintenance');


  return (
    <AtlvsAppLayout>
      <ListPage<MaintenanceRecord>
        title="Asset Maintenance"
        subtitle="Maintenance scheduling, service records, and preventive maintenance tracking"
        data={records}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error as Error | undefined}
        searchPlaceholder="Search maintenance records..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedRecord(r); setDrawerOpen(true); }}
        createLabel="Schedule Maintenance"
        onCreate={() => setCreateModalOpen(true)}
        entityType="asset-maintenance"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['assetName', 'type', 'priority', 'scheduledDate', 'description', 'technician', 'category']}
        onExport={createExportHandler({
          filename: "asset-maintenance",
          getData: () => records.map(r => ({
            id: r.id,
            assetId: r.assetId,
            assetName: r.assetName,
            category: r.category,
            type: r.type,
            status: r.status,
            priority: r.priority,
            scheduledDate: r.scheduledDate,
            completedDate: r.completedDate || '',
          })),
        })}
        stats={stats}
        emptyMessage="No maintenance records found"
        emptyAction={{ label: 'Schedule Maintenance', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await deleteRecordsAsync(ids);
            refetch();
          } else if (action === 'complete') {
            for (const id of ids) {
              await updateRecordAsync({ id, updates: { status: 'Completed' } });
            }
            refetch();
          }
        }}
        bulkActions={[
          { id: 'complete', label: 'Complete Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      {selectedRecord && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedRecord}
          title={(r) => r.assetName}
          subtitle={(r) => `${r.type} • ${r.status}`}
          sections={detailSections}
          actions={[{ id: 'complete', label: 'Mark Complete', icon: <Check className="size-4" /> }, { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" /> }]}
          onAction={async (id, r) => {
            if (id === 'complete') {
              await handleMarkComplete(r);
            }
            setDrawerOpen(false);
          }}
        />
      )}
      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Schedule Maintenance"
        fields={formFields}
        onSubmit={handleCreate}
        mode="create"
      />
    </AtlvsAppLayout>
  );
}
