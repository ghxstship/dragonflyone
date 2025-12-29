"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2 } from "lucide-react";
// Layout provided by route group
import { useIncidents } from "@/hooks/useIncidents";
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
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";

interface Incident {
  id: string;
  type: string;
  event_name?: string;
  reporter: string;
  incident_date?: string;
  severity: string;
  status: string;
  description?: string;
  location?: string;
}

const columns: ListPageColumn<Incident>[] = [
  { key: 'id', label: 'ID', accessor: 'id', sortable: true },
  { key: 'type', label: 'Type', accessor: 'type', render: (v) => <Badge variant="outline">{String(v).replace('-', ' ')}</Badge> },
  { key: 'event_name', label: 'Event', accessor: (r) => r.event_name || 'N/A' },
  { key: 'reporter', label: 'Reporter', accessor: 'reporter' },
  { key: 'incident_date', label: 'Date', accessor: (r) => r.incident_date || 'N/A', sortable: true },
  { key: 'severity', label: 'Severity', accessor: 'severity', sortable: true, render: (v) => <Badge variant={v === 'high' || v === 'critical' ? 'solid' : 'outline'}>{String(v)}</Badge> },
  { key: 'status', label: 'Status', accessor: (r) => r.status.replace('-', ' '), sortable: true },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'under-review', label: 'Under Review' }, { value: 'closed', label: 'Closed' }] },
  { key: 'severity', label: 'Severity', options: [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'type', label: 'Incident Type', type: 'select', required: true, options: [{ value: 'injury', label: 'Injury' }, { value: 'near-miss', label: 'Near Miss' }, { value: 'property-damage', label: 'Property Damage' }, { value: 'equipment-failure', label: 'Equipment Failure' }] },
  { name: 'severity', label: 'Severity', type: 'select', required: true, options: [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }] },
  { name: 'incident_date', label: 'Date', type: 'date', required: true },
  { name: 'location', label: 'Location', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true, colSpan: 2 },
];

export default function IncidentsPage() {
  const router = useRouter();
  const { data: incidentsData, isLoading, refetch } = useIncidents();
  const incidents = (incidentsData || []) as unknown as Incident[];
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState<Incident | null>(null);

  const openCount = incidents.filter(i => i.status !== "closed").length;
  const daysSinceLast = (() => {
    const last = incidents[0];
    if (!last?.incident_date) return 'N/A';
    return Math.floor((new Date().getTime() - new Date(last.incident_date).getTime()) / (1000 * 60 * 60 * 24));
  })();

  const rowActions: ListPageAction<Incident>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedIncident(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/incidents/${r.id}/edit`) },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (r) => { setIncidentToDelete(r); setDeleteConfirmOpen(true); } },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setCreateModalOpen(false);
    refetch?.();
  };

  const handleDelete = async () => {
    if (incidentToDelete) {
      await fetch(`/api/incidents/${incidentToDelete.id}`, { method: 'DELETE' });
      setDeleteConfirmOpen(false);
      setIncidentToDelete(null);
      refetch?.();
    }
  };

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Omit<Incident, 'id'>>({
    entityType: 'incidents',
    requiredFields: ['type', 'reporter', 'severity'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/incidents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
      refetch?.();
    },
  });

  const importTemplates = getImportTemplates('incidents').length > 0 
    ? getImportTemplates('incidents') 
    : [{ id: 'default', name: 'Incident Import', mapping: { type: 'type', reporter: 'reporter', severity: 'severity', status: 'status', incident_date: 'incident_date' } }];

  const stats = [
    { label: 'Total Incidents', value: incidents.length },
    { label: 'Open', value: openCount },
    { label: 'Days Since Last', value: daysSinceLast },
    { label: 'YTD Rate', value: incidents.length > 0 ? (incidents.length / 12).toFixed(1) : '0.0' },
  ];

  const detailSections: DetailSection[] = selectedIncident ? [
    { id: 'overview', title: 'Incident Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Stack gap={1}><Body className="font-display">Type</Body><Body>{selectedIncident.type}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Severity</Body><Body>{selectedIncident.severity}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Status</Body><Body>{selectedIncident.status}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Date</Body><Body>{selectedIncident.incident_date || 'N/A'}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Reporter</Body><Body>{selectedIncident.reporter}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Event</Body><Body>{selectedIncident.event_name || 'N/A'}</Body></Stack>
        {selectedIncident.description && <Stack gap={1} className="col-span-2"><Body className="font-display">Description</Body><Body>{selectedIncident.description}</Body></Stack>}
      </Grid>
    )},
  ] : [];

  return (
    <>
      <ListPage<Incident>
        title="Safety Incidents"
        subtitle="Track and manage safety incidents across all events"
        data={incidents}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        onRetry={() => refetch?.()}
        searchPlaceholder="Search incidents..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedIncident(r); setDrawerOpen(true); }}
        createLabel="Report Incident"
        onCreate={() => setCreateModalOpen(true)}
        entityType="incidents"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['type', 'reporter', 'severity', 'status', 'incident_date']}
        onExport={createExportHandler({
          filename: "incidents",
          getData: () => incidents.map(i => ({
            id: i.id,
            type: i.type,
            severity: i.severity,
            status: i.status,
            incident_date: i.incident_date || '',
            reporter: i.reporter,
            event_name: i.event_name || '',
            description: i.description || '',
          })),
        })}
        stats={stats}
        emptyMessage="No incidents found"
        emptyAction={{ label: 'Report Incident', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/incidents/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          } else if (action === 'close') {
            await fetch('/api/incidents/bulk-close', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          }
        }}
        bulkActions={[
          { id: 'close', label: 'Close Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Report Incident" fields={formFields} onSubmit={handleCreate} size="lg" />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedIncident} title={(i) => `Incident ${i.id}`} subtitle={(i) => i.type} sections={detailSections} onEdit={(i) => router.push(`/incidents/${i.id}/edit`)} onDelete={(i) => { setIncidentToDelete(i); setDeleteConfirmOpen(true); setDrawerOpen(false); }} />
      <ConfirmDialog open={deleteConfirmOpen} title="Delete Incident" message={`Delete incident "${incidentToDelete?.id}"?`} variant="danger" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => { setDeleteConfirmOpen(false); setIncidentToDelete(null); }} />
    </>
  );
}
