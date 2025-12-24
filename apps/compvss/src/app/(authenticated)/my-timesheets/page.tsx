'use client';

import { useState } from 'react';
import { Eye, Send, Download, Trash2 } from 'lucide-react';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { createExportHandler } from '@ghxstship/config';
import {
  useMyTimesheets,
  type TimesheetEntry,
} from '../../../hooks/useMyTimesheets';
// Layout provided by route group

export default function MyTimesheetsPage() {
  const { data: timesheets = [], isLoading, error, refetch } = useMyTimesheets();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimesheetEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const columns: ListPageColumn<TimesheetEntry>[] = [
    { 
      key: 'date', 
      label: 'Date', 
      accessor: 'date', 
      sortable: true,
      render: (value) => new Date(String(value)).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    },
    { key: 'production', label: 'Production', accessor: 'production', sortable: true },
    { key: 'clockIn', label: 'Clock In', accessor: 'clockIn' },
    { key: 'clockOut', label: 'Clock Out', accessor: 'clockOut' },
    { 
      key: 'breakTime', 
      label: 'Break', 
      accessor: 'breakTime',
      render: (value) => `${value}m`
    },
    { 
      key: 'totalHours', 
      label: 'Hours', 
      accessor: 'totalHours', 
      sortable: true,
      render: (value) => `${value}h`
    },
    { 
      key: 'rate', 
      label: 'Rate', 
      accessor: 'rate',
      render: (value) => `$${value}/hr`
    },
    { 
      key: 'total', 
      label: 'Total', 
      accessor: (row) => `$${(row.totalHours * row.rate).toFixed(2)}`,
      sortable: true
    },
    { 
      key: 'status', 
      label: 'Status', 
      accessor: 'status', 
      sortable: true,
      render: (value) => {
        const variant = value === 'approved' ? 'success' : value === 'submitted' ? 'warning' : value === 'rejected' ? 'error' : 'info';
        return <Badge variant={variant}>{String(value).toUpperCase()}</Badge>;
      }
    },
  ];

  const filters: ListPageFilter[] = [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
      ]
    },
  ];

  const formFields: FormFieldConfig[] = [
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'production', label: 'Production', type: 'text', required: true },
    { name: 'clockIn', label: 'Clock In', type: 'text', required: true, placeholder: '09:00' },
    { name: 'clockOut', label: 'Clock Out', type: 'text', required: true, placeholder: '17:00' },
    { name: 'breakTime', label: 'Break (minutes)', type: 'number' },
    { name: 'rate', label: 'Hourly Rate ($)', type: 'number', required: true },
  ];

  const rowActions: ListPageAction<TimesheetEntry>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedEntry(row); setDrawerOpen(true); } },
    { id: 'submit', label: 'Submit', icon: <Send className="size-4" />, onClick: () => {}, disabled: (row) => row.status !== 'draft' },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setSelectedEntry(row); setDeleteConfirmOpen(true); }, disabled: (row) => row.status !== 'draft' },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'submit', label: 'Submit Selected', icon: <Send className="size-4" /> },
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleCreate = async (_data: Record<string, unknown>) => {
    setCreateModalOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    setDeleteConfirmOpen(false);
    setSelectedEntry(null);
    refetch();
  };

  const totalHours = timesheets.reduce((acc, t) => acc + t.totalHours, 0);
  const totalEarnings = timesheets.reduce((acc, t) => acc + t.totalHours * t.rate, 0);
  const pendingCount = timesheets.filter(t => t.status === 'draft' || t.status === 'submitted').length;
  const approvedCount = timesheets.filter(t => t.status === 'approved').length;

  const stats = [
    { label: 'Total Hours', value: `${totalHours}h` },
    { label: 'Total Earnings', value: `$${totalEarnings.toLocaleString()}` },
    { label: 'Pending', value: pendingCount },
    { label: 'Approved', value: approvedCount },
  ];

  const detailSections: DetailSection[] = selectedEntry ? [
    {
      id: 'overview',
      title: 'Timesheet Details',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Body size="sm"><strong>Date:</strong> {new Date(selectedEntry.date).toLocaleDateString()}</Body>
          <Body size="sm"><strong>Production:</strong> {selectedEntry.production}</Body>
          <Body size="sm"><strong>Clock In:</strong> {selectedEntry.clockIn}</Body>
          <Body size="sm"><strong>Clock Out:</strong> {selectedEntry.clockOut}</Body>
          <Body size="sm"><strong>Break:</strong> {selectedEntry.breakTime} minutes</Body>
          <Body size="sm"><strong>Total Hours:</strong> {selectedEntry.totalHours}h</Body>
          <Body size="sm"><strong>Rate:</strong> ${selectedEntry.rate}/hr</Body>
          <Body size="sm"><strong>Total:</strong> ${(selectedEntry.totalHours * selectedEntry.rate).toFixed(2)}</Body>
        </Grid>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<TimesheetEntry>
        title="My Timesheets"
        subtitle="Track your hours and submit timesheets for approval"
        data={timesheets}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search timesheets..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={async (actionId, selectedIds) => {
          if (actionId === 'export') {
            const selected = timesheets.filter(t => selectedIds.includes(t.id));
            const csv = [
              ['Date', 'Production', 'Clock In', 'Clock Out', 'Break', 'Hours', 'Rate', 'Total', 'Status'].join(','),
              ...selected.map(t => [t.date, t.production, t.clockIn, t.clockOut, t.breakTime, t.totalHours, t.rate, t.totalHours * t.rate, t.status].join(','))
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'timesheets-export.csv';
            a.click();
            URL.revokeObjectURL(url);
          }
        }}
        onRowClick={(row) => { setSelectedEntry(row); setDrawerOpen(true); }}
        createLabel="Add Entry"
        onCreate={() => setCreateModalOpen(true)}
        entityType="timesheets"
        onExport={createExportHandler({
          filename: "timesheets",
          getData: () => timesheets.map(t => ({
            date: t.date,
            production: t.production,
            clockIn: t.clockIn,
            clockOut: t.clockOut,
            breakTime: t.breakTime,
            totalHours: t.totalHours,
            rate: t.rate,
            total: t.totalHours * t.rate,
            status: t.status,
          })),
        })}
        stats={stats}
        emptyMessage="No timesheet entries found"
        emptyAction={{ label: 'Add Entry', onClick: () => setCreateModalOpen(true) }}
        showFavorite
        showSettings
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Timesheet Entry"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedEntry}
        title={(e) => e.production}
        subtitle={(e) => new Date(e.date).toLocaleDateString()}
        sections={detailSections}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Entry"
        message={`Are you sure you want to delete this timesheet entry?`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setSelectedEntry(null); }}
      />
    </>
  );
}
