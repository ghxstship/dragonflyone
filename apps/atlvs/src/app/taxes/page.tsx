"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, Upload } from "lucide-react";
import { AtlvsAppLayout } from "../../components/app-layout";
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

interface TaxDocument {
  id: string;
  document_type: string;
  tax_year: number;
  entity_name: string;
  jurisdiction: string;
  filing_deadline: string;
  status: string;
  amount_due?: number;
  amount_paid?: number;
  filed_date?: string;
  confirmation_number?: string;
  [key: string]: unknown;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<TaxDocument>[] = [
  { key: 'document_type', label: 'Document Type', accessor: 'document_type', sortable: true },
  { key: 'entity_name', label: 'Entity', accessor: 'entity_name', sortable: true },
  { key: 'jurisdiction', label: 'Jurisdiction', accessor: 'jurisdiction' },
  { key: 'filing_deadline', label: 'Deadline', accessor: (r) => formatDate(r.filing_deadline), sortable: true },
  { key: 'amount_due', label: 'Amount Due', accessor: (r) => r.amount_due ? formatCurrency(r.amount_due) : '—', sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'tax_year', label: 'Tax Year', options: [{ value: '2024', label: '2024' }, { value: '2023', label: '2023' }, { value: '2022', label: '2022' }] },
  { key: 'status', label: 'Status', options: [{ value: 'pending', label: 'Pending' }, { value: 'filed', label: 'Filed' }, { value: 'overdue', label: 'Overdue' }] },
];

export default function TaxesPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<TaxDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<TaxDocument | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchTaxDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/taxes?year=2024');
      if (!response.ok) throw new Error("Failed to fetch tax documents");
      const data = await response.json();
      setDocuments(data.documents || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTaxDocuments(); }, [fetchTaxDocuments]);

  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const totalLiability = documents.reduce((sum, d) => sum + (d.amount_due || 0), 0);

  const rowActions: ListPageAction<TaxDocument>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedDoc(r); setDrawerOpen(true); } },
    { id: 'file', label: 'File', icon: <Upload className="size-4" />, onClick: async (r) => { await fetch(`/api/taxes/${r.id}/file`, { method: 'POST' }); fetchTaxDocuments(); } },
  ];

  const stats = [
    { label: 'Total Documents', value: documents.length },
    { label: 'Pending Filings', value: pendingCount },
    { label: 'Total Liability', value: formatCurrency(totalLiability) },
    { label: 'Filed', value: documents.filter(d => d.status === 'filed').length },
  ];

  const detailSections: DetailSection[] = selectedDoc ? [
    { id: 'overview', title: 'Tax Document Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Type:</strong> {selectedDoc.document_type}</div>
        <div><strong>Entity:</strong> {selectedDoc.entity_name}</div>
        <div><strong>Jurisdiction:</strong> {selectedDoc.jurisdiction}</div>
        <div><strong>Tax Year:</strong> {selectedDoc.tax_year}</div>
        <div><strong>Deadline:</strong> {formatDate(selectedDoc.filing_deadline)}</div>
        <div><strong>Amount Due:</strong> {selectedDoc.amount_due ? formatCurrency(selectedDoc.amount_due) : '—'}</div>
        <div><strong>Amount Paid:</strong> {selectedDoc.amount_paid ? formatCurrency(selectedDoc.amount_paid) : '—'}</div>
        <div><strong>Status:</strong> {selectedDoc.status}</div>
        {selectedDoc.filed_date && <div><strong>Filed Date:</strong> {formatDate(selectedDoc.filed_date)}</div>}
        {selectedDoc.confirmation_number && <div><strong>Confirmation:</strong> {selectedDoc.confirmation_number}</div>}
      </div>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<TaxDocument>
        title="Tax Documentation"
        subtitle="Manage tax filings, track deadlines, and maintain compliance"
        data={documents}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error ? new Error(error) : undefined}
        onRetry={fetchTaxDocuments}
        searchPlaceholder="Search tax documents..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedDoc(r); setDrawerOpen(true); }}
        createLabel="Add Tax Document"
        onCreate={() => router.push('/taxes/new')}
        onExport={() => router.push('/taxes/annual-report')}
        stats={stats}
        emptyMessage="No tax documents found"
        emptyAction={{ label: 'Add Tax Document', onClick: () => router.push('/taxes/new') }}
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Taxes' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        showFavorite
        showSettings
      />
      {selectedDoc && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedDoc}
          title={(d) => d.document_type}
          subtitle={(d) => `${d.entity_name} • ${d.jurisdiction}`}
          sections={detailSections}
          actions={[{ id: 'file', label: 'File Tax', icon: '📤' }, { id: 'report', label: 'Generate Report', icon: '📊' }]}
          onAction={(id, d) => { if (id === 'file') fetch(`/api/taxes/${d.id}/file`, { method: 'POST' }); setDrawerOpen(false); }}
        />
      )}
    </AtlvsAppLayout>
  );
}
