"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AtlvsAppLayout } from "../../../components/app-layout";
import {
  ListPage,
  Badge,
  DetailDrawer,
  RecordFormModal,
  Grid,
  Body,
  useNotifications,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
  type FormFieldConfig,
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";
import { Eye, RefreshCw } from "lucide-react";
import { useVendorContracts, type VendorContract as APIVendorContract } from "../../../hooks/useVendorContracts";
import {
  DEMO_VENDOR_CONTRACTS_FULL,
  type DemoVendorContractFull as DemoVendorContract,
} from "../../../lib/demo-data";

// Unified display type
interface VendorContract {
  id: string;
  vendorName: string;
  contractType: string;
  category: string;
  value: number;
  startDate: string;
  expiryDate: string;
  status: string;
  autoRenew: boolean;
  daysUntilExpiry: number;
}

// Normalize API contract to display format
function normalizeContract(c: APIVendorContract | DemoVendorContract): VendorContract {
  if ('vendor_name' in c) {
    // API contract
    return {
      id: c.id,
      vendorName: c.vendor_name || 'Unknown',
      contractType: c.contract_type,
      category: c.category,
      value: c.value,
      startDate: c.start_date,
      expiryDate: c.expiry_date,
      status: c.status.charAt(0).toUpperCase() + c.status.slice(1),
      autoRenew: c.auto_renew,
      daysUntilExpiry: c.days_until_expiry,
    };
  }
  // Demo contract
  return c as VendorContract;
}

const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
  switch (status) {
    case "Active": return "solid";
    case "Expiring": return "outline";
    case "Expired": return "ghost";
    default: return "outline";
  }
};

const columns: ListPageColumn<VendorContract>[] = [
  { key: "vendorName", label: "Vendor", accessor: "vendorName", sortable: true },
  { key: "contractType", label: "Type", accessor: "contractType", render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: "category", label: "Category", accessor: "category" },
  { key: "value", label: "Value", accessor: (r) => formatCurrency(r.value), sortable: true },
  { key: "expiryDate", label: "Expiry", accessor: "expiryDate", sortable: true },
  { key: "status", label: "Status", accessor: "status", sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: "status", label: "Status", options: [
    { value: "Active", label: "Active" },
    { value: "Expiring", label: "Expiring" },
    { value: "Expired", label: "Expired" },
  ]},
  { key: "category", label: "Category", options: [
    { value: "Audio", label: "Audio" },
    { value: "Lighting", label: "Lighting" },
    { value: "Staging", label: "Staging" },
    { value: "Video", label: "Video" },
  ]},
];

const formFields: FormFieldConfig[] = [
  { name: 'vendor_id', label: 'Vendor ID', type: 'text', required: true },
  { name: 'contract_type', label: 'Contract Type', type: 'select', required: true, options: [
    { value: 'Master Service Agreement', label: 'Master Service Agreement' },
    { value: 'Purchase Agreement', label: 'Purchase Agreement' },
    { value: 'Rental Agreement', label: 'Rental Agreement' },
    { value: 'Service Contract', label: 'Service Contract' },
  ]},
  { name: 'category', label: 'Category', type: 'select', required: true, options: [
    { value: 'Audio', label: 'Audio' },
    { value: 'Lighting', label: 'Lighting' },
    { value: 'Staging', label: 'Staging' },
    { value: 'Video', label: 'Video' },
  ]},
  { name: 'value', label: 'Contract Value', type: 'number', required: true },
  { name: 'start_date', label: 'Start Date', type: 'date', required: true },
  { name: 'expiry_date', label: 'Expiry Date', type: 'date', required: true },
  { name: 'auto_renew', label: 'Auto Renew', type: 'checkbox' },
];

export default function VendorContractsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { data: apiContracts, isLoading, error, refetch } = useVendorContracts();
  
  // Use API data if available, fallback to demo data
  const rawContracts = apiContracts && apiContracts.length > 0 ? apiContracts : DEMO_VENDOR_CONTRACTS_FULL;
  const contracts: VendorContract[] = rawContracts.map(normalizeContract);
  
  const [selectedContract, setSelectedContract] = useState<VendorContract | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const expiringCount = contracts.filter(c => c.status === "Expiring").length;
  const expiredCount = contracts.filter(c => c.status === "Expired").length;
  const totalValue = contracts.reduce((s, c) => s + c.value, 0);

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/vendors/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create contract');
      setCreateModalOpen(false);
      addNotification({ type: 'success', title: 'Contract Created', message: 'Contract has been created successfully.' });
      refetch();
    } catch (err) {
      addNotification({ type: 'error', title: 'Failed to Create Contract', message: err instanceof Error ? err.message : 'An unexpected error occurred' });
    }
  };

  const rowActions: ListPageAction<VendorContract>[] = [
    { id: "view", label: "View Details", icon: <Eye className="size-4" />, onClick: (r) => { setSelectedContract(r); setDrawerOpen(true); } },
    { id: "renew", label: "Renew", icon: <RefreshCw className="size-4" />, onClick: (r) => router.push(`/vendors/contracts/${r.id}/renew`) },
  ];

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'vendor-contracts',
    requiredFields: ['vendorName', 'contractType', 'value'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/vendors/contracts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
    },
  });

  const importTemplates = getImportTemplates('vendor-contracts').length > 0 
    ? getImportTemplates('vendor-contracts') 
    : [{ id: 'default', name: 'Contract Import', mapping: { vendorName: 'vendorName', contractType: 'contractType', value: 'value', startDate: 'startDate', expiryDate: 'expiryDate' } }];

  const stats = [
    { label: "Total Contracts", value: contracts.length },
    { label: "Total Value", value: formatCurrency(totalValue) },
    { label: "Expiring Soon", value: expiringCount },
    { label: "Expired", value: expiredCount },
  ];

  const detailSections: DetailSection[] = selectedContract ? [
    { id: "overview", title: "Contract Details", content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Vendor:</strong> {selectedContract.vendorName}</Body>
        <Body size="sm"><strong>Type:</strong> {selectedContract.contractType}</Body>
        <Body size="sm"><strong>Category:</strong> {selectedContract.category}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedContract.status}</Body>
        <Body size="sm"><strong>Value:</strong> {formatCurrency(selectedContract.value)}</Body>
        <Body size="sm"><strong>Auto-Renew:</strong> {selectedContract.autoRenew ? "Yes" : "No"}</Body>
        <Body size="sm"><strong>Start Date:</strong> {selectedContract.startDate}</Body>
        <Body size="sm"><strong>Expiry Date:</strong> {selectedContract.expiryDate}</Body>
        <Body size="sm"><strong>Days Until Expiry:</strong> {selectedContract.daysUntilExpiry < 0 ? `${Math.abs(selectedContract.daysUntilExpiry)} days ago` : `${selectedContract.daysUntilExpiry} days`}</Body>
      </Grid>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<VendorContract>
        title="Vendor Contracts"
        subtitle="Contract expiration alerts and renewal workflows"
        data={contracts}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        createLabel="New Contract"
        onCreate={() => setCreateModalOpen(true)}
        searchPlaceholder="Search contracts..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedContract(r); setDrawerOpen(true); }}
        entityType="vendor-contracts"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['vendorName', 'contractType', 'value', 'startDate', 'expiryDate']}
        onExport={createExportHandler({
          filename: "vendor-contracts",
          getData: () => contracts.map(c => ({
            id: c.id,
            vendorName: c.vendorName,
            contractType: c.contractType,
            value: c.value,
            startDate: c.startDate,
            endDate: c.expiryDate,
            status: c.status,
          })),
        })}
        stats={stats}
        emptyMessage="No vendor contracts found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/vendors/contracts/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          } else if (action === 'renew') {
            await fetch('/api/vendors/contracts/bulk-renew', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          }
        }}
        bulkActions={[
          { id: 'renew', label: 'Renew Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />

      {selectedContract && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedContract}
          title={(c) => c.vendorName}
          subtitle={(c) => `${c.contractType} • ${c.status}`}
          sections={detailSections}
          actions={[{ id: "renew", label: "Initiate Renewal", icon: <RefreshCw className="size-4" /> }]}
          onAction={(id, c) => { if (id === "renew") router.push(`/vendors/contracts/${c.id}/renew`); setDrawerOpen(false); }}
        />
      )}

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Vendor Contract"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />
    </AtlvsAppLayout>
  );
}
