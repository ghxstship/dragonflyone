"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import { useMaintenance } from "../../hooks/useMaintenance";
import {
  ListPage,
  Badge,
  DetailDrawer,
  RecordFormModal,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";

interface MaintenanceItem {
  id: string;
  equipment_name: string;
  type: string;
  last_service?: string;
  next_due?: string;
  priority: string;
  status: string;
  notes?: string;
  [key: string]: unknown;
}

const getPriorityVariant = (priority: string): "solid" | "outline" | "ghost" => {
  switch (priority?.toLowerCase()) {
    case "high": case "critical": return "solid";
    case "medium": return "outline";
    default: return "ghost";
  }
};

const formatStatus = (status: string) => status?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || status;

const columns: ListPageColumn<MaintenanceItem>[] = [
  { key: 'equipment_name', label: 'Equipment', accessor: (r) => r.equipment_name || 'N/A', sortable: true },
  { key: 'type', label: 'Type', accessor: 'type', render: (v) => <Badge variant="ghost">{formatStatus(String(v))}</Badge> },
  { key: 'last_service', label: 'Last Service', accessor: (r) => r.last_service ? new Date(r.last_service).toLocaleDateString() : 'N/A', sortable: true },
  { key: 'next_due', label: 'Next Due', accessor: (r) => r.next_due ? new Date(r.next_due).toLocaleDateString() : 'N/A', sortable: true },
  { key: 'priority', label: 'Priority', accessor: 'priority', sortable: true, render: (v) => <Badge variant={getPriorityVariant(String(v))}>{String(v)}</Badge> },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={v === 'completed' ? 'solid' : 'outline'}>{formatStatus(String(v))}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'pending', label: 'Pending' }, { value: 'in-progress', label: 'In Progress' }, { value: 'scheduled', label: 'Scheduled' }, { value: 'completed', label: 'Completed' }] },
  { key: 'priority', label: 'Priority', options: [{ value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'equipment_name', label: 'Equipment', type: 'text', required: true, colSpan: 2 },
  { name: 'type', label: 'Maintenance Type', type: 'select', required: true, options: [{ value: 'preventive', label: 'Preventive' }, { value: 'corrective', label: 'Corrective' }, { value: 'inspection', label: 'Inspection' }] },
  { name: 'priority', label: 'Priority', type: 'select', required: true, options: [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }] },
  { name: 'next_due', label: 'Next Due Date', type: 'date', required: true },
  { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
];

export default function MaintenancePage() {
  const router = useRouter();
  const { data: maintenanceItems, isLoading, error, refetch } = useMaintenance();
  const items = (maintenanceItems || []) as unknown as MaintenanceItem[];

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MaintenanceItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const overdueCount = items.filter(i => i.next_due && new Date(i.next_due) < new Date() && i.status !== "completed").length;
  const inProgressCount = items.filter(i => i.status === "in-progress").length;

  const rowActions: ListPageAction<MaintenanceItem>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedItem(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (r) => router.push(`/maintenance/${r.id}`) },
    { id: 'complete', label: 'Mark Complete', icon: '✅', onClick: (r) => console.log('Complete', r.id) },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    console.log('Create maintenance:', data);
    setCreateModalOpen(false);
    refetch?.();
  };

  const stats = [
    { label: 'Total Items', value: items.length },
    { label: 'In Progress', value: inProgressCount },
    { label: 'Overdue', value: overdueCount },
    { label: 'Completed', value: items.filter(i => i.status === 'completed').length },
  ];

  const detailSections: DetailSection[] = selectedItem ? [
    { id: 'overview', title: 'Maintenance Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Equipment:</strong> {selectedItem.equipment_name}</div>
        <div><strong>Type:</strong> {formatStatus(selectedItem.type)}</div>
        <div><strong>Priority:</strong> {selectedItem.priority}</div>
        <div><strong>Status:</strong> {formatStatus(selectedItem.status)}</div>
        <div><strong>Last Service:</strong> {selectedItem.last_service ? new Date(selectedItem.last_service).toLocaleDateString() : 'N/A'}</div>
        <div><strong>Next Due:</strong> {selectedItem.next_due ? new Date(selectedItem.next_due).toLocaleDateString() : 'N/A'}</div>
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<MaintenanceItem>
        title="Equipment Maintenance"
        subtitle="Track and schedule equipment maintenance tasks"
        data={items}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error instanceof Error ? error : undefined}
        onRetry={() => refetch?.()}
        searchPlaceholder="Search equipment..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedItem(r); setDrawerOpen(true); }}
        createLabel="Schedule Maintenance"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No maintenance records found"
        emptyAction={{ label: 'Schedule Maintenance', onClick: () => setCreateModalOpen(true) }}
        header={<Navigation />}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Schedule Maintenance"
        fields={formFields}
        onSubmit={handleCreate}
      />

      {selectedItem && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedItem}
          title={(m) => m.equipment_name}
          subtitle={(m) => formatStatus(m.type)}
          sections={detailSections}
          onEdit={(m) => router.push(`/maintenance/${m.id}`)}
          actions={[{ id: 'complete', label: 'Mark Complete', icon: '✅' }]}
          onAction={(id) => console.log('Action', id)}
        />
      )}
    </>
  );
}
