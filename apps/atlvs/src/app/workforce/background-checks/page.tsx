"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../../components/navigation";
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

interface BackgroundCheck {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  checkType: string;
  provider: string;
  requestDate: string;
  completedDate?: string;
  expiryDate?: string;
  status: "Pending" | "In Progress" | "Completed" | "Failed" | "Expired" | "Renewal Due";
  result?: "Clear" | "Review Required" | "Failed";
  notes?: string;
}

const mockBackgroundChecks: BackgroundCheck[] = [
  { id: "BGC-001", employeeId: "EMP-101", employeeName: "John Smith", department: "Production", checkType: "Criminal + Employment", provider: "Checkr", requestDate: "2024-11-01", completedDate: "2024-11-05", expiryDate: "2025-11-05", status: "Completed", result: "Clear" },
  { id: "BGC-002", employeeId: "EMP-102", employeeName: "Sarah Johnson", department: "Finance", checkType: "Criminal + Credit + Employment", provider: "Sterling", requestDate: "2024-11-10", status: "In Progress" },
  { id: "BGC-003", employeeId: "EMP-103", employeeName: "Mike Williams", department: "Operations", checkType: "Criminal", provider: "Checkr", requestDate: "2024-10-15", completedDate: "2024-10-18", expiryDate: "2024-12-18", status: "Renewal Due", result: "Clear" },
  { id: "BGC-004", employeeId: "EMP-104", employeeName: "Emily Davis", department: "Audio", checkType: "Criminal + Employment", provider: "GoodHire", requestDate: "2024-11-15", status: "Pending" },
  { id: "BGC-005", employeeId: "EMP-105", employeeName: "Chris Brown", department: "Lighting", checkType: "Criminal + Drug Screen", provider: "Checkr", requestDate: "2024-09-01", completedDate: "2024-09-05", expiryDate: "2024-09-05", status: "Expired", result: "Clear" },
];

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
  { key: "result", label: "Result", accessor: (r) => r.result || "—", render: (v) => v !== "—" ? <Badge variant={v === "Clear" ? "solid" : "ghost"}>{String(v)}</Badge> : <span>—</span> },
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
  const [checks] = useState<BackgroundCheck[]>(mockBackgroundChecks);
  const [selectedCheck, setSelectedCheck] = useState<BackgroundCheck | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const pendingCount = checks.filter(c => c.status === "Pending" || c.status === "In Progress").length;
  const renewalDueCount = checks.filter(c => c.status === "Renewal Due").length;
  const expiredCount = checks.filter(c => c.status === "Expired").length;
  const completedCount = checks.filter(c => c.status === "Completed").length;

  const rowActions: ListPageAction<BackgroundCheck>[] = [
    { id: "view", label: "View Details", icon: "👁️", onClick: (r) => { setSelectedCheck(r); setDrawerOpen(true); } },
    { id: "renew", label: "Renew", icon: "🔄", onClick: (r) => router.push(`/workforce/background-checks/${r.id}/renew`) },
  ];

  const stats = [
    { label: "Pending", value: pendingCount },
    { label: "Completed", value: completedCount },
    { label: "Renewal Due", value: renewalDueCount },
    { label: "Expired", value: expiredCount },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    console.log("Request background check:", data);
    setCreateModalOpen(false);
  };

  const detailSections: DetailSection[] = selectedCheck ? [
    { id: "overview", title: "Background Check Details", content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Employee:</strong> {selectedCheck.employeeName}</div>
        <div><strong>Department:</strong> {selectedCheck.department}</div>
        <div><strong>Check Type:</strong> {selectedCheck.checkType}</div>
        <div><strong>Provider:</strong> {selectedCheck.provider}</div>
        <div><strong>Requested:</strong> {selectedCheck.requestDate}</div>
        <div><strong>Status:</strong> {selectedCheck.status}</div>
        {selectedCheck.completedDate && <div><strong>Completed:</strong> {selectedCheck.completedDate}</div>}
        {selectedCheck.expiryDate && <div><strong>Expires:</strong> {selectedCheck.expiryDate}</div>}
        {selectedCheck.result && <div><strong>Result:</strong> {selectedCheck.result}</div>}
        {selectedCheck.notes && <div className="col-span-2"><strong>Notes:</strong> {selectedCheck.notes}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<BackgroundCheck>
        title="Background Checks"
        subtitle="Employee background check tracking and compliance"
        data={checks}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search employees..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedCheck(r); setDrawerOpen(true); }}
        createLabel="Request Check"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => router.push("/workforce/background-checks/export")}
        stats={stats}
        emptyMessage="No background checks found"
        header={<CreatorNavigationAuthenticated
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Workforce', href: '/workforce' }, { label: 'Background Checks' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        showFavorite
        showSettings />}
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
