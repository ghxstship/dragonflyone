"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Upload } from "lucide-react";
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

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  client?: { id: string; name: string; email: string };
  opportunity_name: string;
  title: string;
  total_amount: number;
  status: string;
  valid_until: string;
  line_items_count?: number;
  created_at: string;
  [key: string]: unknown;
}

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<Quote>[] = [
  { key: 'quote_number', label: 'Quote ID', accessor: 'quote_number', sortable: true },
  { key: 'client', label: 'Client', accessor: (r) => r.client?.name || r.client_name, sortable: true },
  { key: 'project', label: 'Project', accessor: (r) => r.opportunity_name || r.title },
  { key: 'total_amount', label: 'Amount', accessor: (r) => formatCurrency(Number(r.total_amount) || 0), sortable: true },
  { key: 'valid_until', label: 'Valid Until', accessor: (r) => r.valid_until ? new Date(r.valid_until).toLocaleDateString() : '—', sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'draft', label: 'Draft' }, { value: 'sent', label: 'Sent' }, { value: 'viewed', label: 'Viewed' }, { value: 'negotiating', label: 'Negotiating' }, { value: 'accepted', label: 'Accepted' }, { value: 'declined', label: 'Declined' }, { value: 'converted', label: 'Converted' }] },
];

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quotes?include_line_items=false');
      if (!response.ok) throw new Error("Failed to fetch quotes");
      const data = await response.json();
      setQuotes(data.quotes || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  const acceptedCount = quotes.filter(q => q.status === 'accepted').length;
  const totalValue = quotes.reduce((sum, q) => sum + (Number(q.total_amount) || 0), 0);
  const winRate = quotes.length > 0 ? Math.round((acceptedCount / quotes.length) * 100) : 0;

  const rowActions: ListPageAction<Quote>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedQuote(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/quotes/${r.id}`) },
    { id: 'send', label: 'Send', icon: <Upload className="size-4" />, onClick: async (r) => { await fetch('/api/quotes', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quote_id: r.id, action: 'send' }) }); fetchQuotes(); } },
  ];

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Omit<Quote, 'id'>>({
    entityType: 'quotes',
    requiredFields: ['quote_number', 'client_name', 'total_amount'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
      fetchQuotes();
    },
  });

  const importTemplates = getImportTemplates('quotes').length > 0 
    ? getImportTemplates('quotes') 
    : [{ id: 'default', name: 'Quote Import', mapping: { quote_number: 'quote_number', client_name: 'client_name', total_amount: 'total_amount', status: 'status', valid_until: 'valid_until' } }];

  const stats = [
    { label: 'Total Quotes', value: quotes.length },
    { label: 'Accepted', value: acceptedCount },
    { label: 'Pipeline Value', value: formatCurrency(totalValue) },
    { label: 'Win Rate', value: `${winRate}%` },
  ];

  const detailSections: DetailSection[] = selectedQuote ? [
    { id: 'overview', title: 'Quote Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Quote #:</strong> {selectedQuote.quote_number}</Body>
        <Body size="sm"><strong>Client:</strong> {selectedQuote.client?.name || selectedQuote.client_name}</Body>
        <Body size="sm"><strong>Project:</strong> {selectedQuote.opportunity_name || selectedQuote.title}</Body>
        <Body size="sm"><strong>Amount:</strong> {formatCurrency(Number(selectedQuote.total_amount) || 0)}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedQuote.status}</Body>
        <Body size="sm"><strong>Valid Until:</strong> {selectedQuote.valid_until ? new Date(selectedQuote.valid_until).toLocaleDateString() : '—'}</Body>
        <Body size="sm"><strong>Line Items:</strong> {selectedQuote.line_items_count || 0}</Body>
        <Body size="sm"><strong>Created:</strong> {new Date(selectedQuote.created_at).toLocaleDateString()}</Body>
      </Grid>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Quote>
        title="Quote Management"
        subtitle="Create and manage client quotes"
        data={quotes}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error ? new Error(error) : undefined}
        onRetry={fetchQuotes}
        searchPlaceholder="Search quotes..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedQuote(r); setDrawerOpen(true); }}
        createLabel="Create Quote"
        onCreate={() => router.push('/quotes/new')}
        entityType="quotes"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['quote_number', 'client_name', 'total_amount', 'status', 'valid_until']}
        onExport={createExportHandler({
          filename: "quotes",
          getData: () => quotes.map(q => ({
            id: q.id,
            quote_number: q.quote_number,
            client_name: q.client_name,
            opportunity_name: q.opportunity_name,
            total_amount: q.total_amount,
            status: q.status,
            valid_until: q.valid_until,
          })),
        })}
        stats={stats}
        emptyMessage="No quotes found"
        emptyAction={{ label: 'Create Quote', onClick: () => router.push('/quotes/new') }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/quotes/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            fetchQuotes();
          } else if (action === 'send') {
            await fetch('/api/quotes/bulk-send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            fetchQuotes();
          }
        }}
        bulkActions={[
          { id: 'send', label: 'Send Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      {selectedQuote && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedQuote}
          title={(q) => q.quote_number}
          subtitle={(q) => `${q.client?.name || q.client_name} • ${formatCurrency(Number(q.total_amount) || 0)}`}
          sections={detailSections}
          actions={[{ id: 'edit', label: 'Edit Quote', icon: <Pencil className="size-4" /> }, { id: 'send', label: 'Send Quote', icon: <Upload className="size-4" /> }]}
          onAction={(id, q) => { if (id === 'edit') router.push(`/quotes/${q.id}`); setDrawerOpen(false); }}
        />
      )}
    </AtlvsAppLayout>
  );
}
