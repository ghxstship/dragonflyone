"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  ListPage,
  Badge,
  DetailDrawer,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";
import { getBadgeVariant } from "@ghxstship/config";

interface IntellectualProperty {
  id: string;
  title: string;
  ip_type: string;
  registration_number?: string;
  filing_date?: string;
  registration_date?: string;
  expiration_date?: string;
  jurisdiction: string;
  status: string;
  owner_entity: string;
  description?: string;
  classes?: string[];
  renewal_date?: string;
  estimated_value?: number;
  [key: string]: unknown;
}

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
  const [assets, setAssets] = useState<IntellectualProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<IntellectualProperty | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchIPAssets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/intellectual-property');
      if (!response.ok) throw new Error("Failed to fetch IP assets");
      const data = await response.json();
      setAssets(data.assets || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIPAssets(); }, [fetchIPAssets]);

  const pendingCount = assets.filter(a => a.status === 'pending' || a.status === 'filed').length;
  const totalValue = assets.reduce((sum, a) => sum + (a.estimated_value || 0), 0);

  const rowActions: ListPageAction<IntellectualProperty>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedAsset(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (r) => router.push(`/ip-tracking/${r.id}/edit`) },
  ];

  const stats = [
    { label: 'Total IP Assets', value: assets.length },
    { label: 'Pending', value: pendingCount },
    { label: 'Registered', value: assets.filter(a => a.status === 'registered').length },
    { label: 'Estimated Value', value: formatCurrency(totalValue) },
  ];

  const detailSections: DetailSection[] = selectedAsset ? [
    { id: 'overview', title: 'IP Asset Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Title:</strong> {selectedAsset.title}</div>
        <div><strong>Type:</strong> {getTypeIcon(selectedAsset.ip_type)} {selectedAsset.ip_type}</div>
        <div><strong>Registration #:</strong> {selectedAsset.registration_number || '—'}</div>
        <div><strong>Jurisdiction:</strong> {selectedAsset.jurisdiction}</div>
        <div><strong>Owner:</strong> {selectedAsset.owner_entity}</div>
        <div><strong>Status:</strong> {selectedAsset.status}</div>
        <div><strong>Filed:</strong> {selectedAsset.filing_date ? formatDate(selectedAsset.filing_date) : '—'}</div>
        <div><strong>Registered:</strong> {selectedAsset.registration_date ? formatDate(selectedAsset.registration_date) : '—'}</div>
        <div><strong>Expires:</strong> {selectedAsset.expiration_date ? formatDate(selectedAsset.expiration_date) : 'N/A'}</div>
        <div><strong>Value:</strong> {selectedAsset.estimated_value ? formatCurrency(selectedAsset.estimated_value) : '—'}</div>
        {selectedAsset.description && <div className="col-span-2"><strong>Description:</strong> {selectedAsset.description}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<IntellectualProperty>
        title="Intellectual Property"
        subtitle="Track trademarks, patents, copyrights, and trade secrets"
        data={assets}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error ? new Error(error) : undefined}
        onRetry={fetchIPAssets}
        searchPlaceholder="Search IP assets..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedAsset(r); setDrawerOpen(true); }}
        createLabel="Register New IP"
        onCreate={() => router.push('/ip-tracking/new')}
        onExport={() => router.push('/ip-tracking/export')}
        stats={stats}
        emptyMessage="No IP assets found"
        emptyAction={{ label: 'Register New IP', onClick: () => router.push('/ip-tracking/new') }}
        header={<CreatorNavigationAuthenticated
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Ip Tracking' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        showFavorite
        showSettings />}
      />
      {selectedAsset && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedAsset}
          title={(a) => a.title}
          subtitle={(a) => `${getTypeIcon(a.ip_type)} ${a.ip_type} • ${a.jurisdiction}`}
          sections={detailSections}
          actions={[{ id: 'edit', label: 'Edit Asset', icon: '✏️' }, { id: 'renew', label: 'Renewal Calendar', icon: '📅' }]}
          onAction={(id, a) => { if (id === 'edit') router.push(`/ip-tracking/${a.id}/edit`); setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
