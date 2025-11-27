'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../../components/navigation';
import {
  ListPage, Badge, DetailDrawer,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from '@ghxstship/ui';
import { getBadgeVariant } from '@ghxstship/config';

interface CalibrationRecord {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  calibrationType: string;
  lastCalibration: string;
  nextDue: string;
  frequency: string;
  status: 'Current' | 'Due Soon' | 'Overdue' | 'Scheduled';
  certifiedBy?: string;
  certificateNumber?: string;
  notes?: string;
  [key: string]: unknown;
}

const mockData: CalibrationRecord[] = [
  { id: 'CAL-001', assetId: 'AST-010', assetName: 'Fluke 87V Multimeter', category: 'Test Equipment', calibrationType: 'Electrical Calibration', lastCalibration: '2024-06-15', nextDue: '2025-06-15', frequency: 'Annual', status: 'Current', certifiedBy: 'Cal Labs Inc', certificateNumber: 'CL-2024-4521' },
  { id: 'CAL-002', assetId: 'AST-011', assetName: 'NTI Audio XL2', category: 'Audio Measurement', calibrationType: 'Acoustic Calibration', lastCalibration: '2024-03-20', nextDue: '2024-12-20', frequency: '9 Months', status: 'Due Soon', certifiedBy: 'NTI Americas', certificateNumber: 'NTI-2024-8892' },
  { id: 'CAL-003', assetId: 'AST-012', assetName: 'CM Lodestar Load Cell', category: 'Rigging', calibrationType: 'Load Certification', lastCalibration: '2024-01-10', nextDue: '2024-07-10', frequency: '6 Months', status: 'Overdue', certifiedBy: 'Rigging Safety Inc', certificateNumber: 'RS-2024-1123' },
  { id: 'CAL-004', assetId: 'AST-013', assetName: 'Minolta CL-200A', category: 'Lighting Measurement', calibrationType: 'Photometric Calibration', lastCalibration: '2024-08-01', nextDue: '2025-08-01', frequency: 'Annual', status: 'Current', certifiedBy: 'Konica Minolta', certificateNumber: 'KM-2024-5567' },
  { id: 'CAL-005', assetId: 'AST-014', assetName: 'Laser Distance Meter', category: 'Survey Equipment', calibrationType: 'Distance Calibration', lastCalibration: '2024-09-15', nextDue: '2024-12-15', frequency: 'Quarterly', status: 'Scheduled', certifiedBy: 'Precision Labs', certificateNumber: 'PL-2024-9901', notes: 'Scheduled for Dec 10' },
];

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<CalibrationRecord>[] = [
  { key: 'assetName', label: 'Asset', accessor: 'assetName', sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'calibrationType', label: 'Type', accessor: 'calibrationType' },
  { key: 'lastCalibration', label: 'Last Calibration', accessor: 'lastCalibration', sortable: true },
  { key: 'nextDue', label: 'Next Due', accessor: 'nextDue', sortable: true },
  { key: 'frequency', label: 'Frequency', accessor: 'frequency' },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'Current', label: 'Current' }, { value: 'Due Soon', label: 'Due Soon' }, { value: 'Overdue', label: 'Overdue' }, { value: 'Scheduled', label: 'Scheduled' }] },
  { key: 'category', label: 'Category', options: [{ value: 'Test Equipment', label: 'Test Equipment' }, { value: 'Audio Measurement', label: 'Audio Measurement' }, { value: 'Rigging', label: 'Rigging' }, { value: 'Lighting Measurement', label: 'Lighting Measurement' }] },
];

export default function CalibrationCertificationPage() {
  const router = useRouter();
  const [data] = useState<CalibrationRecord[]>(mockData);
  const [selected, setSelected] = useState<CalibrationRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const overdueCount = data.filter((c) => c.status === 'Overdue').length;
  const dueSoonCount = data.filter((c) => c.status === 'Due Soon').length;

  const rowActions: ListPageAction<CalibrationRecord>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'schedule', label: 'Schedule', icon: '📅', onClick: (r) => console.log('Schedule', r.id) },
  ];

  const stats = [
    { label: 'Total Records', value: data.length },
    { label: 'Current', value: data.filter(c => c.status === 'Current').length },
    { label: 'Due Soon', value: dueSoonCount },
    { label: 'Overdue', value: overdueCount },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Calibration Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Asset:</strong> {selected.assetName}</div>
        <div><strong>Category:</strong> {selected.category}</div>
        <div><strong>Type:</strong> {selected.calibrationType}</div>
        <div><strong>Status:</strong> {selected.status}</div>
        <div><strong>Last Calibration:</strong> {selected.lastCalibration}</div>
        <div><strong>Next Due:</strong> {selected.nextDue}</div>
        <div><strong>Frequency:</strong> {selected.frequency}</div>
        <div><strong>Certified By:</strong> {selected.certifiedBy || 'N/A'}</div>
        {selected.notes && <div className="col-span-2"><strong>Notes:</strong> {selected.notes}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<CalibrationRecord>
        title="Calibration & Certification Schedules"
        subtitle="Track calibration and certification requirements for all assets"
        data={data}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search calibration records..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No calibration records found"
        header={<CreatorNavigationAuthenticated />}
      />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.assetName}
          subtitle={(r) => `${r.calibrationType} • ${r.frequency}`}
          sections={detailSections}
          actions={[{ id: 'schedule', label: 'Schedule Calibration', icon: '📅' }, { id: 'edit', label: 'Edit', icon: '✏️' }]}
          onAction={(id, r) => { console.log(id, r.id); setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
