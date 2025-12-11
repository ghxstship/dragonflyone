'use client';

import { useState } from 'react';
import { Eye, Check } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  ListPage, Badge, DetailDrawer, RecordFormModal, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection, type FormFieldConfig,
} from '@ghxstship/ui';
import { getBadgeVariant, createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';

import {
  DEMO_RENTAL_EQUIPMENT,
  type DemoRentalEquipment as RentalEquipment,
} from '../../../lib/demo-data';

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<RentalEquipment>[] = [
  { key: 'name', label: 'Equipment', accessor: 'name', sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'vendor', label: 'Vendor', accessor: 'vendor' },
  { key: 'projectName', label: 'Project', accessor: 'projectName' },
  { key: 'rentalPeriod', label: 'Period', accessor: (r) => `${r.rentalStart} to ${r.rentalEnd}` },
  { key: 'totalCost', label: 'Cost', accessor: (r) => `$${r.totalCost.toLocaleString()}`, sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'On Rent', label: 'On Rent' }, { value: 'Reserved', label: 'Reserved' }, { value: 'Returned', label: 'Returned' }, { value: 'Overdue', label: 'Overdue' }] },
  { key: 'category', label: 'Category', options: [{ value: 'Audio', label: 'Audio' }, { value: 'Lighting', label: 'Lighting' }, { value: 'Video', label: 'Video' }, { value: 'Staging', label: 'Staging' }, { value: 'Rigging', label: 'Rigging' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Equipment Name', type: 'text', required: true },
  { name: 'category', label: 'Category', type: 'select', required: true, options: [{ value: 'Audio', label: 'Audio' }, { value: 'Lighting', label: 'Lighting' }, { value: 'Video', label: 'Video' }, { value: 'Staging', label: 'Staging' }, { value: 'Rigging', label: 'Rigging' }] },
  { name: 'vendor', label: 'Vendor', type: 'text', required: true },
  { name: 'projectName', label: 'Project', type: 'text', required: true },
  { name: 'rentalStart', label: 'Start Date', type: 'date', required: true },
  { name: 'rentalEnd', label: 'End Date', type: 'date', required: true },
  { name: 'dailyRate', label: 'Daily Rate ($)', type: 'number', required: true },
];

export default function RentalEquipmentPage() {
  const [data, setData] = useState<RentalEquipment[]>(DEMO_RENTAL_EQUIPMENT);
  const [selected, setSelected] = useState<RentalEquipment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const activeRentals = data.filter(r => r.status === 'On Rent' || r.status === 'Reserved').length;
  const overdueRentals = data.filter(r => r.status === 'Overdue').length;
  const totalCost = data.filter(r => r.status !== 'Returned').reduce((sum, r) => sum + r.totalCost, 0);
  const vendorCount = new Set(data.map(r => r.vendor)).size;

  const rowActions: ListPageAction<RentalEquipment>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'return', label: 'Mark Returned', icon: <Check className="size-4" />, onClick: (r) => setData(data.map(rec => rec.id === r.id ? { ...rec, status: 'Returned' as const } : rec)) },
  ];

  const stats = [
    { label: 'Active Rentals', value: activeRentals },
    { label: 'Overdue', value: overdueRentals },
    { label: 'Total Cost', value: `$${(totalCost / 1000).toFixed(1)}K` },
    { label: 'Vendors', value: vendorCount },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Rental Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Equipment:</strong> {selected.name}</Body>
        <Body size="sm"><strong>Category:</strong> {selected.category}</Body>
        <Body size="sm"><strong>Vendor:</strong> {selected.vendor}</Body>
        <Body size="sm"><strong>Project:</strong> {selected.projectName}</Body>
        <Body size="sm"><strong>Period:</strong> {selected.rentalStart} to {selected.rentalEnd}</Body>
        <Body size="sm"><strong>Daily Rate:</strong> ${selected.dailyRate}</Body>
        <Body size="sm"><strong>Total Cost:</strong> ${selected.totalCost.toLocaleString()}</Body>
        <Body size="sm"><strong>Status:</strong> {selected.status}</Body>
        <Body size="sm"><strong>Condition:</strong> {selected.condition}</Body>
        {selected.poNumber && <Body size="sm"><strong>PO Number:</strong> {selected.poNumber}</Body>}
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<RentalEquipment, 'id'>>({

    entityType: 'rentals',

    requiredFields: ['name', 'category', 'vendor'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/rentals', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      // Data refreshed after import

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('rentals');


  return (
    <AtlvsAppLayout>
      <ListPage<RentalEquipment>
        title="Rental Equipment Tracking"
        subtitle="Track third-party rental equipment across all projects"
        data={data}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search rentals..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        onCreate={() => setModalOpen(true)}
        entityType="rentals"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['name', 'category', 'vendor', 'projectName', 'rentalStart', 'rentalEnd', 'dailyRate']}
        onExport={createExportHandler({
          filename: "equipment-rentals",
          getData: () => data.map(r => ({
            id: r.id,
            name: r.name,
            vendor: r.vendor,
            category: r.category,
            status: r.status,
            startDate: r.rentalStart,
            endDate: r.rentalEnd,
            dailyRate: r.dailyRate,
            totalCost: r.totalCost,
          })),
        })}
        stats={stats}
        emptyMessage="No rentals found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            setData(prev => prev.filter(r => !ids.includes(r.id)));
          } else if (action === 'return') {
            setData(prev => prev.map(r => ids.includes(r.id) ? { ...r, status: 'Returned' as const } : r));
          }
        }}
        bulkActions={[
          { id: 'return', label: 'Mark Returned', variant: 'default' },
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
          title={(r) => r.name}
          subtitle={(r) => `${r.vendor} • ${r.status} • $${r.totalCost.toLocaleString()}`}
          sections={detailSections}
          actions={[{ id: 'return', label: 'Mark Returned', icon: <Check className="size-4" /> }]}
          onAction={(id, r) => { if (id === 'return') setData(data.map(rec => rec.id === r.id ? { ...rec, status: 'Returned' as const } : rec)); setDrawerOpen(false); }}
        />
      )}
      <RecordFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode="create"
        title="Add Rental"
        fields={formFields}
        onSubmit={async (values) => {
          await fetch('/api/rentals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
          });
          setModalOpen(false);
        }}
      />
    </AtlvsAppLayout>
  );
}
