'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Calendar, Pencil } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  ListPage, Badge, DetailDrawer, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from '@ghxstship/ui';
import { getBadgeVariant, createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';

import {
  DEMO_CALIBRATION_RECORDS,
  type DemoCalibrationRecord as CalibrationRecord,
} from '../../../lib/demo-data';

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
  const [data] = useState<CalibrationRecord[]>(DEMO_CALIBRATION_RECORDS);
  const [selected, setSelected] = useState<CalibrationRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const overdueCount = data.filter((c) => c.status === 'Overdue').length;
  const dueSoonCount = data.filter((c) => c.status === 'Due Soon').length;

  const rowActions: ListPageAction<CalibrationRecord>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'schedule', label: 'Schedule', icon: <Calendar className="size-4" />, onClick: (r) => router.push(`/assets/calibration/${r.id}/schedule`) },
  ];

  const stats = [
    { label: 'Total Records', value: data.length },
    { label: 'Current', value: data.filter(c => c.status === 'Current').length },
    { label: 'Due Soon', value: dueSoonCount },
    { label: 'Overdue', value: overdueCount },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Calibration Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Asset:</strong> {selected.assetName}</Body>
        <Body size="sm"><strong>Category:</strong> {selected.category}</Body>
        <Body size="sm"><strong>Type:</strong> {selected.calibrationType}</Body>
        <Body size="sm"><strong>Status:</strong> {selected.status}</Body>
        <Body size="sm"><strong>Last Calibration:</strong> {selected.lastCalibration}</Body>
        <Body size="sm"><strong>Next Due:</strong> {selected.nextDue}</Body>
        <Body size="sm"><strong>Frequency:</strong> {selected.frequency}</Body>
        <Body size="sm"><strong>Certified By:</strong> {selected.certifiedBy || 'N/A'}</Body>
        {selected.notes && <Body size="sm" className="col-span-2"><strong>Notes:</strong> {selected.notes}</Body>}
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<CalibrationRecord, 'id'>>({

    entityType: 'calibration',

    requiredFields: ['assetName', 'category', 'calibrationType'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/calibration', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('calibration');


  return (
    <AtlvsAppLayout>
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
        entityType="calibration"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['assetName', 'category', 'calibrationType', 'lastCalibration', 'nextDue', 'frequency', 'status']}
        onExport={createExportHandler({
          filename: "calibration-records",
          getData: () => data.map(c => ({
            id: c.id,
            assetId: c.assetId,
            assetName: c.assetName,
            category: c.category,
            calibrationType: c.calibrationType,
            lastCalibration: c.lastCalibration,
            nextDue: c.nextDue,
            frequency: c.frequency,
            status: c.status,
            certifiedBy: c.certifiedBy || '',
          })),
        })}
        stats={stats}
        emptyMessage="No calibration records found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/assets/calibration/bulk', {
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
          title={(r) => r.assetName}
          subtitle={(r) => `${r.calibrationType} • ${r.frequency}`}
          sections={detailSections}
          actions={[{ id: 'schedule', label: 'Schedule Calibration', icon: <Calendar className="size-4" /> }, { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" /> }]}
          onAction={(id, r) => {
            if (id === 'schedule') router.push(`/assets/calibration/${r.id}/schedule`);
            if (id === 'edit') router.push(`/assets/calibration/${r.id}/edit`);
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
