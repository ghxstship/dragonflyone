"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AtlvsAppLayout } from "../../../components/app-layout";
import { Eye } from 'lucide-react';
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
  type ExportFormat,
} from "@ghxstship/ui";
import { createExportHandler } from "@ghxstship/config";

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
  const _router = useRouter();
  const [referrals, setReferrals] = useState<Referral[]>(mockReferrals);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const hiredCount = referrals.filter(r => r.status === "Hired").length;
  const pendingBonuses = referrals.filter(r => r.bonusStatus === "Pending").reduce((s, r) => s + (r.bonusAmount || 0), 0);
  const totalPaid = referrals.filter(r => r.bonusStatus === "Paid").reduce((s, r) => s + (r.bonusAmount || 0), 0);

  const rowActions: ListPageAction<Referral>[] = [
    { id: "view", label: "View Details", icon: <Eye className="size-4" />, onClick: (r) => { setSelectedReferral(r); setDrawerOpen(true); } },
  ];

  const stats = [
    { label: "Total Referrals", value: referrals.length },
    { label: "Hired", value: hiredCount },
    { label: "Pending Bonuses", value: `$${pendingBonuses.toLocaleString()}` },
    { label: "Total Paid", value: `$${totalPaid.toLocaleString()}` },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    const newReferral: Referral = {
      id: `REF-${String(referrals.length + 1).padStart(3, '0')}`,
      candidateName: String(data.candidateName || ''),
      position: String(data.position || ''),
      referredBy: String(data.referredBy || ''),
      referrerDept: String(data.referrerDept || ''),
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };
    setReferrals((prev: Referral[]) => [...prev, newReferral]);
    setCreateModalOpen(false);
  };

  const detailSections: DetailSection[] = selectedReferral ? [
    { id: "overview", title: "Referral Details", content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Candidate:</strong> {selectedReferral.candidateName}</Body>
        <Body size="sm"><strong>Position:</strong> {selectedReferral.position}</Body>
        <Body size="sm"><strong>Referred By:</strong> {selectedReferral.referredBy}</Body>
        <Body size="sm"><strong>Department:</strong> {selectedReferral.referrerDept}</Body>
        <Body size="sm"><strong>Submitted:</strong> {selectedReferral.submittedDate}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedReferral.status}</Body>
        {selectedReferral.bonusAmount && (
          <>
            <Body size="sm"><strong>Bonus:</strong> ${selectedReferral.bonusAmount.toLocaleString()}</Body>
            <Body size="sm"><strong>Bonus Status:</strong> {selectedReferral.bonusStatus}</Body>
          </>
        )}
      </Grid>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
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
        entityType="referrals"
        onExport={createExportHandler({
          filename: "referrals",
          getData: () => referrals.map(r => ({
            id: r.id,
            candidateName: r.candidateName,
            position: r.position,
            referredBy: r.referredBy,
            submittedDate: r.submittedDate,
            status: r.status,
            bonusStatus: r.bonusStatus || '',
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No referrals found"
        emptyAction={{ label: "Submit Referral", onClick: () => setCreateModalOpen(true) }}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        showFavorite
        showSettings
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
    </AtlvsAppLayout>
  );
}
