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

interface Referral {
  id: string;
  candidateName: string;
  position: string;
  referredBy: string;
  referrerDept: string;
  submittedDate: string;
  status: "Pending" | "Interviewing" | "Hired" | "Rejected";
  bonusStatus?: "Pending" | "Paid";
  bonusAmount?: number;
}

const mockReferrals: Referral[] = [
  { id: "REF-001", candidateName: "Alex Thompson", position: "Audio Engineer", referredBy: "John Smith", referrerDept: "Audio", submittedDate: "2024-11-20", status: "Interviewing" },
  { id: "REF-002", candidateName: "Maria Garcia", position: "Lighting Designer", referredBy: "Sarah Johnson", referrerDept: "Lighting", submittedDate: "2024-11-15", status: "Hired", bonusStatus: "Pending", bonusAmount: 2500 },
  { id: "REF-003", candidateName: "James Wilson", position: "Stage Manager", referredBy: "Mike Davis", referrerDept: "Stage", submittedDate: "2024-11-10", status: "Hired", bonusStatus: "Paid", bonusAmount: 2500 },
  { id: "REF-004", candidateName: "Emily Chen", position: "Video Technician", referredBy: "John Smith", referrerDept: "Audio", submittedDate: "2024-11-05", status: "Rejected" },
];

const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
  switch (status) {
    case "Hired": case "Paid": return "solid";
    case "Interviewing": case "Pending": return "outline";
    case "Rejected": return "ghost";
    default: return "outline";
  }
};

const columns: ListPageColumn<Referral>[] = [
  { key: "candidateName", label: "Candidate", accessor: "candidateName", sortable: true },
  { key: "position", label: "Position", accessor: "position" },
  { key: "referredBy", label: "Referred By", accessor: "referredBy", sortable: true },
  { key: "submittedDate", label: "Date", accessor: "submittedDate", sortable: true },
  { key: "status", label: "Status", accessor: "status", sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
  { key: "bonus", label: "Bonus", accessor: (r) => r.bonusAmount ? `$${r.bonusAmount.toLocaleString()}` : "—", render: (v, r) => r.bonusStatus ? <Badge variant={getStatusVariant(r.bonusStatus)}>{String(v)}</Badge> : <span>—</span> },
];

const filters: ListPageFilter[] = [
  { key: "status", label: "Status", options: [
    { value: "Pending", label: "Pending" },
    { value: "Interviewing", label: "Interviewing" },
    { value: "Hired", label: "Hired" },
    { value: "Rejected", label: "Rejected" },
  ]},
];

const formFields: FormFieldConfig[] = [
  { name: "candidateName", label: "Candidate Name", type: "text", required: true },
  { name: "email", label: "Candidate Email", type: "text", required: true },
  { name: "phone", label: "Candidate Phone", type: "text" },
  { name: "position", label: "Position", type: "select", required: true, options: [
    { value: "Audio Engineer", label: "Audio Engineer" },
    { value: "Lighting Designer", label: "Lighting Designer" },
    { value: "Video Technician", label: "Video Technician" },
    { value: "Stage Manager", label: "Stage Manager" },
  ]},
  { name: "relationship", label: "How do you know this person?", type: "text" },
];

export default function ReferralProgramPage() {
  const router = useRouter();
  const [referrals] = useState<Referral[]>(mockReferrals);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const hiredCount = referrals.filter(r => r.status === "Hired").length;
  const pendingBonuses = referrals.filter(r => r.bonusStatus === "Pending").reduce((s, r) => s + (r.bonusAmount || 0), 0);
  const totalPaid = referrals.filter(r => r.bonusStatus === "Paid").reduce((s, r) => s + (r.bonusAmount || 0), 0);

  const rowActions: ListPageAction<Referral>[] = [
    { id: "view", label: "View Details", icon: "👁️", onClick: (r) => { setSelectedReferral(r); setDrawerOpen(true); } },
  ];

  const stats = [
    { label: "Total Referrals", value: referrals.length },
    { label: "Hired", value: hiredCount },
    { label: "Pending Bonuses", value: `$${pendingBonuses.toLocaleString()}` },
    { label: "Total Paid", value: `$${totalPaid.toLocaleString()}` },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    console.log("Submit referral:", data);
    setCreateModalOpen(false);
  };

  const detailSections: DetailSection[] = selectedReferral ? [
    { id: "overview", title: "Referral Details", content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Candidate:</strong> {selectedReferral.candidateName}</div>
        <div><strong>Position:</strong> {selectedReferral.position}</div>
        <div><strong>Referred By:</strong> {selectedReferral.referredBy}</div>
        <div><strong>Department:</strong> {selectedReferral.referrerDept}</div>
        <div><strong>Submitted:</strong> {selectedReferral.submittedDate}</div>
        <div><strong>Status:</strong> {selectedReferral.status}</div>
        {selectedReferral.bonusAmount && (
          <>
            <div><strong>Bonus:</strong> ${selectedReferral.bonusAmount.toLocaleString()}</div>
            <div><strong>Bonus Status:</strong> {selectedReferral.bonusStatus}</div>
          </>
        )}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<Referral>
        title="Referral Program"
        subtitle="Employee referral tracking and bonus management"
        data={referrals}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search referrals..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedReferral(r); setDrawerOpen(true); }}
        createLabel="Submit Referral"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => router.push("/workforce/referrals/export")}
        stats={stats}
        emptyMessage="No referrals found"
        emptyAction={{ label: "Submit Referral", onClick: () => setCreateModalOpen(true) }}
        header={<CreatorNavigationAuthenticated
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Workforce', href: '/workforce' }, { label: 'Referrals' }]}
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
        title="Submit Referral"
        fields={formFields}
        onSubmit={handleCreate}
      />

      {selectedReferral && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedReferral}
          title={(r) => r.candidateName}
          subtitle={(r) => `${r.position} • ${r.status}`}
          sections={detailSections}
        />
      )}
    </>
  );
}
