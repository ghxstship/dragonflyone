"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Check, Pencil } from "lucide-react";
import {
  ListPage, DetailDrawer, RecordFormModal, Grid, Body,
  type ListPageAction, type DetailSection} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates, useAuthContext, ATLVS_ADMIN_ROLES, useEntityConfig } from "@ghxstship/config";
import { useMaintenance, type MaintenanceRecord } from "@/hooks/useMaintenance";
import { DEMO_MAINTENANCE_RECORDS } from '../../../../lib/demo-data';

export default function AssetMaintenancePage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { columns, filters, formFields } = useEntityConfig<MaintenanceRecord>({ entityName: 'assets' });
  const canManageMaintenance = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const { records: apiRecords, isLoading, error, createRecordAsync, updateRecordAsync, deleteRecordsAsync, refetch } = useMaintenance();
  const records = apiRecords.length > 0 ? apiRecords : DEMO_MAINTENANCE_RECORDS;

  // Count by event_type since 3NF schema doesn't have status field
  const preventiveCount = records.filter((r) => r.event_type === 'preventive').length;
  const correctiveCount = records.filter((r) => r.event_type === 'corrective').length;
  const emergencyCount = records.filter((r) => r.event_type === 'emergency').length;
  const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createRecordAsync({
        asset_id: String(data.asset_id || 'default'),
        event_type: String(data.event_type || 'preventive'),
        event_date: String(data.event_date || new Date().toISOString().split('T')[0]),
        description: data.description ? String(data.description) : undefined,
        performed_by: data.performed_by ? String(data.performed_by) : undefined,
      });
      refetch();
      setCreateModalOpen(false);
    } catch {
      // Error handled by React Query
    }
  };

  const handleMarkComplete = async (r: MaintenanceRecord) => {
    try {
      await updateRecordAsync({ id: r.id, description: `${r.description} [COMPLETED]` });
      refetch();
    } catch {
      // Error handled by React Query
    }
  };

  const rowActions: ListPageAction<MaintenanceRecord>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedRecord(r); setDrawerOpen(true); } },
    ...(canManageMaintenance ? [
      { id: 'complete', label: 'Mark Complete', icon: <Check className="size-4" />, onClick: handleMarkComplete },
    ] : []),
  ];

  const stats = [
    { label: 'Preventive', value: preventiveCount },
    { label: 'Corrective', value: correctiveCount },
    { label: 'Emergency', value: emergencyCount },
    { label: 'YTD Costs', value: `$${(totalCost / 1000).toFixed(1)}K` },
  ];

  const detailSections: DetailSection[] = selectedRecord ? [
    { id: 'overview', title: 'Maintenance Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Asset ID:</strong> {selectedRecord.asset_id}</Body>
        <Body size="sm"><strong>Event Type:</strong> {selectedRecord.event_type}</Body>
        <Body size="sm"><strong>Event Date:</strong> {selectedRecord.event_date}</Body>
        <Body size="sm"><strong>Next Scheduled:</strong> {selectedRecord.next_scheduled || 'N/A'}</Body>
        {selectedRecord.performed_by && <Body size="sm"><strong>Performed By:</strong> {selectedRecord.performed_by}</Body>}
        {selectedRecord.vendor_id && <Body size="sm"><strong>Vendor:</strong> {selectedRecord.vendor_id}</Body>}
        {selectedRecord.cost && <Body size="sm"><strong>Cost:</strong> ${selectedRecord.cost.toLocaleString()}</Body>}
        {selectedRecord.description && <Body size="sm" className="col-span-2"><strong>Description:</strong> {selectedRecord.description}</Body>}
      </Grid>
    )},
  ] : [];

  const handleImport = createImportHandler<Omit<MaintenanceRecord, 'id' | 'created_at'>>({
    entityType: 'asset-maintenance',
    requiredFields: ['asset_id', 'event_type', 'event_date'],
    onImport: async (importRecords) => {
      for (const record of importRecords) {
        await createRecordAsync({
          asset_id: record.asset_id,
          event_type: record.event_type,
          event_date: record.event_date,
          description: record.description || undefined,
          performed_by: record.performed_by || undefined,
          cost: record.cost || undefined,
          next_scheduled: record.next_scheduled || undefined,
          vendor_id: record.vendor_id || undefined,
        });
      }
      refetch();
    },
  });

  const importTemplates = getImportTemplates('asset-maintenance');

  return (
    <>
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
        onCreate={canManageMaintenance ? () => setCreateModalOpen(true) : undefined}
        entityType="asset-maintenance"
        onImport={canManageMaintenance ? handleImport : undefined}
        importTemplates={importTemplates}
        templateDownloadUrl="/templates/production-planning/equipment-checklist-template.csv"
        importSampleFields={['asset_id', 'event_type', 'event_date', 'description', 'performed_by', 'cost']}
        onExport={createExportHandler({
          filename: "asset-maintenance",
          getData: () => records.map(r => ({
            id: r.id,
            asset_id: r.asset_id,
            event_type: r.event_type,
            event_date: r.event_date,
            description: r.description || '',
            next_scheduled: r.next_scheduled || '',
            cost: r.cost || '',
            performed_by: r.performed_by || '',
            vendor_id: r.vendor_id || '',
          })),
        })}
        stats={stats}
        emptyMessage="No maintenance records found"
        emptyAction={canManageMaintenance ? { label: 'Schedule Maintenance', onClick: () => setCreateModalOpen(true) } : undefined}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await deleteRecordsAsync(ids);
            refetch();
          } else if (action === 'complete') {
            for (const id of ids) {
              const record = records.find(r => r.id === id);
              if (record) {
                await updateRecordAsync({ id, description: `${record.description} [COMPLETED]` });
              }
            }
            refetch();
          }
        }}
        bulkActions={canManageMaintenance ? [
          { id: 'complete', label: 'Complete Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ] : []}
        enableCapabilityDetection
        onScanAction={(capability, route) => router.push(route)}
        capabilityBasePath=""
        showFavorite
        showSettings
      />
      {selectedRecord && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedRecord}
          title={(r) => `${r.event_type} - ${r.asset_id}`}
          subtitle={(r) => r.event_date}
          sections={detailSections}
          actions={[{ id: 'complete', label: 'Mark Complete', icon: <Check className="size-4" /> }, { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" /> }]}
          onAction={async (actionId, r) => {
            if (actionId === 'complete') {
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
    </>
  );
}
