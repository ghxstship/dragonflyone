"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import { useContracts } from "../../hooks/useContracts";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  useNotifications,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";

interface Contract {
  id: string;
  title: string;
  vendor?: { name: string };
  type: string;
  value: number;
  status: string;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  terms?: string;
}

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};

const columns: ListPageColumn<Contract>[] = [
  { key: 'title', label: 'Client', accessor: (row) => row.vendor?.name || row.title, sortable: true },
  { key: 'type', label: 'Type', accessor: 'type', sortable: true },
  { key: 'value', label: 'Value', accessor: 'value', sortable: true, render: (value) => formatCurrency(Number(value) || 0) },
  { 
    key: 'status', 
    label: 'Status', 
    accessor: 'status', 
    sortable: true,
    render: (value) => <Badge variant={value === 'active' ? 'solid' : 'outline'}>{String(value).toUpperCase()}</Badge>
  },
  { key: 'start_date', label: 'Start Date', accessor: 'start_date', sortable: true, render: (value) => value ? new Date(String(value)).toLocaleDateString() : '—' },
  { key: 'end_date', label: 'End Date', accessor: 'end_date', sortable: true, render: (value) => value ? new Date(String(value)).toLocaleDateString() : '—' },
  { key: 'auto_renew', label: 'Auto Renew', accessor: 'auto_renew', render: (value) => value ? 'Yes' : 'No' },
];

const filters: ListPageFilter[] = [
  { 
    key: 'status', 
    label: 'Status', 
    options: [
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' },
      { value: 'expired', label: 'Expired' },
    ]
  },
  {
    key: 'type',
    label: 'Type',
    options: [
      { value: 'service', label: 'Service' },
      { value: 'vendor', label: 'Vendor' },
      { value: 'client', label: 'Client' },
      { value: 'partnership', label: 'Partnership' },
    ]
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'title', label: 'Contract Title', type: 'text', required: true, colSpan: 2 },
  { name: 'vendor_id', label: 'Vendor/Client', type: 'select', required: true, options: [] },
  { name: 'type', label: 'Contract Type', type: 'select', required: true, options: [
    { value: 'service', label: 'Service' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'client', label: 'Client' },
    { value: 'partnership', label: 'Partnership' },
  ]},
  { name: 'value', label: 'Contract Value', type: 'number', required: true },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'expired', label: 'Expired' },
  ]},
  { name: 'start_date', label: 'Start Date', type: 'date', required: true },
  { name: 'end_date', label: 'End Date', type: 'date', required: true },
  { name: 'auto_renew', label: 'Auto Renew', type: 'checkbox' },
  { name: 'terms', label: 'Terms & Notes', type: 'textarea', colSpan: 2 },
];

export default function ContractsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { data: contracts, isLoading, error, refetch } = useContracts();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);

  const contractList = (contracts || []) as unknown as Contract[];

  const handleExportReport = async () => {
    try {
      const response = await fetch("/api/contracts/export", { method: "POST" });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contracts-report-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        addNotification({ type: "success", title: "Success", message: "Report exported successfully" });
      }
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to export report" });
    }
  };

  const rowActions: ListPageAction<Contract>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (row) => { setSelectedContract(row); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (row) => router.push(`/contracts/${row.id}/edit`) },
    { id: 'renew', label: 'Renew', icon: '🔄', onClick: (row) => router.push(`/contracts/${row.id}/renew`) },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', onClick: (row) => { setContractToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: '⬇️' },
    { id: 'renew', label: 'Bulk Renew', icon: '🔄' },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    const response = await fetch('/api/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      setCreateModalOpen(false);
      refetch();
      addNotification({ type: "success", title: "Success", message: "Contract created" });
    }
  };

  const handleDelete = async () => {
    if (contractToDelete) {
      await fetch(`/api/contracts/${contractToDelete.id}`, { method: 'DELETE' });
      setDeleteConfirmOpen(false);
      setContractToDelete(null);
      refetch();
    }
  };

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    if (actionId === 'export') handleExportReport();
  };

  const totalValue = contractList.reduce((sum, c) => sum + (c.value || 0), 0);
  const renewalsDue = contractList.filter(c => {
    const endDate = c.end_date ? new Date(c.end_date) : null;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return endDate && endDate <= thirtyDaysFromNow && c.status === "active";
  }).length;

  const stats = [
    { label: 'Total Contracts', value: contractList.length },
    { label: 'Active', value: contractList.filter(c => c.status === 'active').length },
    { label: 'Total Value', value: formatCurrency(totalValue) },
    { label: 'Renewals Due', value: renewalsDue },
  ];

  const detailSections: DetailSection[] = selectedContract ? [
    {
      id: 'overview',
      title: 'Contract Details',
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div><strong>Title:</strong> {selectedContract.title}</div>
          <div><strong>Client:</strong> {selectedContract.vendor?.name || '—'}</div>
          <div><strong>Type:</strong> {selectedContract.type}</div>
          <div><strong>Value:</strong> {formatCurrency(selectedContract.value)}</div>
          <div><strong>Status:</strong> {selectedContract.status}</div>
          <div><strong>Auto Renew:</strong> {selectedContract.auto_renew ? 'Yes' : 'No'}</div>
          <div><strong>Start:</strong> {selectedContract.start_date ? new Date(selectedContract.start_date).toLocaleDateString() : '—'}</div>
          <div><strong>End:</strong> {selectedContract.end_date ? new Date(selectedContract.end_date).toLocaleDateString() : '—'}</div>
        </div>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<Contract>
        title="Contract Management"
        subtitle="Manage vendor and client contracts"
        data={contractList}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search contracts..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        onRowClick={(row) => { setSelectedContract(row); setDrawerOpen(true); }}
        createLabel="Create Contract"
        onCreate={() => setCreateModalOpen(true)}
        onExport={handleExportReport}
        stats={stats}
        emptyMessage="No contracts found"
        emptyAction={{ label: 'Create Contract', onClick: () => setCreateModalOpen(true) }}
        header={<Navigation />}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Contract"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedContract}
        title={(c) => c.title}
        subtitle={(c) => c.vendor?.name || c.type}
        sections={detailSections}
        onEdit={(c) => router.push(`/contracts/${c.id}/edit`)}
        onDelete={(c) => { setContractToDelete(c); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
        actions={[{ id: 'renew', label: 'Renew', icon: '🔄' }]}
        onAction={(actionId, contract) => {
          if (actionId === 'renew') router.push(`/contracts/${contract.id}/renew`);
        }}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Contract"
        message={`Are you sure you want to delete "${contractToDelete?.title}"?`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setContractToDelete(null); }}
      />
    </>
  );
}
