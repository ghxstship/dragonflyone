"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  ListPage,
  Badge,
  DetailDrawer,
  RecordFormModal,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
  type FormFieldConfig,
} from "@ghxstship/ui";
import { getBadgeVariant } from "@ghxstship/config";

interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  type: "Preventive" | "Corrective" | "Emergency" | "Inspection";
  status: "Scheduled" | "In Progress" | "Completed" | "Overdue";
  priority: "Low" | "Medium" | "High" | "Critical";
  scheduledDate: string;
  completedDate?: string;
  technician?: string;
  vendor?: string;
  cost?: number;
  description: string;
  notes?: string;
  laborHours?: number;
  nextDue?: string;
  [key: string]: unknown;
}

const mockRecords: MaintenanceRecord[] = [
  { id: "MNT-001", assetId: "AST-001", assetName: "Meyer Sound LEO Family Line Array", category: "Audio", type: "Preventive", status: "Scheduled", priority: "Medium", scheduledDate: "2025-01-15", description: "Quarterly speaker driver inspection", technician: "John Martinez", nextDue: "2025-04-15" },
  { id: "MNT-002", assetId: "AST-002", assetName: "Robe MegaPointe Lighting Fixtures", category: "Lighting", type: "Corrective", status: "In Progress", priority: "High", scheduledDate: "2024-11-20", description: "Replace faulty gobo wheel motor", technician: "Sarah Chen", vendor: "Robe Lighting", cost: 1250, laborHours: 4 },
  { id: "MNT-003", assetId: "AST-003", assetName: "disguise gx 2c Media Server", category: "Video", type: "Preventive", status: "Completed", priority: "Medium", scheduledDate: "2024-11-18", completedDate: "2024-11-18", description: "Annual system diagnostics", technician: "Mike Thompson", cost: 450, laborHours: 3, notes: "All tests passed", nextDue: "2025-11-18" },
  { id: "MNT-004", assetId: "AST-005", assetName: "Chain Motor Hoists (20x 2-ton)", category: "Rigging", type: "Inspection", status: "Overdue", priority: "Critical", scheduledDate: "2024-11-01", description: "Annual safety inspection - OSHA compliance", notes: "URGENT: Cannot be used until completed" },
  { id: "MNT-005", assetId: "AST-004", assetName: "Staging Deck System", category: "Staging", type: "Preventive", status: "Completed", priority: "Low", scheduledDate: "2024-10-01", completedDate: "2024-10-01", description: "Surface refinishing", technician: "Tom Wilson", cost: 2800, laborHours: 16, nextDue: "2025-04-01" },
];

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
  const router = useRouter();
  const [records, setRecords] = useState<MaintenanceRecord[]>(mockRecords);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const scheduledCount = records.filter((r) => r.status === "Scheduled").length;
  const inProgressCount = records.filter((r) => r.status === "In Progress").length;
  const overdueCount = records.filter((r) => r.status === "Overdue").length;
  const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);

  const handleCreate = async (data: Record<string, unknown>) => {
    const newRecord: MaintenanceRecord = {
      id: `MNT-${Date.now()}`,
      assetId: `AST-${Date.now()}`,
      assetName: String(data.assetName),
      category: 'General',
      type: data.type as MaintenanceRecord['type'],
      status: 'Scheduled',
      priority: data.priority as MaintenanceRecord['priority'],
      scheduledDate: String(data.scheduledDate),
      description: String(data.description),
      technician: data.technician ? String(data.technician) : undefined,
    };
    setRecords([...records, newRecord]);
    setCreateModalOpen(false);
  };

  const rowActions: ListPageAction<MaintenanceRecord>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedRecord(r); setDrawerOpen(true); } },
    { id: 'complete', label: 'Mark Complete', icon: '✓', onClick: (r) => setRecords(records.map(rec => rec.id === r.id ? { ...rec, status: 'Completed' as const, completedDate: new Date().toISOString().split('T')[0] } : rec)) },
  ];

  const stats = [
    { label: 'Scheduled', value: scheduledCount },
    { label: 'In Progress', value: inProgressCount },
    { label: 'Overdue', value: overdueCount },
    { label: 'YTD Costs', value: `$${(totalCost / 1000).toFixed(1)}K` },
  ];

  const detailSections: DetailSection[] = selectedRecord ? [
    { id: 'overview', title: 'Maintenance Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Asset:</strong> {selectedRecord.assetName}</div>
        <div><strong>Category:</strong> {selectedRecord.category}</div>
        <div><strong>Type:</strong> {selectedRecord.type}</div>
        <div><strong>Priority:</strong> {selectedRecord.priority}</div>
        <div><strong>Status:</strong> {selectedRecord.status}</div>
        <div><strong>Scheduled:</strong> {selectedRecord.scheduledDate}</div>
        {selectedRecord.technician && <div><strong>Technician:</strong> {selectedRecord.technician}</div>}
        {selectedRecord.cost && <div><strong>Cost:</strong> ${selectedRecord.cost.toLocaleString()}</div>}
        {selectedRecord.laborHours && <div><strong>Labor Hours:</strong> {selectedRecord.laborHours}</div>}
        {selectedRecord.notes && <div className="col-span-2"><strong>Notes:</strong> {selectedRecord.notes}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<MaintenanceRecord>
        title="Asset Maintenance"
        subtitle="Maintenance scheduling, service records, and preventive maintenance tracking"
        data={records}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search maintenance records..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedRecord(r); setDrawerOpen(true); }}
        createLabel="Schedule Maintenance"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No maintenance records found"
        emptyAction={{ label: 'Schedule Maintenance', onClick: () => setCreateModalOpen(true) }}
        header={<Navigation />}
      />
      {selectedRecord && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedRecord}
          title={(r) => r.assetName}
          subtitle={(r) => `${r.type} • ${r.status}`}
          sections={detailSections}
          actions={[{ id: 'complete', label: 'Mark Complete', icon: '✓' }, { id: 'edit', label: 'Edit', icon: '✏️' }]}
          onAction={(id, r) => {
            if (id === 'complete') setRecords(records.map(rec => rec.id === r.id ? { ...rec, status: 'Completed' as const } : rec));
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
