"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AtlvsAppLayout } from "../../../components/app-layout";
import {
  ListPage,
  Badge,
  DetailDrawer,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";

interface RateItem {
  id: string;
  description: string;
  unit: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate?: number;
}

interface RateCard {
  id: string;
  vendorName: string;
  vendorId: string;
  category: string;
  effectiveDate: string;
  expirationDate: string;
  status: "Active" | "Expired" | "Pending";
  items: RateItem[];
  notes?: string;
}

const mockRateCards: RateCard[] = [
  {
    id: "RC-001",
    vendorName: "Pro Audio Solutions",
    vendorId: "VND-001",
    category: "Audio",
    effectiveDate: "2024-01-01",
    expirationDate: "2024-12-31",
    status: "Active",
    items: [
      { id: "RI-001", description: "L-Acoustics K2 Line Array (per box)", unit: "Day", dailyRate: 450, weeklyRate: 1800, monthlyRate: 5400 },
      { id: "RI-002", description: "L-Acoustics SB28 Subwoofer", unit: "Day", dailyRate: 200, weeklyRate: 800, monthlyRate: 2400 },
      { id: "RI-003", description: "DiGiCo SD12 Console", unit: "Day", dailyRate: 800, weeklyRate: 3200, monthlyRate: 9600 },
    ],
    notes: "Volume discounts available for orders over $10,000",
  },
  {
    id: "RC-002",
    vendorName: "Elite Lighting Co",
    vendorId: "VND-002",
    category: "Lighting",
    effectiveDate: "2024-01-01",
    expirationDate: "2024-12-31",
    status: "Active",
    items: [
      { id: "RI-005", description: "Clay Paky Sharpy Plus", unit: "Day", dailyRate: 125, weeklyRate: 500, monthlyRate: 1500 },
      { id: "RI-006", description: "Robe MegaPointe", unit: "Day", dailyRate: 150, weeklyRate: 600, monthlyRate: 1800 },
    ],
  },
  {
    id: "RC-003",
    vendorName: "Stage Systems Inc",
    vendorId: "VND-003",
    category: "Staging",
    effectiveDate: "2024-06-01",
    expirationDate: "2025-05-31",
    status: "Active",
    items: [
      { id: "RI-008", description: "40x60 Stage Deck", unit: "Day", dailyRate: 2500, weeklyRate: 10000 },
      { id: "RI-009", description: "Roof System (40x40)", unit: "Day", dailyRate: 3500, weeklyRate: 14000 },
    ],
  },
];

const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
  switch (status) {
    case "Active": return "solid";
    case "Pending": return "outline";
    case "Expired": return "ghost";
    default: return "outline";
  }
};

const columns: ListPageColumn<RateCard>[] = [
  { key: "vendorName", label: "Vendor", accessor: "vendorName", sortable: true },
  { key: "category", label: "Category", accessor: "category", render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: "items", label: "Line Items", accessor: (r) => `${r.items.length} items` },
  { key: "effectiveDate", label: "Effective", accessor: "effectiveDate", sortable: true },
  { key: "expirationDate", label: "Expires", accessor: "expirationDate", sortable: true },
  { key: "status", label: "Status", accessor: "status", sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: "status", label: "Status", options: [
    { value: "Active", label: "Active" },
    { value: "Pending", label: "Pending" },
    { value: "Expired", label: "Expired" },
  ]},
  { key: "category", label: "Category", options: [
    { value: "Audio", label: "Audio" },
    { value: "Lighting", label: "Lighting" },
    { value: "Staging", label: "Staging" },
    { value: "Video", label: "Video" },
  ]},
];

export default function RateCardsPage() {
  const router = useRouter();
  const [rateCards] = useState<RateCard[]>(mockRateCards);
  const [selectedRateCard, setSelectedRateCard] = useState<RateCard | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeCards = rateCards.filter(rc => rc.status === "Active").length;
  const totalItems = rateCards.reduce((sum, rc) => sum + rc.items.length, 0);

  const rowActions: ListPageAction<RateCard>[] = [
    { id: "view", label: "View Details", icon: "👁️", onClick: (r) => { setSelectedRateCard(r); setDrawerOpen(true); } },
    { id: "quote", label: "Create Quote", icon: "📝", onClick: (r) => router.push(`/vendors/rate-cards/${r.id}/quote`) },
  ];

  const stats = [
    { label: "Total Rate Cards", value: rateCards.length },
    { label: "Active", value: activeCards },
    { label: "Categories", value: 3 },
    { label: "Line Items", value: totalItems },
  ];

  const detailSections: DetailSection[] = selectedRateCard ? [
    { id: "overview", title: "Rate Card Details", content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Vendor:</strong> {selectedRateCard.vendorName}</div>
        <div><strong>Category:</strong> {selectedRateCard.category}</div>
        <div><strong>Status:</strong> {selectedRateCard.status}</div>
        <div><strong>Effective:</strong> {selectedRateCard.effectiveDate}</div>
        <div><strong>Expires:</strong> {selectedRateCard.expirationDate}</div>
        {selectedRateCard.notes && <div className="col-span-2"><strong>Notes:</strong> {selectedRateCard.notes}</div>}
      </div>
    )},
    { id: "items", title: `Line Items (${selectedRateCard.items.length})`, content: (
      <div className="space-y-2">
        {selectedRateCard.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between border-b border-grey-200 py-2">
            <span>{item.description}</span>
            <span className="font-mono">${item.dailyRate}/day</span>
          </div>
        ))}
      </div>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<RateCard>
        title="Rate Cards & Pricing"
        subtitle="Vendor rate cards and pricing information"
        data={rateCards}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search rate cards..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedRateCard(r); setDrawerOpen(true); }}
        createLabel="Request New Rate Card"
        onCreate={() => router.push("/vendors/rate-cards/request")}
        onExport={() => router.push("/vendors/rate-cards/export")}
        stats={stats}
        emptyMessage="No rate cards found"
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Vendors', href: '/vendors' }, { label: 'Rate Cards' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        showFavorite
        showSettings
      />

      {selectedRateCard && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedRateCard}
          title={(r) => r.vendorName}
          subtitle={(r) => `${r.category} • ${r.items.length} items`}
          sections={detailSections}
          actions={[{ id: "quote", label: "Create Quote", icon: "📝" }, { id: "download", label: "Download PDF", icon: "📄" }]}
          onAction={(id, r) => { if (id === "quote") router.push(`/vendors/rate-cards/${r.id}/quote`); setDrawerOpen(false); }}
        />
      )}
    </AtlvsAppLayout>
  );
}
