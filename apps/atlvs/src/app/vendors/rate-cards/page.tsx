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
  Stack,
  Body,
  useNotifications,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
  type FormFieldConfig,
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";
import { Eye, FileText, Download } from "lucide-react";
import { useRateCards, type RateCard as APIRateCard } from "../../../hooks/useRateCards";
import {
  DEMO_RATE_CARDS_FULL,
  type DemoRateCardFull as DemoRateCard,
} from '../../../lib/demo-data';

// Unified display type
interface RateCard {
  id: string;
  vendorName: string;
  category: string;
  effectiveDate: string;
  expirationDate: string;
  status: string;
  notes?: string;
  items: { id: string; description: string; dailyRate: number }[];
}

// Normalize API rate card to display format
function normalizeRateCard(rc: APIRateCard | DemoRateCard): RateCard {
  if ('vendor_name' in rc) {
    // API rate card
    return {
      id: rc.id,
      vendorName: rc.vendor_name || 'Unknown',
      category: rc.category,
      effectiveDate: rc.effective_date,
      expirationDate: rc.expiration_date,
      status: rc.status.charAt(0).toUpperCase() + rc.status.slice(1),
      notes: rc.notes,
      items: rc.items.map(item => ({
        id: item.id,
        description: item.description,
        dailyRate: item.daily_rate,
      })),
    };
  }
  // Demo rate card
  return rc as RateCard;
}

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

const formFields: FormFieldConfig[] = [
  { name: 'vendor_id', label: 'Vendor', type: 'text', required: true },
  { name: 'category', label: 'Category', type: 'select', required: true, options: [
    { value: 'Audio', label: 'Audio' },
    { value: 'Lighting', label: 'Lighting' },
    { value: 'Staging', label: 'Staging' },
    { value: 'Video', label: 'Video' },
  ]},
  { name: 'effective_date', label: 'Effective Date', type: 'date', required: true },
  { name: 'expiration_date', label: 'Expiration Date', type: 'date', required: true },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

export default function RateCardsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { data: apiRateCards, isLoading, error, refetch } = useRateCards();
  
  // Use API data if available, fallback to demo data
  const rawRateCards = apiRateCards && apiRateCards.length > 0 ? apiRateCards : DEMO_RATE_CARDS_FULL;
  const rateCards: RateCard[] = rawRateCards.map(normalizeRateCard);
  
  const [selectedRateCard, setSelectedRateCard] = useState<RateCard | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const activeCards = rateCards.filter(rc => rc.status === "Active").length;
  const totalItems = rateCards.reduce((sum, rc) => sum + rc.items.length, 0);

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/vendors/rate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, items: [] }),
      });
      if (!response.ok) throw new Error('Failed to create rate card');
      setCreateModalOpen(false);
      addNotification({ type: 'success', title: 'Rate Card Created', message: 'Rate card has been created successfully.' });
      refetch();
    } catch (err) {
      addNotification({ type: 'error', title: 'Failed to Create Rate Card', message: err instanceof Error ? err.message : 'An unexpected error occurred' });
    }
  };

  const rowActions: ListPageAction<RateCard>[] = [
    { id: "view", label: "View Details", icon: <Eye className="size-4" />, onClick: (r) => { setSelectedRateCard(r); setDrawerOpen(true); } },
    { id: "quote", label: "Create Quote", icon: <FileText className="size-4" />, onClick: (r) => router.push(`/vendors/rate-cards/${r.id}/quote`) },
  ];

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'rate-cards',
    requiredFields: ['vendorName', 'category'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/vendors/rate-cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
    },
  });

  const importTemplates = getImportTemplates('rate-cards').length > 0 
    ? getImportTemplates('rate-cards') 
    : [{ id: 'default', name: 'Rate Card Import', mapping: { vendorName: 'vendorName', category: 'category', effectiveDate: 'effectiveDate', expirationDate: 'expirationDate' } }];

  const stats = [
    { label: "Total Rate Cards", value: rateCards.length },
    { label: "Active", value: activeCards },
    { label: "Categories", value: 3 },
    { label: "Line Items", value: totalItems },
  ];

  const detailSections: DetailSection[] = selectedRateCard ? [
    { id: "overview", title: "Rate Card Details", content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Vendor:</strong> {selectedRateCard.vendorName}</Body>
        <Body size="sm"><strong>Category:</strong> {selectedRateCard.category}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedRateCard.status}</Body>
        <Body size="sm"><strong>Effective:</strong> {selectedRateCard.effectiveDate}</Body>
        <Body size="sm"><strong>Expires:</strong> {selectedRateCard.expirationDate}</Body>
        {selectedRateCard.notes && <Body size="sm" className="col-span-2"><strong>Notes:</strong> {selectedRateCard.notes}</Body>}
      </Grid>
    )},
    { id: "items", title: `Line Items (${selectedRateCard.items.length})`, content: (
      <Stack gap={2}>
        {selectedRateCard.items.map((item) => (
          <Stack key={item.id} direction="horizontal" className="items-center justify-between border-b border-grey-200 py-2">
            <Body size="sm">{item.description}</Body>
            <Body size="sm" className="font-mono">${item.dailyRate}/day</Body>
          </Stack>
        ))}
      </Stack>
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
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search rate cards..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedRateCard(r); setDrawerOpen(true); }}
        createLabel="Request New Rate Card"
        onCreate={() => setCreateModalOpen(true)}
        entityType="rate-cards"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['vendorName', 'category', 'effectiveDate', 'expirationDate']}
        onExport={createExportHandler({
          filename: "rate-cards",
          getData: () => rateCards.map(r => ({
            id: r.id,
            vendorName: r.vendorName,
            category: r.category,
            effectiveDate: r.effectiveDate,
            expiryDate: r.expirationDate,
            status: r.status,
            itemCount: r.items?.length || 0,
          })),
        })}
        stats={stats}
        emptyMessage="No rate cards found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/vendors/rate-cards/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          } else if (action === 'archive') {
            await fetch('/api/vendors/rate-cards/bulk-archive', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          }
        }}
        bulkActions={[
          { id: 'archive', label: 'Archive Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
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
          actions={[{ id: "quote", label: "Create Quote", icon: <FileText className="size-4" /> }, { id: "download", label: "Download PDF", icon: <Download className="size-4" /> }]}
          onAction={(id, r) => { if (id === "quote") router.push(`/vendors/rate-cards/${r.id}/quote`); setDrawerOpen(false); }}
        />
      )}

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Rate Card"
        fields={formFields}
        onSubmit={handleCreate}
        size="md"
      />
    </AtlvsAppLayout>
  );
}
