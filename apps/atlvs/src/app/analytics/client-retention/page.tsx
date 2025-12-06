'use client';

import { useState } from 'react';
import { Eye, Phone } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  ListPage, Badge, DetailDrawer, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from '@ghxstship/ui';
import { getBadgeVariant, createExportHandler } from '@ghxstship/config';

interface ClientRetention {
  id: string;
  clientName: string;
  segment: 'Enterprise' | 'Mid-Market' | 'SMB';
  firstDealDate: string;
  totalDeals: number;
  totalRevenue: number;
  lastDealDate: string;
  status: 'Active' | 'At Risk' | 'Churned' | 'New';
  healthScore: number;
  daysSinceLastDeal: number;
  avgDealSize: number;
  npsScore?: number;
  [key: string]: unknown;
}

const mockData: ClientRetention[] = [
  { id: 'CL-001', clientName: 'TechCorp Events', segment: 'Enterprise', firstDealDate: '2022-03-15', totalDeals: 12, totalRevenue: 450000, lastDealDate: '2024-11-10', status: 'Active', healthScore: 92, daysSinceLastDeal: 14, avgDealSize: 37500, npsScore: 9 },
  { id: 'CL-002', clientName: 'Festival Productions', segment: 'Enterprise', firstDealDate: '2021-06-20', totalDeals: 18, totalRevenue: 680000, lastDealDate: '2024-10-05', status: 'Active', healthScore: 88, daysSinceLastDeal: 50, avgDealSize: 37778, npsScore: 8 },
  { id: 'CL-003', clientName: 'Corporate Events Inc', segment: 'Mid-Market', firstDealDate: '2023-01-10', totalDeals: 6, totalRevenue: 125000, lastDealDate: '2024-08-15', status: 'At Risk', healthScore: 45, daysSinceLastDeal: 101, avgDealSize: 20833, npsScore: 6 },
  { id: 'CL-004', clientName: 'StartUp Ventures', segment: 'SMB', firstDealDate: '2024-02-01', totalDeals: 2, totalRevenue: 28000, lastDealDate: '2024-05-20', status: 'At Risk', healthScore: 35, daysSinceLastDeal: 188, avgDealSize: 14000 },
  { id: 'CL-005', clientName: 'Media Group LLC', segment: 'Mid-Market', firstDealDate: '2022-09-01', totalDeals: 8, totalRevenue: 195000, lastDealDate: '2024-11-20', status: 'Active', healthScore: 85, daysSinceLastDeal: 4, avgDealSize: 24375, npsScore: 8 },
  { id: 'CL-006', clientName: 'Local Business Co', segment: 'SMB', firstDealDate: '2023-06-15', totalDeals: 3, totalRevenue: 35000, lastDealDate: '2024-01-10', status: 'Churned', healthScore: 15, daysSinceLastDeal: 319, avgDealSize: 11667, npsScore: 4 },
  { id: 'CL-007', clientName: 'Innovation Labs', segment: 'Mid-Market', firstDealDate: '2024-10-01', totalDeals: 1, totalRevenue: 45000, lastDealDate: '2024-10-01', status: 'New', healthScore: 75, daysSinceLastDeal: 54, avgDealSize: 45000 },
];

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<ClientRetention>[] = [
  { key: 'clientName', label: 'Client', accessor: 'clientName', sortable: true },
  { key: 'segment', label: 'Segment', accessor: 'segment', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'totalRevenue', label: 'Total Revenue', accessor: (r) => formatCurrency(r.totalRevenue), sortable: true },
  { key: 'totalDeals', label: 'Deals', accessor: 'totalDeals', sortable: true },
  { key: 'lastDealDate', label: 'Last Deal', accessor: 'lastDealDate', sortable: true },
  { key: 'healthScore', label: 'Health', accessor: (r) => `${r.healthScore}%`, sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'Active', label: 'Active' }, { value: 'At Risk', label: 'At Risk' }, { value: 'Churned', label: 'Churned' }, { value: 'New', label: 'New' }] },
  { key: 'segment', label: 'Segment', options: [{ value: 'Enterprise', label: 'Enterprise' }, { value: 'Mid-Market', label: 'Mid-Market' }, { value: 'SMB', label: 'SMB' }] },
];

export default function ClientRetentionPage() {
  const [data] = useState<ClientRetention[]>(mockData);
  const [selected, setSelected] = useState<ClientRetention | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeClients = data.filter(c => c.status === 'Active').length;
  const atRiskClients = data.filter(c => c.status === 'At Risk').length;
  const churnedClients = data.filter(c => c.status === 'Churned').length;
  const retentionRate = ((activeClients / Math.max(activeClients + churnedClients, 1)) * 100).toFixed(1);
  const avgHealthScore = Math.round(data.reduce((sum, c) => sum + c.healthScore, 0) / data.length);

  const rowActions: ListPageAction<ClientRetention>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'contact', label: 'Schedule Call', icon: <Phone className="size-4" />, onClick: (r) => window.open(`mailto:${r.clientName.toLowerCase().replace(/\s/g, '.')}@example.com?subject=Follow-up%20Call`) },
  ];

  const stats = [
    { label: 'Retention Rate', value: `${retentionRate}%` },
    { label: 'Active Clients', value: activeClients },
    { label: 'At Risk', value: atRiskClients },
    { label: 'Avg Health Score', value: avgHealthScore },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Client Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Client:</strong> {selected.clientName}</Body>
        <Body size="sm"><strong>Segment:</strong> {selected.segment}</Body>
        <Body size="sm"><strong>Total Revenue:</strong> {formatCurrency(selected.totalRevenue)}</Body>
        <Body size="sm"><strong>Total Deals:</strong> {selected.totalDeals}</Body>
        <Body size="sm"><strong>Avg Deal Size:</strong> {formatCurrency(selected.avgDealSize)}</Body>
        <Body size="sm"><strong>Health Score:</strong> {selected.healthScore}%</Body>
        <Body size="sm"><strong>First Deal:</strong> {selected.firstDealDate}</Body>
        <Body size="sm"><strong>Last Deal:</strong> {selected.lastDealDate}</Body>
        <Body size="sm"><strong>Days Since Last Deal:</strong> {selected.daysSinceLastDeal}</Body>
        <Body size="sm"><strong>NPS Score:</strong> {selected.npsScore || 'N/A'}</Body>
        <Body size="sm"><strong>Status:</strong> {selected.status}</Body>
      </Grid>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<ClientRetention>
        title="Client Retention & Churn Analysis"
        subtitle="Monitor client health, identify churn risks, and improve retention"
        data={data}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search clients..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        entityType="client-retention"
        onExport={createExportHandler({
          filename: "client-retention",
          getData: () => data.map(c => ({
            id: c.id,
            clientName: c.clientName,
            segment: c.segment,
            status: c.status,
            healthScore: c.healthScore,
            totalDeals: c.totalDeals,
            totalRevenue: c.totalRevenue,
            lastDealDate: c.lastDealDate,
            daysSinceLastDeal: c.daysSinceLastDeal,
          })),
        })}
        stats={stats}
        emptyMessage="No client retention data found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/analytics/client-retention/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          }
        }}
        bulkActions={[
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.clientName}
          subtitle={(r) => `${r.segment} • ${r.status}`}
          sections={detailSections}
          actions={[{ id: 'contact', label: 'Schedule Call', icon: <Phone className="size-4" /> }, { id: 'email', label: 'Send Email', icon: <Phone className="size-4" /> }]}
          onAction={(id, r) => {
            if (id === 'contact') window.open(`mailto:${r.clientName.toLowerCase().replace(/\s/g, '.')}@example.com?subject=Follow-up%20Call`);
            if (id === 'email') window.open(`mailto:${r.clientName.toLowerCase().replace(/\s/g, '.')}@example.com`);
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
