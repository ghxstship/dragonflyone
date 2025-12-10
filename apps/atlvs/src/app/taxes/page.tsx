"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Upload, BarChart3 } from "lucide-react";
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
import { useTaxesData, type TaxDocument } from "@/hooks/useTaxes";

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
  const {
    documents,
    pendingCount,
    totalLiability,
    totalPaid,
    isLoading: loading,
    error,
    refetch,
  } = useTaxesData(2024);

  const [selectedDoc, setSelectedDoc] = useState<TaxDocument | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const rowActions: ListPageAction<TaxDocument>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedDoc(r); setDrawerOpen(true); } },
    { id: 'file', label: 'File', icon: <Upload className="size-4" />, onClick: async (r) => { await fetch(`/api/taxes/${r.id}/file`, { method: 'POST' }); } },
  ];

  const stats = [
    { label: 'Total Documents', value: documents.length },
    { label: 'Pending Filings', value: pendingCount },
    { label: 'Total Liability', value: formatCurrency(totalLiability) },
    { label: 'Total Paid', value: formatCurrency(totalPaid) },
  ];

  const detailSections: DetailSection[] = selectedDoc ? [
    { id: 'overview', title: 'Tax Document Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Type:</strong> {selectedDoc.document_type}</Body>
        <Body size="sm"><strong>Entity:</strong> {selectedDoc.entity_name}</Body>
        <Body size="sm"><strong>Jurisdiction:</strong> {selectedDoc.jurisdiction}</Body>
        <Body size="sm"><strong>Tax Year:</strong> {selectedDoc.tax_year}</Body>
        <Body size="sm"><strong>Deadline:</strong> {formatDate(selectedDoc.filing_deadline)}</Body>
        <Body size="sm"><strong>Amount Due:</strong> {selectedDoc.amount_due ? formatCurrency(selectedDoc.amount_due) : '—'}</Body>
        <Body size="sm"><strong>Amount Paid:</strong> {selectedDoc.amount_paid ? formatCurrency(selectedDoc.amount_paid) : '—'}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedDoc.status}</Body>
        {selectedDoc.filed_date && <Body size="sm"><strong>Filed Date:</strong> {formatDate(selectedDoc.filed_date)}</Body>}
        {selectedDoc.confirmation_number && <Body size="sm"><strong>Confirmation:</strong> {selectedDoc.confirmation_number}</Body>}
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<TaxDocument, 'id'>>({

    entityType: 'taxes',

    requiredFields: ['document_type', 'entity_name', 'jurisdiction'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/taxes', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('taxes');


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
        onRetry={() => refetch()}
        searchPlaceholder="Search tax documents..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedDoc(r); setDrawerOpen(true); }}
        createLabel="Add Tax Document"
        onCreate={() => router.push('/taxes/new')}
        entityType="taxes"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['document_type', 'entity_name', 'jurisdiction', 'filing_deadline', 'amount_due', 'status', 'tax_year']}
        onExport={createExportHandler({
          filename: "tax-documents",
          getData: () => documents.map(d => ({
            id: d.id,
            title: d.title,
            type: d.document_type,
            tax_year: d.tax_year,
            status: d.status,
            due_date: d.due_date || '',
            amount: d.amount_due || 0,
          })),
        })}
        stats={stats}
        emptyMessage="No tax documents found"
        emptyAction={{ label: 'Add Tax Document', onClick: () => router.push('/taxes/new') }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/taxes/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            await refetch();
          }
        }}
        bulkActions={[
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
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
          actions={[{ id: 'file', label: 'File Tax', icon: <Upload className="size-4" /> }, { id: 'report', label: 'Generate Report', icon: <BarChart3 className="size-4" /> }]}
          onAction={(id, d) => { if (id === 'file') fetch(`/api/taxes/${d.id}/file`, { method: 'POST' }); setDrawerOpen(false); }}
        />
      )}
    </AtlvsAppLayout>
  );
}
