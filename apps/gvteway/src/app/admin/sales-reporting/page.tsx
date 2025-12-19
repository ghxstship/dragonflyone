'use client';

import { useState } from 'react';
import { Eye, Download } from 'lucide-react';
import { GvtewayAppLayout } from '@/components/app-layout';
import {
  ListPage,
  Badge,
  DetailDrawer,
  Grid,
  Body,
  Stack,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from '@ghxstship/ui';
import { createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';

import { useSalesReportingData, type SalesData } from '@/hooks/useSalesReporting';

const formatCurrency = (amount: number) => `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getLocationTypeBadge = (type: string) => {
  const variants: Record<string, 'solid' | 'outline' | 'ghost'> = {
    venue: 'solid',
    booth: 'outline',
    online: 'solid',
    box_office: 'outline',
  };
  return <Badge variant={variants[type] || 'outline'}>{type.replace('_', ' ').toUpperCase()}</Badge>;
};

const columns: ListPageColumn<SalesData>[] = [
  { key: 'location', label: 'Location', accessor: 'location', sortable: true },
  { key: 'location_type', label: 'Type', accessor: 'location_type', render: (v) => getLocationTypeBadge(String(v)) },
  { key: 'period', label: 'Period', accessor: 'period' },
  { key: 'transactions', label: 'Transactions', accessor: 'transactions', sortable: true },
  { key: 'gross_sales', label: 'Gross Sales', accessor: 'gross_sales', sortable: true, render: (v) => formatCurrency(Number(v)) },
  { key: 'refunds', label: 'Refunds', accessor: 'refunds', render: (v) => Number(v) > 0 ? <span className="text-error-600">{formatCurrency(Number(v))}</span> : '—' },
  { key: 'net_sales', label: 'Net Sales', accessor: 'net_sales', sortable: true, render: (v) => <strong className="text-success-600">{formatCurrency(Number(v))}</strong> },
  { key: 'avg_transaction', label: 'Avg Transaction', accessor: 'avg_transaction', render: (v) => formatCurrency(Number(v)) },
];

const filters: ListPageFilter[] = [
  { key: 'location_type', label: 'Type', options: [{ value: 'venue', label: 'Venue' }, { value: 'booth', label: 'Booth' }, { value: 'online', label: 'Online' }, { value: 'box_office', label: 'Box Office' }] },
  { key: 'location', label: 'Location', options: [{ value: 'Main Bar', label: 'Main Bar' }, { value: 'Merch Booth A', label: 'Merch Booth A' }, { value: 'Merch Booth B', label: 'Merch Booth B' }, { value: 'Online Store', label: 'Online Store' }, { value: 'Box Office', label: 'Box Office' }] },
];

export default function SalesReportingPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<SalesData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { sales, isLoading, error, refetch } = useSalesReportingData();

  const totalSales = sales.reduce((sum: number, s: SalesData) => sum + s.net_sales, 0);
  const totalTransactions = sales.reduce((sum: number, s: SalesData) => sum + s.transactions, 0);
  const totalRefunds = sales.reduce((sum: number, s: SalesData) => sum + s.refunds, 0);
  const avgTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  const rowActions: ListPageAction<SalesData>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedPeriod(r); setDrawerOpen(true); } },
    { id: 'export', label: 'Export', icon: <Download className="size-4" />, onClick: (r) => {
      const csv = ['Location', 'Type', 'Date', 'Period', 'Transactions', 'Gross Sales', 'Refunds', 'Net Sales'].join(',') + '\n' +
        [r.location, r.location_type, r.date, r.period, r.transactions, r.gross_sales, r.refunds, r.net_sales].join(',');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-${r.id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }},
  ];

  const stats = [
    { label: 'Total Sales', value: formatCurrency(totalSales) },
    { label: 'Transactions', value: totalTransactions.toLocaleString() },
    { label: 'Avg Transaction', value: formatCurrency(avgTransaction) },
    { label: 'Total Refunds', value: formatCurrency(totalRefunds) },
  ];

  const detailSections: DetailSection[] = selectedPeriod ? [
    { id: 'overview', title: 'Period Summary', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Location:</strong> {selectedPeriod.location}</Body>
        <Body size="sm"><strong>Type:</strong> {selectedPeriod.location_type.replace('_', ' ')}</Body>
        <Body size="sm"><strong>Date:</strong> {selectedPeriod.date}</Body>
        <Body size="sm"><strong>Period:</strong> {selectedPeriod.period}</Body>
        <Body size="sm"><strong>Transactions:</strong> {selectedPeriod.transactions}</Body>
        <Body size="sm"><strong>Gross Sales:</strong> {formatCurrency(selectedPeriod.gross_sales)}</Body>
        <Body size="sm"><strong>Refunds:</strong> {formatCurrency(selectedPeriod.refunds)}</Body>
        <Body size="sm"><strong>Net Sales:</strong> {formatCurrency(selectedPeriod.net_sales)}</Body>
        <Body size="sm"><strong>Avg Transaction:</strong> {formatCurrency(selectedPeriod.avg_transaction)}</Body>
      </Grid>
    )},
    { id: 'top_items', title: 'Top Items', content: (
      <Stack gap={0}>
        {selectedPeriod.top_items.map((item, idx) => (
          <Stack key={idx} direction="horizontal" className="justify-between border-b border-ink-200 py-2">
            <Body size="sm">{item.name} ({item.quantity} sold)</Body>
            <Body size="sm"><strong>{formatCurrency(item.revenue)}</strong></Body>
          </Stack>
        ))}
      </Stack>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<SalesData, 'id'>>({

    entityType: 'sales',

    requiredFields: ['Beer', 'Cocktails', 'Beer'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/sales', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('sales');


  return (
    <GvtewayAppLayout>
      <ListPage<SalesData>
        title="Sales Reporting"
        subtitle="Sales analytics by location and time period"
        data={sales}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={() => refetch()}
        searchPlaceholder="Search locations..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedPeriod(r); setDrawerOpen(true); }}
        entityType="sales"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['Beer', 'Cocktails', 'Beer', 'Wine', 'Hoodie', 'Poster', 'Cap']}
        onExport={createExportHandler({
          filename: "sales-report",
          getData: () => sales.map((s: SalesData) => ({
            id: s.id,
            location: s.location,
            location_type: s.location_type,
            date: s.date,
            period: s.period,
            transactions: s.transactions,
            gross_sales: s.gross_sales,
            refunds: s.refunds,
            net_sales: s.net_sales,
          })),
        })}
        stats={stats}
        emptyMessage="No sales data available"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/sales/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          }
        }}
        bulkActions={[
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
      />

      {selectedPeriod && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedPeriod}
          title={(s) => s.location}
          subtitle={(s) => `${s.date} • ${s.period}`}
          sections={detailSections}
          actions={[{ id: 'export', label: 'Export', icon: <Download className="size-4" /> }]}
          onAction={(id) => {
            if (id === 'export' && selectedPeriod) {
              const csv = ['Location', 'Type', 'Date', 'Period', 'Transactions', 'Gross Sales', 'Refunds', 'Net Sales'].join(',') + '\n' +
                [selectedPeriod.location, selectedPeriod.location_type, selectedPeriod.date, selectedPeriod.period, selectedPeriod.transactions, selectedPeriod.gross_sales, selectedPeriod.refunds, selectedPeriod.net_sales].join(',');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `sales-${selectedPeriod.id}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }
          }}
        />
      )}
    </GvtewayAppLayout>
  );
}
