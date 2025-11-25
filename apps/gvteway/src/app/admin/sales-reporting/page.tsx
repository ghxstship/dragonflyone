'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ListPage,
  Badge,
  DetailDrawer,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from '@ghxstship/ui';

interface SalesData {
  id: string;
  location: string;
  location_type: 'venue' | 'booth' | 'online' | 'box_office';
  date: string;
  period: string;
  transactions: number;
  gross_sales: number;
  refunds: number;
  net_sales: number;
  avg_transaction: number;
  top_items: { name: string; quantity: number; revenue: number }[];
  [key: string]: unknown;
}

const mockSalesData: SalesData[] = [
  { id: 'SD-001', location: 'Main Bar', location_type: 'venue', date: '2024-11-24', period: '14:00-15:00', transactions: 89, gross_sales: 2450.50, refunds: 45.00, net_sales: 2405.50, avg_transaction: 27.03, top_items: [{ name: 'Beer', quantity: 156, revenue: 1248.00 }, { name: 'Cocktails', quantity: 67, revenue: 871.00 }] },
  { id: 'SD-002', location: 'Main Bar', location_type: 'venue', date: '2024-11-24', period: '13:00-14:00', transactions: 72, gross_sales: 1980.25, refunds: 0, net_sales: 1980.25, avg_transaction: 27.50, top_items: [{ name: 'Beer', quantity: 134, revenue: 1072.00 }, { name: 'Wine', quantity: 45, revenue: 585.00 }] },
  { id: 'SD-003', location: 'Merch Booth A', location_type: 'booth', date: '2024-11-24', period: '14:00-15:00', transactions: 45, gross_sales: 3825.00, refunds: 85.00, net_sales: 3740.00, avg_transaction: 83.11, top_items: [{ name: 'Tour T-Shirt', quantity: 32, revenue: 1440.00 }, { name: 'Hoodie', quantity: 18, revenue: 1530.00 }] },
  { id: 'SD-004', location: 'Merch Booth B', location_type: 'booth', date: '2024-11-24', period: '14:00-15:00', transactions: 38, gross_sales: 2890.00, refunds: 0, net_sales: 2890.00, avg_transaction: 76.05, top_items: [{ name: 'Poster', quantity: 45, revenue: 1125.00 }, { name: 'Cap', quantity: 28, revenue: 980.00 }] },
  { id: 'SD-005', location: 'Online Store', location_type: 'online', date: '2024-11-24', period: '14:00-15:00', transactions: 156, gross_sales: 8945.00, refunds: 250.00, net_sales: 8695.00, avg_transaction: 55.74, top_items: [{ name: 'Vinyl Album', quantity: 45, revenue: 1575.00 }, { name: 'Bundle Pack', quantity: 28, revenue: 2520.00 }] },
  { id: 'SD-006', location: 'Box Office', location_type: 'box_office', date: '2024-11-24', period: '14:00-15:00', transactions: 234, gross_sales: 18720.00, refunds: 150.00, net_sales: 18570.00, avg_transaction: 79.36, top_items: [{ name: 'GA Ticket', quantity: 189, revenue: 14175.00 }, { name: 'VIP Ticket', quantity: 45, revenue: 4500.00 }] },
];

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
  { key: 'refunds', label: 'Refunds', accessor: 'refunds', render: (v) => Number(v) > 0 ? <span style={{ color: 'red' }}>{formatCurrency(Number(v))}</span> : '—' },
  { key: 'net_sales', label: 'Net Sales', accessor: 'net_sales', sortable: true, render: (v) => <strong style={{ color: 'green' }}>{formatCurrency(Number(v))}</strong> },
  { key: 'avg_transaction', label: 'Avg Transaction', accessor: 'avg_transaction', render: (v) => formatCurrency(Number(v)) },
];

const filters: ListPageFilter[] = [
  { key: 'location_type', label: 'Type', options: [{ value: 'venue', label: 'Venue' }, { value: 'booth', label: 'Booth' }, { value: 'online', label: 'Online' }, { value: 'box_office', label: 'Box Office' }] },
  { key: 'location', label: 'Location', options: [{ value: 'Main Bar', label: 'Main Bar' }, { value: 'Merch Booth A', label: 'Merch Booth A' }, { value: 'Merch Booth B', label: 'Merch Booth B' }, { value: 'Online Store', label: 'Online Store' }, { value: 'Box Office', label: 'Box Office' }] },
];

export default function SalesReportingPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<SalesData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalSales = mockSalesData.reduce((sum, s) => sum + s.net_sales, 0);
  const totalTransactions = mockSalesData.reduce((sum, s) => sum + s.transactions, 0);
  const totalRefunds = mockSalesData.reduce((sum, s) => sum + s.refunds, 0);
  const avgTransaction = totalSales / totalTransactions;

  const rowActions: ListPageAction<SalesData>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedPeriod(r); setDrawerOpen(true); } },
    { id: 'export', label: 'Export', icon: '⬇️', onClick: (r) => console.log('Export', r.id) },
  ];

  const stats = [
    { label: 'Total Sales', value: formatCurrency(totalSales) },
    { label: 'Transactions', value: totalTransactions.toLocaleString() },
    { label: 'Avg Transaction', value: formatCurrency(avgTransaction) },
    { label: 'Total Refunds', value: formatCurrency(totalRefunds) },
  ];

  const detailSections: DetailSection[] = selectedPeriod ? [
    { id: 'overview', title: 'Period Summary', content: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div><strong>Location:</strong> {selectedPeriod.location}</div>
        <div><strong>Type:</strong> {selectedPeriod.location_type.replace('_', ' ')}</div>
        <div><strong>Date:</strong> {selectedPeriod.date}</div>
        <div><strong>Period:</strong> {selectedPeriod.period}</div>
        <div><strong>Transactions:</strong> {selectedPeriod.transactions}</div>
        <div><strong>Gross Sales:</strong> {formatCurrency(selectedPeriod.gross_sales)}</div>
        <div><strong>Refunds:</strong> {formatCurrency(selectedPeriod.refunds)}</div>
        <div><strong>Net Sales:</strong> {formatCurrency(selectedPeriod.net_sales)}</div>
        <div><strong>Avg Transaction:</strong> {formatCurrency(selectedPeriod.avg_transaction)}</div>
      </div>
    )},
    { id: 'top_items', title: 'Top Items', content: (
      <div>
        {selectedPeriod.top_items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
            <span>{item.name} ({item.quantity} sold)</span>
            <strong>{formatCurrency(item.revenue)}</strong>
          </div>
        ))}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<SalesData>
        title="Sales Reporting"
        subtitle="Sales analytics by location and time period"
        data={mockSalesData}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search locations..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedPeriod(r); setDrawerOpen(true); }}
        onExport={() => console.log('Export all')}
        stats={stats}
        emptyMessage="No sales data available"
      />

      {selectedPeriod && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedPeriod}
          title={(s) => s.location}
          subtitle={(s) => `${s.date} • ${s.period}`}
          sections={detailSections}
          actions={[{ id: 'export', label: 'Export', icon: '⬇️' }]}
          onAction={(id) => id === 'export' && console.log('Export period')}
        />
      )}
    </>
  );
}
