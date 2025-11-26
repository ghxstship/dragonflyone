'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../../components/navigation';
import {
  ListPage, Badge, DetailDrawer,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from '@ghxstship/ui';
import { getBadgeVariant } from '@ghxstship/config';

interface UnionRule {
  id: string;
  union: string;
  category: string;
  rule: string;
  description: string;
  effectiveDate: string;
  status: 'Active' | 'Pending' | 'Expired';
  penaltyType?: string;
  penaltyAmount?: number;
  [key: string]: unknown;
}

const mockData: UnionRule[] = [
  { id: 'RULE-001', union: 'IATSE Local 1', category: 'Work Hours', rule: 'Maximum 10-hour call', description: 'Standard work call cannot exceed 10 hours without meal penalty', effectiveDate: '2024-01-01', status: 'Active', penaltyType: 'Hourly', penaltyAmount: 75 },
  { id: 'RULE-002', union: 'IATSE Local 1', category: 'Meal Breaks', rule: '6-hour meal break', description: 'Meal break required within 6 hours of call time', effectiveDate: '2024-01-01', status: 'Active', penaltyType: 'Per Violation', penaltyAmount: 50 },
  { id: 'RULE-003', union: 'IATSE Local 1', category: 'Turnaround', rule: '10-hour turnaround', description: 'Minimum 10 hours between end of call and next call', effectiveDate: '2024-01-01', status: 'Active', penaltyType: 'Hourly', penaltyAmount: 100 },
  { id: 'RULE-004', union: 'IBEW Local 3', category: 'Overtime', rule: 'Double time after 12', description: 'Double time rate applies after 12 hours worked', effectiveDate: '2024-01-01', status: 'Active', penaltyType: 'Rate Multiplier' },
  { id: 'RULE-005', union: 'Teamsters Local 817', category: 'Travel', rule: 'Portal-to-portal pay', description: 'Pay begins when leaving designated call point', effectiveDate: '2024-01-01', status: 'Active' },
];

const getStatusVariant = (status: string): 'solid' | 'outline' | 'ghost' => {
  switch (status) { case 'Active': return 'solid'; case 'Pending': return 'outline'; case 'Expired': return 'ghost'; default: return 'ghost'; }
};

const columns: ListPageColumn<UnionRule>[] = [
  { key: 'union', label: 'Union', accessor: 'union', sortable: true, render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'rule', label: 'Rule', accessor: 'rule', sortable: true },
  { key: 'description', label: 'Description', accessor: 'description' },
  { key: 'penalty', label: 'Penalty', accessor: (r) => r.penaltyAmount ? `$${r.penaltyAmount} (${r.penaltyType})` : '-' },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'union', label: 'Union', options: [{ value: 'IATSE Local 1', label: 'IATSE Local 1' }, { value: 'IBEW Local 3', label: 'IBEW Local 3' }, { value: 'Teamsters Local 817', label: 'Teamsters Local 817' }] },
  { key: 'category', label: 'Category', options: [{ value: 'Work Hours', label: 'Work Hours' }, { value: 'Meal Breaks', label: 'Meal Breaks' }, { value: 'Turnaround', label: 'Turnaround' }, { value: 'Overtime', label: 'Overtime' }, { value: 'Travel', label: 'Travel' }] },
  { key: 'status', label: 'Status', options: [{ value: 'Active', label: 'Active' }, { value: 'Pending', label: 'Pending' }, { value: 'Expired', label: 'Expired' }] },
];

export default function UnionRulesPage() {
  const router = useRouter();
  const [data] = useState<UnionRule[]>(mockData);
  const [selected, setSelected] = useState<UnionRule | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeRules = data.filter((r) => r.status === 'Active').length;
  const totalPenalties = data.filter((r) => r.penaltyAmount).reduce((sum, r) => sum + (r.penaltyAmount || 0), 0);

  const rowActions: ListPageAction<UnionRule>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit Rule', icon: '✏️', onClick: (r) => console.log('Edit rule', r.id) },
  ];

  const stats = [
    { label: 'Active Rules', value: activeRules },
    { label: 'Total Rules', value: data.length },
    { label: 'Unions', value: new Set(data.map(r => r.union)).size },
    { label: 'Total Penalties', value: `$${totalPenalties}` },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Rule Details', content: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div><strong>Union:</strong> {selected.union}</div>
        <div><strong>Category:</strong> {selected.category}</div>
        <div><strong>Rule:</strong> {selected.rule}</div>
        <div><strong>Status:</strong> {selected.status}</div>
        <div><strong>Effective Date:</strong> {selected.effectiveDate}</div>
        <div><strong>Penalty:</strong> {selected.penaltyAmount ? `$${selected.penaltyAmount} (${selected.penaltyType})` : 'N/A'}</div>
        <div style={{ gridColumn: 'span 2' }}><strong>Description:</strong> {selected.description}</div>
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<UnionRule>
        title="Union Rules & Compliance"
        subtitle="Track union rules, agreements, and compliance across all projects"
        data={data}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search union rules..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No union rules found"
        header={<Navigation />}
      />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.rule}
          subtitle={(r) => `${r.union} • ${r.category}`}
          sections={detailSections}
          actions={[{ id: 'edit', label: 'Edit Rule', icon: '✏️' }, { id: 'delete', label: 'Delete', icon: '🗑️' }]}
          onAction={(id, r) => { console.log(id, r.id); setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
