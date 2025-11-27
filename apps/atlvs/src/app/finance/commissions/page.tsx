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
import { getBadgeVariant } from "@ghxstship/config";

interface CommissionRecord {
  id: string;
  salesRep: string;
  dealId: string;
  dealName: string;
  client: string;
  dealValue: number;
  commissionRate: number;
  commissionAmount: number;
  status: "Pending" | "Approved" | "Paid" | "Disputed";
  closeDate: string;
  paymentDate?: string;
  [key: string]: unknown;
}

const mockRecords: CommissionRecord[] = [
  { id: "COM-001", salesRep: "John Smith", dealId: "DEAL-156", dealName: "TechCorp Annual Conference", client: "TechCorp Events", dealValue: 125000, commissionRate: 12, commissionAmount: 15000, status: "Approved", closeDate: "2024-11-15" },
  { id: "COM-002", salesRep: "Jane Doe", dealId: "DEAL-157", dealName: "Festival Productions Partnership", client: "Festival Productions", dealValue: 85000, commissionRate: 15, commissionAmount: 12750, status: "Pending", closeDate: "2024-11-20" },
  { id: "COM-003", salesRep: "John Smith", dealId: "DEAL-158", dealName: "Corporate Events Renewal", client: "Corporate Events Inc", dealValue: 45000, commissionRate: 5, commissionAmount: 2250, status: "Paid", closeDate: "2024-11-01", paymentDate: "2024-11-15" },
  { id: "COM-004", salesRep: "Mike Johnson", dealId: "DEAL-159", dealName: "StartUp Launch Event", client: "StartUp Ventures", dealValue: 28000, commissionRate: 10, commissionAmount: 2800, status: "Disputed", closeDate: "2024-11-18" },
  { id: "COM-005", salesRep: "Jane Doe", dealId: "DEAL-160", dealName: "Media Group Awards Show", client: "Media Group LLC", dealValue: 95000, commissionRate: 10, commissionAmount: 9500, status: "Approved", closeDate: "2024-11-22" },
];

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<CommissionRecord>[] = [
  { key: 'salesRep', label: 'Sales Rep', accessor: 'salesRep', sortable: true },
  { key: 'dealName', label: 'Deal', accessor: 'dealName', sortable: true },
  { key: 'client', label: 'Client', accessor: 'client' },
  { key: 'dealValue', label: 'Deal Value', accessor: (r) => `$${r.dealValue.toLocaleString()}`, sortable: true },
  { key: 'commissionRate', label: 'Rate', accessor: (r) => `${r.commissionRate}%` },
  { key: 'commissionAmount', label: 'Commission', accessor: (r) => `$${r.commissionAmount.toLocaleString()}`, sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'Pending', label: 'Pending' }, { value: 'Approved', label: 'Approved' }, { value: 'Paid', label: 'Paid' }, { value: 'Disputed', label: 'Disputed' }] },
  { key: 'salesRep', label: 'Sales Rep', options: [{ value: 'John Smith', label: 'John Smith' }, { value: 'Jane Doe', label: 'Jane Doe' }, { value: 'Mike Johnson', label: 'Mike Johnson' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'salesRep', label: 'Sales Rep', type: 'text', required: true },
  { name: 'dealName', label: 'Deal Name', type: 'text', required: true },
  { name: 'client', label: 'Client', type: 'text', required: true },
  { name: 'dealValue', label: 'Deal Value', type: 'number', required: true },
  { name: 'commissionRate', label: 'Commission Rate (%)', type: 'number', required: true },
];

export default function CommissionsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<CommissionRecord[]>(mockRecords);
  const [selectedRecord, setSelectedRecord] = useState<CommissionRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const totalCommissions = records.reduce((sum, r) => sum + r.commissionAmount, 0);
  const pendingCommissions = records.filter(r => r.status === "Pending" || r.status === "Approved").reduce((sum, r) => sum + r.commissionAmount, 0);
  const paidCommissions = records.filter(r => r.status === "Paid").reduce((sum, r) => sum + r.commissionAmount, 0);
  const disputedCount = records.filter(r => r.status === "Disputed").length;

  const handleCreate = async (data: Record<string, unknown>) => {
    const dealValue = Number(data.dealValue);
    const rate = Number(data.commissionRate);
    const newRecord: CommissionRecord = {
      id: `COM-${Date.now()}`,
      salesRep: String(data.salesRep),
      dealId: `DEAL-${Date.now()}`,
      dealName: String(data.dealName),
      client: String(data.client),
      dealValue,
      commissionRate: rate,
      commissionAmount: Math.round(dealValue * rate / 100),
      status: 'Pending',
      closeDate: new Date().toISOString().split('T')[0],
    };
    setRecords([...records, newRecord]);
    setCreateModalOpen(false);
  };

  const rowActions: ListPageAction<CommissionRecord>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedRecord(r); setDrawerOpen(true); } },
    { id: 'approve', label: 'Approve', icon: '✓', onClick: (r) => setRecords(records.map(rec => rec.id === r.id ? { ...rec, status: 'Approved' as const } : rec)) },
  ];

  const stats = [
    { label: 'Total Commissions', value: `$${(totalCommissions / 1000).toFixed(1)}K` },
    { label: 'Pending Payout', value: `$${(pendingCommissions / 1000).toFixed(1)}K` },
    { label: 'Paid This Month', value: `$${(paidCommissions / 1000).toFixed(1)}K` },
    { label: 'Disputed', value: disputedCount },
  ];

  const detailSections: DetailSection[] = selectedRecord ? [
    { id: 'overview', title: 'Commission Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Sales Rep:</strong> {selectedRecord.salesRep}</div>
        <div><strong>Status:</strong> {selectedRecord.status}</div>
        <div><strong>Deal:</strong> {selectedRecord.dealName}</div>
        <div><strong>Client:</strong> {selectedRecord.client}</div>
        <div><strong>Deal Value:</strong> ${selectedRecord.dealValue.toLocaleString()}</div>
        <div><strong>Rate:</strong> {selectedRecord.commissionRate}%</div>
        <div><strong>Commission:</strong> ${selectedRecord.commissionAmount.toLocaleString()}</div>
        <div><strong>Close Date:</strong> {selectedRecord.closeDate}</div>
        {selectedRecord.paymentDate && <div><strong>Payment Date:</strong> {selectedRecord.paymentDate}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<CommissionRecord>
        title="Commission Management"
        subtitle="Calculate, track, and manage sales commissions"
        data={records}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search commissions..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedRecord(r); setDrawerOpen(true); }}
        createLabel="Add Commission"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No commission records found"
        emptyAction={{ label: 'Add Commission', onClick: () => setCreateModalOpen(true) }}
        header={<CreatorNavigationAuthenticated />}
      />
      {selectedRecord && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedRecord}
          title={(r) => r.dealName}
          subtitle={(r) => `${r.salesRep} • $${r.commissionAmount.toLocaleString()}`}
          sections={detailSections}
          actions={[
            { id: 'approve', label: 'Approve', icon: '✓' },
            { id: 'pay', label: 'Mark Paid', icon: '💰' },
          ]}
          onAction={(id, r) => {
            if (id === 'approve') setRecords(records.map(rec => rec.id === r.id ? { ...rec, status: 'Approved' as const } : rec));
            if (id === 'pay') setRecords(records.map(rec => rec.id === r.id ? { ...rec, status: 'Paid' as const, paymentDate: new Date().toISOString().split('T')[0] } : rec));
            setDrawerOpen(false);
          }}
        />
      )}
      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Commission Record"
        fields={formFields}
        onSubmit={handleCreate}
        mode="create"
      />
    </>
  );
}
