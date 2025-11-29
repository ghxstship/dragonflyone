'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../../components/navigation';
import {
  ListPage, Badge, DetailDrawer, RecordFormModal,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection, type FormFieldConfig,
} from '@ghxstship/ui';
import { getBadgeVariant } from '@ghxstship/config';

interface RentalEquipment {
  id: string;
  name: string;
  category: string;
  vendor: string;
  projectName: string;
  rentalStart: string;
  rentalEnd: string;
  dailyRate: number;
  totalCost: number;
  status: 'Reserved' | 'On Rent' | 'Returned' | 'Overdue';
  poNumber?: string;
  condition: string;
  [key: string]: unknown;
}

const mockData: RentalEquipment[] = [
  { id: 'RNT-001', name: 'Barco UDX-4K32', category: 'Video', vendor: 'PRG', projectName: 'Summer Fest 2024', rentalStart: '2024-11-20', rentalEnd: '2024-11-26', dailyRate: 1500, totalCost: 10500, status: 'On Rent', poNumber: 'PO-2024-456', condition: 'Excellent' },
  { id: 'RNT-002', name: 'd&b audiotechnik SL-SUB', category: 'Audio', vendor: 'Sound Systems Inc', projectName: 'Summer Fest 2024', rentalStart: '2024-11-20', rentalEnd: '2024-11-26', dailyRate: 200, totalCost: 1400, status: 'On Rent', poNumber: 'PO-2024-457', condition: 'Good' },
  { id: 'RNT-003', name: 'Stageline SL-320 Mobile Stage', category: 'Staging', vendor: 'Stageline', projectName: 'Summer Fest 2024', rentalStart: '2024-11-18', rentalEnd: '2024-11-27', dailyRate: 3500, totalCost: 35000, status: 'On Rent', poNumber: 'PO-2024-450', condition: 'Good' },
  { id: 'RNT-004', name: 'CM Lodestar 2-Ton (x10)', category: 'Rigging', vendor: 'Rigging Solutions', projectName: 'Corporate Gala', rentalStart: '2024-12-01', rentalEnd: '2024-12-05', dailyRate: 150, totalCost: 750, status: 'Reserved', condition: 'Excellent' },
  { id: 'RNT-005', name: 'Avolites Arena Console', category: 'Lighting', vendor: '4Wall', projectName: 'Fall Festival', rentalStart: '2024-11-10', rentalEnd: '2024-11-16', dailyRate: 500, totalCost: 3500, status: 'Returned', poNumber: 'PO-2024-440', condition: 'Good' },
  { id: 'RNT-006', name: 'Shure ULXD4Q Wireless', category: 'Audio', vendor: 'PRG', projectName: 'Fall Festival', rentalStart: '2024-11-10', rentalEnd: '2024-11-16', dailyRate: 75, totalCost: 525, status: 'Overdue', poNumber: 'PO-2024-441', condition: 'Good' },
];

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
  const router = useRouter();
  const [data, setData] = useState<RentalEquipment[]>(mockData);
  const [selected, setSelected] = useState<RentalEquipment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const activeRentals = data.filter(r => r.status === 'On Rent' || r.status === 'Reserved').length;
  const overdueRentals = data.filter(r => r.status === 'Overdue').length;
  const totalCost = data.filter(r => r.status !== 'Returned').reduce((sum, r) => sum + r.totalCost, 0);
  const vendorCount = new Set(data.map(r => r.vendor)).size;

  const rowActions: ListPageAction<RentalEquipment>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'return', label: 'Mark Returned', icon: '✅', onClick: (r) => setData(data.map(rec => rec.id === r.id ? { ...rec, status: 'Returned' as const } : rec)) },
  ];

  const stats = [
    { label: 'Active Rentals', value: activeRentals },
    { label: 'Overdue', value: overdueRentals },
    { label: 'Total Cost', value: `$${(totalCost / 1000).toFixed(1)}K` },
    { label: 'Vendors', value: vendorCount },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Rental Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Equipment:</strong> {selected.name}</div>
        <div><strong>Category:</strong> {selected.category}</div>
        <div><strong>Vendor:</strong> {selected.vendor}</div>
        <div><strong>Project:</strong> {selected.projectName}</div>
        <div><strong>Period:</strong> {selected.rentalStart} to {selected.rentalEnd}</div>
        <div><strong>Daily Rate:</strong> ${selected.dailyRate}</div>
        <div><strong>Total Cost:</strong> ${selected.totalCost.toLocaleString()}</div>
        <div><strong>Status:</strong> {selected.status}</div>
        <div><strong>Condition:</strong> {selected.condition}</div>
        {selected.poNumber && <div><strong>PO Number:</strong> {selected.poNumber}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
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
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No rentals found"
        header={<CreatorNavigationAuthenticated
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Assets', href: '/assets' }, { label: 'Rentals' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        showFavorite
        showSettings />}
      />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.name}
          subtitle={(r) => `${r.vendor} • ${r.status} • $${r.totalCost.toLocaleString()}`}
          sections={detailSections}
          actions={[{ id: 'return', label: 'Mark Returned', icon: '✅' }]}
          onAction={(id, r) => { if (id === 'return') setData(data.map(rec => rec.id === r.id ? { ...rec, status: 'Returned' as const } : rec)); setDrawerOpen(false); }}
        />
      )}
      <RecordFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode="create"
        title="Add Rental"
        fields={formFields}
        onSubmit={async (values) => { console.log('Create rental:', values); setModalOpen(false); }}
      />
    </>
  );
}
