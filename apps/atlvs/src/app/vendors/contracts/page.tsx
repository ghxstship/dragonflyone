"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AtlvsAppLayout } from "../../../components/app-layout";
import {
  ListPage,
  Badge,
  DetailDrawer,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";

import {
  DEMO_VENDOR_CONTRACTS_FULL,
  type DemoVendorContractFull as VendorContract,
} from "../../../lib/demo-data";

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

export default function VendorContractsPage() {
  const router = useRouter();
  const [contracts] = useState<VendorContract[]>(DEMO_VENDOR_CONTRACTS_FULL);
  const [selectedContract, setSelectedContract] = useState<VendorContract | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const expiringCount = contracts.filter(c => c.status === "Expiring").length;
  const expiredCount = contracts.filter(c => c.status === "Expired").length;
  const totalValue = contracts.reduce((s, c) => s + c.value, 0);

  const rowActions: ListPageAction<VendorContract>[] = [
    { id: "view", label: "View Details", icon: "👁️", onClick: (r) => { setSelectedContract(r); setDrawerOpen(true); } },
    { id: "renew", label: "Renew", icon: "🔄", onClick: (r) => router.push(`/vendors/contracts/${r.id}/renew`) },
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
      <Grid cols={2} gap={4}>
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
        loading={false}
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
          actions={[{ id: "renew", label: "Initiate Renewal", icon: "🔄" }]}
          onAction={(id, c) => { if (id === "renew") router.push(`/vendors/contracts/${c.id}/renew`); setDrawerOpen(false); }}
        />
      )}
    </AtlvsAppLayout>
  );
}
