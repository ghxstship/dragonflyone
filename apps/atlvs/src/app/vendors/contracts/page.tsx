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
import { createExportHandler } from "@ghxstship/config";

interface VendorContract {
  id: string;
  vendorName: string;
  contractType: string;
  startDate: string;
  expiryDate: string;
  value: number;
  status: "Active" | "Expiring" | "Expired" | "Pending Renewal";
  daysUntilExpiry: number;
  autoRenew: boolean;
  category: string;
}

const mockContracts: VendorContract[] = [
  { id: "VC-001", vendorName: "Audio House Inc", contractType: "Master Services", startDate: "2023-01-01", expiryDate: "2025-01-01", value: 250000, status: "Expiring", daysUntilExpiry: 37, autoRenew: false, category: "Audio" },
  { id: "VC-002", vendorName: "Lighting Solutions", contractType: "Equipment Rental", startDate: "2024-03-01", expiryDate: "2025-03-01", value: 180000, status: "Active", daysUntilExpiry: 96, autoRenew: true, category: "Lighting" },
  { id: "VC-003", vendorName: "Stage Builders Co", contractType: "Preferred Vendor", startDate: "2023-06-01", expiryDate: "2024-11-30", value: 320000, status: "Expired", daysUntilExpiry: -5, autoRenew: false, category: "Staging" },
  { id: "VC-004", vendorName: "Video Tech Pro", contractType: "Master Services", startDate: "2024-01-01", expiryDate: "2025-12-31", value: 150000, status: "Active", daysUntilExpiry: 402, autoRenew: true, category: "Video" },
  { id: "VC-005", vendorName: "Rigging Experts", contractType: "Equipment Rental", startDate: "2024-06-01", expiryDate: "2024-12-15", value: 95000, status: "Expiring", daysUntilExpiry: 20, autoRenew: false, category: "Rigging" },
];

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
  const [contracts] = useState<VendorContract[]>(mockContracts);
  const [selectedContract, setSelectedContract] = useState<VendorContract | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const expiringCount = contracts.filter(c => c.status === "Expiring").length;
  const expiredCount = contracts.filter(c => c.status === "Expired").length;
  const totalValue = contracts.reduce((s, c) => s + c.value, 0);

  const rowActions: ListPageAction<VendorContract>[] = [
    { id: "view", label: "View Details", icon: "👁️", onClick: (r) => { setSelectedContract(r); setDrawerOpen(true); } },
    { id: "renew", label: "Renew", icon: "🔄", onClick: (r) => router.push(`/vendors/contracts/${r.id}/renew`) },
  ];

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
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
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
