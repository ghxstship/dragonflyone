"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Calendar } from "lucide-react";
import { AtlvsAppLayout } from "../../components/app-layout";
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
import { getBadgeVariant, createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";
import { useIPTrackingData, type IntellectualProperty } from "@/hooks/useIPTracking";

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
const getStatusVariant = getBadgeVariant;
const getTypeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "trademark": return "™";
    case "patent": return "⚙";
    case "copyright": return "©";
    case "trade_secret": return "🔒";
    default: return "📄";
  }
};

const columns: ListPageColumn<IntellectualProperty>[] = [
  { key: 'title', label: 'Asset', accessor: 'title', sortable: true },
  { key: 'ip_type', label: 'Type', accessor: (r) => `${getTypeIcon(r.ip_type)} ${r.ip_type}` },
  { key: 'registration_number', label: 'Registration #', accessor: (r) => r.registration_number || '—' },
  { key: 'jurisdiction', label: 'Jurisdiction', accessor: 'jurisdiction', sortable: true },
  { key: 'filing_date', label: 'Filed', accessor: (r) => r.filing_date ? formatDate(r.filing_date) : '—', sortable: true },
  { key: 'expiration_date', label: 'Expires', accessor: (r) => r.expiration_date ? formatDate(r.expiration_date) : 'N/A', sortable: true },
  { key: 'estimated_value', label: 'Value', accessor: (r) => r.estimated_value ? formatCurrency(r.estimated_value) : '—', sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'ip_type', label: 'Type', options: [{ value: 'trademark', label: 'Trademarks' }, { value: 'patent', label: 'Patents' }, { value: 'copyright', label: 'Copyrights' }, { value: 'trade_secret', label: 'Trade Secrets' }] },
  { key: 'status', label: 'Status', options: [{ value: 'registered', label: 'Registered' }, { value: 'pending', label: 'Pending' }, { value: 'filed', label: 'Filed' }, { value: 'expired', label: 'Expired' }] },
];

export default function IPTrackingPage() {
  const router = useRouter();
  const {
    assets,
    pendingCount,
    totalValue,
    isLoading: loading,
    error,
    refetch,
  } = useIPTrackingData();

  const [selectedAsset, setSelectedAsset] = useState<IntellectualProperty | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const rowActions: ListPageAction<IntellectualProperty>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedAsset(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/ip-tracking/${r.id}/edit`) },
  ];

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'ip-tracking',
    requiredFields: ['title', 'ip_type'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/intellectual-property', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
      await refetch();
    },
  });

  const importTemplates = getImportTemplates('ip-tracking').length > 0 
    ? getImportTemplates('ip-tracking') 
    : [{ id: 'default', name: 'IP Asset Import', mapping: { title: 'title', ip_type: 'ip_type', registration_number: 'registration_number', jurisdiction: 'jurisdiction', status: 'status' } }];

  const stats = [
    { label: 'Total IP Assets', value: assets.length },
    { label: 'Pending', value: pendingCount },
    { label: 'Registered', value: assets.filter(a => a.status === 'registered').length },
    { label: 'Estimated Value', value: formatCurrency(totalValue) },
  ];

  const detailSections: DetailSection[] = selectedAsset ? [
    { id: 'overview', title: 'IP Asset Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Title:</strong> {selectedAsset.title}</Body>
        <Body size="sm"><strong>Type:</strong> {getTypeIcon(selectedAsset.ip_type)} {selectedAsset.ip_type}</Body>
        <Body size="sm"><strong>Registration #:</strong> {selectedAsset.registration_number || '—'}</Body>
        <Body size="sm"><strong>Jurisdiction:</strong> {selectedAsset.jurisdiction}</Body>
        <Body size="sm"><strong>Owner:</strong> {selectedAsset.owner_entity}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedAsset.status}</Body>
        <Body size="sm"><strong>Filed:</strong> {selectedAsset.filing_date ? formatDate(selectedAsset.filing_date) : '—'}</Body>
        <Body size="sm"><strong>Registered:</strong> {selectedAsset.registration_date ? formatDate(selectedAsset.registration_date) : '—'}</Body>
        <Body size="sm"><strong>Expires:</strong> {selectedAsset.expiration_date ? formatDate(selectedAsset.expiration_date) : 'N/A'}</Body>
        <Body size="sm"><strong>Value:</strong> {selectedAsset.estimated_value ? formatCurrency(selectedAsset.estimated_value) : '—'}</Body>
        {selectedAsset.description && <Body size="sm" className="col-span-2"><strong>Description:</strong> {selectedAsset.description}</Body>}
      </Grid>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<IntellectualProperty>
        title="Intellectual Property"
        subtitle="Track trademarks, patents, copyrights, and trade secrets"
        data={assets}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error ? new Error(error) : undefined}
        onRetry={() => refetch()}
        searchPlaceholder="Search IP assets..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedAsset(r); setDrawerOpen(true); }}
        createLabel="Register New IP"
        onCreate={() => router.push('/ip-tracking/new')}
        entityType="ip-assets"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['title', 'ip_type', 'registration_number', 'jurisdiction', 'status']}
        onExport={createExportHandler({
          filename: "ip-assets",
          getData: () => assets.map(a => ({
            id: a.id,
            title: a.title,
            type: a.ip_type,
            status: a.status,
            filing_date: a.filing_date || '',
            expiration_date: a.expiration_date || '',
            owner: a.owner_entity || '',
          })),
        })}
        stats={stats}
        emptyMessage="No IP assets found"
        emptyAction={{ label: 'Register New IP', onClick: () => router.push('/ip-tracking/new') }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/ip-tracking/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            await refetch();
          } else if (action === 'archive') {
            await fetch('/api/ip-tracking/bulk-archive', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            await refetch();
          }
        }}
        bulkActions={[
          { id: 'archive', label: 'Archive Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      {selectedAsset && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedAsset}
          title={(a) => a.title}
          subtitle={(a) => `${getTypeIcon(a.ip_type)} ${a.ip_type} • ${a.jurisdiction}`}
          sections={detailSections}
          actions={[{ id: 'edit', label: 'Edit Asset', icon: <Pencil className="size-4" /> }, { id: 'renew', label: 'Renewal Calendar', icon: <Calendar className="size-4" /> }]}
          onAction={(id, a) => { if (id === 'edit') router.push(`/ip-tracking/${a.id}/edit`); setDrawerOpen(false); }}
        />
      )}
    </AtlvsAppLayout>
  );
}
