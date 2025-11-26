"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  ListPage, Badge, DetailDrawer,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from "@ghxstship/ui";
import { getBadgeVariant } from "@ghxstship/config";

interface DamageReport {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  reportedBy: string;
  reportedDate: string;
  severity: "Minor" | "Moderate" | "Major" | "Critical";
  status: "Reported" | "Under Review" | "Repair Scheduled" | "In Repair" | "Resolved" | "Write-Off";
  description: string;
  location: string;
  projectId?: string;
  estimatedCost?: number;
  actualCost?: number;
  insuranceClaim?: boolean;
  photos?: string[];
  repairVendor?: string;
  resolvedDate?: string;
  [key: string]: unknown;
}

const mockData: DamageReport[] = [
  { id: "DMG-001", assetId: "AST-003", assetName: "disguise gx 2c Media Server", category: "Video", reportedBy: "Mike Thompson", reportedDate: "2024-11-20", severity: "Moderate", status: "In Repair", description: "Fan failure causing overheating. Unit shut down during show.", location: "Tampa Convention Center", projectId: "PROJ-089", estimatedCost: 1200, repairVendor: "PRG Technical Services", insuranceClaim: false },
  { id: "DMG-002", assetId: "AST-002", assetName: "Robe MegaPointe #7", category: "Lighting", reportedBy: "Sarah Chen", reportedDate: "2024-11-18", severity: "Major", status: "Repair Scheduled", description: "Gobo wheel motor seized. Complete motor assembly replacement needed.", location: "Warehouse A", estimatedCost: 850, repairVendor: "Robe Service Center", insuranceClaim: false },
  { id: "DMG-003", assetId: "AST-004", assetName: "Staging Deck Module #23", category: "Staging", reportedBy: "Tom Wilson", reportedDate: "2024-11-15", severity: "Minor", status: "Resolved", description: "Surface scratches from load-in. Cosmetic only.", location: "Amalie Arena", projectId: "PROJ-088", estimatedCost: 150, actualCost: 120, resolvedDate: "2024-11-17" },
  { id: "DMG-004", assetId: "AST-005", assetName: "Chain Motor Hoist #12", category: "Rigging", reportedBy: "John Martinez", reportedDate: "2024-11-22", severity: "Critical", status: "Under Review", description: "Chain slippage detected during load test. Removed from service pending inspection.", location: "Warehouse A", insuranceClaim: true },
];

const getSeverityVariant = (severity: string): 'solid' | 'outline' | 'ghost' => {
  switch (severity) { case 'Critical': return 'solid'; case 'Major': return 'outline'; case 'Moderate': return 'outline'; case 'Minor': return 'ghost'; default: return 'ghost'; }
};

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<DamageReport>[] = [
  { key: 'assetName', label: 'Asset', accessor: (r) => `${r.assetName} (${r.assetId})`, sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'description', label: 'Description', accessor: (r) => r.description.substring(0, 50) + '...' },
  { key: 'severity', label: 'Severity', accessor: 'severity', sortable: true, render: (v) => <Badge variant={getSeverityVariant(String(v))}>{String(v)}</Badge> },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
  { key: 'estimatedCost', label: 'Est. Cost', accessor: (r) => r.estimatedCost ? `$${r.estimatedCost}` : '-' },
  { key: 'reportedDate', label: 'Reported', accessor: 'reportedDate', sortable: true },
];

const filters: ListPageFilter[] = [
  { key: 'severity', label: 'Severity', options: [{ value: 'Critical', label: 'Critical' }, { value: 'Major', label: 'Major' }, { value: 'Moderate', label: 'Moderate' }, { value: 'Minor', label: 'Minor' }] },
  { key: 'status', label: 'Status', options: [{ value: 'Reported', label: 'Reported' }, { value: 'Under Review', label: 'Under Review' }, { value: 'Repair Scheduled', label: 'Repair Scheduled' }, { value: 'In Repair', label: 'In Repair' }, { value: 'Resolved', label: 'Resolved' }] },
];

export default function DamageReportsPage() {
  const router = useRouter();
  const [data] = useState<DamageReport[]>(mockData);
  const [selected, setSelected] = useState<DamageReport | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeReports = data.filter(r => !["Resolved", "Write-Off"].includes(r.status)).length;
  const criticalCount = data.filter(r => r.severity === "Critical" && r.status !== "Resolved").length;
  const totalEstimatedCost = data.filter(r => r.status !== "Resolved").reduce((sum, r) => sum + (r.estimatedCost || 0), 0);

  const rowActions: ListPageAction<DamageReport>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'update', label: 'Update Status', icon: '✏️', onClick: (r) => console.log('Update', r.id) },
  ];

  const stats = [
    { label: 'Active Reports', value: activeReports },
    { label: 'Critical Issues', value: criticalCount },
    { label: 'Est. Repair Cost', value: `$${totalEstimatedCost.toLocaleString()}` },
    { label: 'Total Reports', value: data.length },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Damage Report Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Asset:</strong> {selected.assetName}</div>
        <div><strong>Category:</strong> {selected.category}</div>
        <div><strong>Severity:</strong> {selected.severity}</div>
        <div><strong>Status:</strong> {selected.status}</div>
        <div><strong>Location:</strong> {selected.location}</div>
        <div><strong>Reported By:</strong> {selected.reportedBy}</div>
        <div><strong>Reported Date:</strong> {selected.reportedDate}</div>
        <div><strong>Est. Cost:</strong> {selected.estimatedCost ? `$${selected.estimatedCost}` : 'N/A'}</div>
        <div className="col-span-2"><strong>Description:</strong> {selected.description}</div>
        {selected.repairVendor && <div><strong>Repair Vendor:</strong> {selected.repairVendor}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<DamageReport>
        title="Damage Reports & Repairs"
        subtitle="Track equipment damage, repairs, and insurance claims"
        data={data}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search damage reports..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No damage reports found"
        header={<Navigation />}
      />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.assetName}
          subtitle={(r) => `${r.severity} • ${r.status}`}
          sections={detailSections}
          actions={[{ id: 'update', label: 'Update Status', icon: '✏️' }, { id: 'resolve', label: 'Resolve', icon: '✅' }]}
          onAction={(id, r) => { console.log(id, r.id); setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
