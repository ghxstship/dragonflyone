"use client";

import { useState } from "react";
// Layout provided by route group
import { Eye } from 'lucide-react';
import {
  Badge,
  Body,
  DetailDrawer,
  Grid,
  ListPage,
  RecordFormModal,
  Text,
  type DetailSection,
  type FormFieldConfig,
  type ListPageAction,
  type ListPageColumn,
  type ListPageFilter,
} from '@ghxstship/ui';
import { createExportHandler, createImportHandler, getImportTemplates, useReferrals, type Referral as APIReferral } from '@ghxstship/config';
import { DEMO_REFERRALS_FULL } from '../../../../lib/demo-data';

type Referral = APIReferral & { [key: string]: unknown };

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
  { key: "bonus", label: "Bonus", accessor: (r) => r.bonusAmount ? `$${r.bonusAmount.toLocaleString()}` : "—", render: (v, r) => r.bonusStatus ? <Badge variant={getStatusVariant(r.bonusStatus)}>{String(v)}</Badge> : <Text>—</Text> },
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
  const { referrals: apiReferrals, summary, isLoading, error, createReferralAsync, deleteReferralsAsync, hireReferralsAsync, refetch } = useReferrals();
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Use API data or fall back to demo data
  const referrals: Referral[] = apiReferrals.length > 0 ? (apiReferrals as Referral[]) : (DEMO_REFERRALS_FULL as Referral[]);

  const hiredCount = summary?.hired || referrals.filter(r => r.status === "Hired").length;
  const pendingBonuses = summary?.pendingBonuses || referrals.filter(r => r.bonusStatus === "Pending").reduce((s, r) => s + (r.bonusAmount || 0), 0);
  const totalPaid = summary?.totalPaid || referrals.filter(r => r.bonusStatus === "Paid").reduce((s, r) => s + (r.bonusAmount || 0), 0);

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
    try {
      await createReferralAsync({
        candidateName: String(data.candidateName || ''),
        candidateEmail: String(data.email || ''),
        candidatePhone: String(data.phone || ''),
        position: String(data.position || ''),
        referredBy: String(data.referredBy || ''),
        referrerDept: String(data.referrerDept || ''),
        submittedDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
      });
      refetch();
      setCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to create referral:', err);
    }
  };

  const detailSections: DetailSection[] = selectedReferral ? [
    { id: "overview", title: "Referral Details", content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<Referral, 'id'>>({

    entityType: 'referrals',

    requiredFields: ['candidateName', 'email', 'phone'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/referrals', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('referrals');


  return (
    <>
      <ListPage<Referral>
        title="Referral Program"
        subtitle="Employee referral tracking and bonus management"
        data={referrals}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error as Error | undefined}
        onRetry={() => refetch()}
        searchPlaceholder="Search referrals..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedReferral(r); setDrawerOpen(true); }}
        createLabel="Submit Referral"
        onCreate={() => setCreateModalOpen(true)}
        entityType="referrals"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['candidateName', 'email', 'phone', 'position', 'relationship', 'referrals', 'referredBy']}
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
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await deleteReferralsAsync(ids);
            refetch();
          } else if (action === 'hire') {
            await hireReferralsAsync(ids);
            refetch();
          }
        }}
        bulkActions={[
          { id: 'hire', label: 'Mark Hired', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
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
    </>
  );
}
