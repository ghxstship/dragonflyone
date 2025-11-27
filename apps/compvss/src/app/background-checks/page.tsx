"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";
import { getBadgeVariant } from "@ghxstship/config";

interface BackgroundCheck {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  department: string;
  checkType: "Standard" | "Enhanced" | "Federal";
  status: "Pending" | "In Progress" | "Cleared" | "Flagged" | "Expired";
  submittedDate: string;
  completedDate?: string;
  expirationDate?: string;
  provider: string;
  daysUntilExpiry?: number;
  [key: string]: unknown;
}

const mockChecks: BackgroundCheck[] = [
  { id: "BGC-001", crewMemberId: "CRW-101", crewMemberName: "John Smith", department: "Audio", checkType: "Enhanced", status: "Cleared", submittedDate: "2024-01-15", completedDate: "2024-01-22", expirationDate: "2025-01-22", provider: "Sterling", daysUntilExpiry: 58 },
  { id: "BGC-002", crewMemberId: "CRW-102", crewMemberName: "Sarah Johnson", department: "Lighting", checkType: "Standard", status: "Cleared", submittedDate: "2024-03-10", completedDate: "2024-03-15", expirationDate: "2025-03-15", provider: "Checkr", daysUntilExpiry: 110 },
  { id: "BGC-003", crewMemberId: "CRW-103", crewMemberName: "Mike Davis", department: "Stage", checkType: "Enhanced", status: "Expired", submittedDate: "2023-06-01", completedDate: "2023-06-08", expirationDate: "2024-06-08", provider: "Sterling", daysUntilExpiry: -170 },
  { id: "BGC-004", crewMemberId: "CRW-104", crewMemberName: "Emily Chen", department: "Video", checkType: "Standard", status: "In Progress", submittedDate: "2024-11-20", provider: "Checkr" },
  { id: "BGC-005", crewMemberId: "CRW-105", crewMemberName: "Alex Rodriguez", department: "Rigging", checkType: "Federal", status: "Pending", submittedDate: "2024-11-24", provider: "Sterling" },
  { id: "BGC-006", crewMemberId: "CRW-106", crewMemberName: "Lisa Park", department: "Audio", checkType: "Enhanced", status: "Cleared", submittedDate: "2024-08-01", completedDate: "2024-08-10", expirationDate: "2024-12-10", provider: "Checkr", daysUntilExpiry: 15 },
];

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
  const router = useRouter();
  const [checks, setChecks] = useState<BackgroundCheck[]>(mockChecks);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<BackgroundCheck | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const expiringSoon = checks.filter(c => c.daysUntilExpiry !== undefined && c.daysUntilExpiry > 0 && c.daysUntilExpiry <= 30).length;
  const expired = checks.filter(c => c.status === "Expired").length;
  const pending = checks.filter(c => c.status === "Pending" || c.status === "In Progress").length;
  const cleared = checks.filter(c => c.status === "Cleared").length;

  const rowActions: ListPageAction<BackgroundCheck>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedCheck(r); setDrawerOpen(true); } },
    { id: 'renew', label: 'Renew', icon: '🔄', onClick: (r) => console.log('Renew', r.id) },
    { id: 'download', label: 'Download Report', icon: '⬇️', onClick: (r) => console.log('Download', r.id) },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    const newCheck: BackgroundCheck = {
      id: `BGC-${String(checks.length + 1).padStart(3, '0')}`,
      crewMemberId: String(data.crewMemberId),
      crewMemberName: data.crewMemberId === 'CRW-107' ? 'James Wilson' : 'Maria Garcia',
      department: 'New',
      checkType: data.checkType as BackgroundCheck['checkType'],
      status: 'Pending',
      submittedDate: new Date().toISOString().split('T')[0],
      provider: String(data.provider),
    };
    setChecks([...checks, newCheck]);
    setCreateModalOpen(false);
  };

  const stats = [
    { label: 'Cleared', value: cleared },
    { label: 'Pending', value: pending },
    { label: 'Expiring Soon', value: expiringSoon },
    { label: 'Expired', value: expired },
  ];

  const detailSections: DetailSection[] = selectedCheck ? [
    { id: 'overview', title: 'Check Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Crew Member:</strong> {selectedCheck.crewMemberName}</div>
        <div><strong>ID:</strong> {selectedCheck.crewMemberId}</div>
        <div><strong>Department:</strong> {selectedCheck.department}</div>
        <div><strong>Check Type:</strong> {selectedCheck.checkType}</div>
        <div><strong>Status:</strong> {selectedCheck.status}</div>
        <div><strong>Provider:</strong> {selectedCheck.provider}</div>
        <div><strong>Submitted:</strong> {selectedCheck.submittedDate}</div>
        <div><strong>Completed:</strong> {selectedCheck.completedDate || 'Pending'}</div>
        <div><strong>Expiration:</strong> {selectedCheck.expirationDate || '—'}</div>
        <div><strong>Days Until Expiry:</strong> {getExpiryLabel(selectedCheck.daysUntilExpiry)}</div>
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<BackgroundCheck>
        title="Background Checks"
        subtitle="Crew background check status and renewal management"
        data={checks}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search crew members..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedCheck(r); setDrawerOpen(true); }}
        createLabel="Initiate Check"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No background checks found"
        emptyAction={{ label: 'Initiate Check', onClick: () => setCreateModalOpen(true) }}
        header={<CreatorNavigationAuthenticated />}
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
            { id: 'download', label: 'Download Report', icon: '⬇️' },
            ...(selectedCheck.status === 'Expired' ? [{ id: 'renew', label: 'Renew', icon: '🔄' }] : []),
          ]}
          onAction={(id) => console.log('Action', id)}
        />
      )}
    </>
  );
}
