'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, ExternalLink, Pencil } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  ListPage, Badge, DetailDrawer, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection, type ExportFormat,
} from '@ghxstship/ui';
import { getBadgeVariant, createExportHandler } from '@ghxstship/config';

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
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'source', label: 'View Source', icon: <ExternalLink className="size-4" />, onClick: (r) => window.open(`https://www.dol.gov/agencies/whd/state/meal-rest-breaks#${r.stateCode}`, '_blank') },
  ];

  const stats = [
    { label: 'States Tracked', value: totalStates },
    { label: 'Total Laws', value: data.length },
    { label: 'Recent Updates', value: updatedLaws },
    { label: 'Active Laws', value: data.filter(l => l.status === 'Active').length },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Law Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>State:</strong> {selected.state} ({selected.stateCode})</Body>
        <Body size="sm"><strong>Category:</strong> {selected.category}</Body>
        <Body size="sm"><strong>Requirement:</strong> {selected.requirement}</Body>
        <Body size="sm"><strong>Status:</strong> {selected.status}</Body>
        <Body size="sm"><strong>Effective Date:</strong> {selected.effectiveDate}</Body>
        <Body size="sm"><strong>Last Updated:</strong> {selected.lastUpdated}</Body>
        <Body size="sm" className="col-span-2"><strong>Description:</strong> {selected.description}</Body>
      </Grid>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
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
        entityType="labor-laws"
        onExport={createExportHandler({
          filename: "labor-laws",
          getData: () => data.map(l => ({
            id: l.id,
            state: l.state,
            stateCode: l.stateCode,
            category: l.category,
            requirement: l.requirement,
            effectiveDate: l.effectiveDate,
            status: l.status,
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No labor laws found"
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        showFavorite
        showSettings
      />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.requirement}
          subtitle={(r) => `${r.state} • ${r.category}`}
          sections={detailSections}
          actions={[{ id: 'source', label: 'View Source', icon: <ExternalLink className="size-4" /> }, { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" /> }]}
          onAction={(id, r) => {
            if (id === 'source') window.open(`https://www.dol.gov/agencies/whd/state/meal-rest-breaks#${r.stateCode}`, '_blank');
            if (id === 'edit') router.push(`/workforce/labor-laws/${r.id}/edit`);
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
