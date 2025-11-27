'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../../components/navigation';
import {
  ListPage, Badge, DetailDrawer,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from '@ghxstship/ui';
import { getBadgeVariant } from '@ghxstship/config';

interface StateLaborLaw {
  id: string;
  state: string;
  stateCode: string;
  category: string;
  requirement: string;
  description: string;
  effectiveDate: string;
  lastUpdated: string;
  status: 'Active' | 'Updated' | 'Pending';
  [key: string]: unknown;
}

const mockData: StateLaborLaw[] = [
  { id: 'LAW-001', state: 'California', stateCode: 'CA', category: 'Meal Breaks', requirement: '30-min meal break', description: 'Employees must receive a 30-minute unpaid meal break for shifts over 5 hours', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
  { id: 'LAW-002', state: 'California', stateCode: 'CA', category: 'Rest Breaks', requirement: '10-min rest per 4 hours', description: 'Paid 10-minute rest break for every 4 hours worked', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
  { id: 'LAW-003', state: 'California', stateCode: 'CA', category: 'Overtime', requirement: 'Daily overtime', description: 'Overtime after 8 hours in a day, double time after 12 hours', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
  { id: 'LAW-004', state: 'New York', stateCode: 'NY', category: 'Meal Breaks', requirement: '30-min meal break', description: 'Meal break required for shifts over 6 hours spanning noon', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
  { id: 'LAW-005', state: 'New York', stateCode: 'NY', category: 'Spread of Hours', requirement: 'Extra hour pay', description: 'Additional hour at minimum wage if workday exceeds 10 hours', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
  { id: 'LAW-006', state: 'Texas', stateCode: 'TX', category: 'Overtime', requirement: 'Federal FLSA only', description: 'Texas follows federal overtime rules - overtime after 40 hours/week', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
  { id: 'LAW-007', state: 'Illinois', stateCode: 'IL', category: 'Meal Breaks', requirement: '20-min meal break', description: '20-minute meal break for shifts of 7.5+ hours', effectiveDate: '2024-01-01', lastUpdated: '2024-06-01', status: 'Updated' },
  { id: 'LAW-008', state: 'Nevada', stateCode: 'NV', category: 'Rest Breaks', requirement: '10-min rest per 4 hours', description: 'Paid 10-minute rest break for every 4 hours worked', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
];

const getStatusVariant = (status: string): 'solid' | 'outline' | 'ghost' => {
  switch (status) { case 'Active': return 'solid'; case 'Updated': return 'outline'; case 'Pending': return 'ghost'; default: return 'ghost'; }
};

const columns: ListPageColumn<StateLaborLaw>[] = [
  { key: 'state', label: 'State', accessor: (r) => `${r.state} (${r.stateCode})`, sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'requirement', label: 'Requirement', accessor: 'requirement', sortable: true },
  { key: 'description', label: 'Description', accessor: 'description' },
  { key: 'lastUpdated', label: 'Last Updated', accessor: 'lastUpdated', sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'state', label: 'State', options: [{ value: 'California', label: 'California' }, { value: 'New York', label: 'New York' }, { value: 'Texas', label: 'Texas' }, { value: 'Illinois', label: 'Illinois' }, { value: 'Nevada', label: 'Nevada' }] },
  { key: 'category', label: 'Category', options: [{ value: 'Meal Breaks', label: 'Meal Breaks' }, { value: 'Rest Breaks', label: 'Rest Breaks' }, { value: 'Overtime', label: 'Overtime' }, { value: 'Spread of Hours', label: 'Spread of Hours' }] },
  { key: 'status', label: 'Status', options: [{ value: 'Active', label: 'Active' }, { value: 'Updated', label: 'Updated' }, { value: 'Pending', label: 'Pending' }] },
];

export default function LaborLawsPage() {
  const router = useRouter();
  const [data] = useState<StateLaborLaw[]>(mockData);
  const [selected, setSelected] = useState<StateLaborLaw | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalStates = new Set(data.map((l) => l.state)).size;
  const updatedLaws = data.filter((l) => l.status === 'Updated').length;

  const rowActions: ListPageAction<StateLaborLaw>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'source', label: 'View Source', icon: '🔗', onClick: (r) => console.log('View source', r.id) },
  ];

  const stats = [
    { label: 'States Tracked', value: totalStates },
    { label: 'Total Laws', value: data.length },
    { label: 'Recent Updates', value: updatedLaws },
    { label: 'Active Laws', value: data.filter(l => l.status === 'Active').length },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Law Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>State:</strong> {selected.state} ({selected.stateCode})</div>
        <div><strong>Category:</strong> {selected.category}</div>
        <div><strong>Requirement:</strong> {selected.requirement}</div>
        <div><strong>Status:</strong> {selected.status}</div>
        <div><strong>Effective Date:</strong> {selected.effectiveDate}</div>
        <div><strong>Last Updated:</strong> {selected.lastUpdated}</div>
        <div className="col-span-2"><strong>Description:</strong> {selected.description}</div>
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<StateLaborLaw>
        title="Multi-State Labor Law Management"
        subtitle="Track and comply with labor laws across all operating states"
        data={data}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search labor laws..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No labor laws found"
        header={<CreatorNavigationAuthenticated />}
      />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.requirement}
          subtitle={(r) => `${r.state} • ${r.category}`}
          sections={detailSections}
          actions={[{ id: 'source', label: 'View Source', icon: '🔗' }, { id: 'edit', label: 'Edit', icon: '✏️' }]}
          onAction={(id, r) => { console.log(id, r.id); setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
