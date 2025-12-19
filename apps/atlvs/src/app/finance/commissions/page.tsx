"use client";

import { useState } from "react";

import { Eye, Check, DollarSign } from "lucide-react";
import { AtlvsAppLayout } from "../../../components/app-layout";
import {
  ListPage,
  Badge,
  DetailDrawer,
  RecordFormModal,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
  type FormFieldConfig,
} from "@ghxstship/ui";
import { getBadgeVariant, createExportHandler, createImportHandler, getImportTemplates, useCommissions, type CommissionRecord } from "@ghxstship/config";
import { DEMO_COMMISSION_RECORDS } from '../../../lib/demo-data';

type Commission = CommissionRecord & { [key: string]: unknown };

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<Commission>[] = [
  { key: 'salesRep', label: 'Sales Rep', accessor: 'salesRep', sortable: true },
  { key: 'dealName', label: 'Deal', accessor: 'dealName', sortable: true },
  { key: 'client', label: 'Client', accessor: 'client' },
  { key: 'dealValue', label: 'Deal Value', accessor: (r) => `$${r.dealValue.toLocaleString()}`, sortable: true },
  { key: 'commissionRate', label: 'Rate', accessor: (r) => `${r.commissionRate}%` },
  { key: 'commissionAmount', label: 'Commission', accessor: (r) => `$${r.commissionAmount.toLocaleString()}`, sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'Pending', label: 'Pending' }, { value: 'Approved', label: 'Approved' }, { value: 'Paid', label: 'Paid' }, { value: 'Disputed', label: 'Disputed' }] },
  { key: 'salesRep', label: 'Sales Rep', options: [{ value: 'John Smith', label: 'John Smith' }, { value: 'Jane Doe', label: 'Jane Doe' }, { value: 'Mike Johnson', label: 'Mike Johnson' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'salesRep', label: 'Sales Rep', type: 'text', required: true },
  { name: 'dealName', label: 'Deal Name', type: 'text', required: true },
  { name: 'client', label: 'Client', type: 'text', required: true },
  { name: 'dealValue', label: 'Deal Value', type: 'number', required: true },
  { name: 'commissionRate', label: 'Commission Rate (%)', type: 'number', required: true },
];

export default function CommissionsPage() {
  const [selectedRecord, setSelectedRecord] = useState<Commission | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Real API integration with demo fallback
  const { commissions: apiData, isLoading, error, createCommissionAsync, updateStatusAsync, deleteCommissionsAsync, bulkUpdateStatusAsync, refetch } = useCommissions();
  const records: Commission[] = apiData.length > 0 ? (apiData as Commission[]) : (DEMO_COMMISSION_RECORDS as Commission[]);

  const totalCommissions = records.reduce((sum, r) => sum + r.commissionAmount, 0);
  const pendingCommissions = records.filter(r => r.status === "Pending" || r.status === "Approved").reduce((sum, r) => sum + r.commissionAmount, 0);
  const paidCommissions = records.filter(r => r.status === "Paid").reduce((sum, r) => sum + r.commissionAmount, 0);
  const disputedCount = records.filter(r => r.status === "Disputed").length;

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createCommissionAsync({
        salesRep: String(data.salesRep),
        dealName: String(data.dealName),
        client: String(data.client),
        dealValue: Number(data.dealValue),
        commissionRate: Number(data.commissionRate),
      });
      refetch();
      setCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to create commission:', err);
    }
  };

  const handleStatusChange = async (r: Commission, status: string, paymentDate?: string) => {
    try {
      await updateStatusAsync({ id: r.id, status, paymentDate });
      refetch();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const rowActions: ListPageAction<Commission>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedRecord(r); setDrawerOpen(true); } },
    { id: 'approve', label: 'Approve', icon: <Check className="size-4" />, onClick: (r) => handleStatusChange(r, 'Approved') },
  ];

  const stats = [
    { label: 'Total Commissions', value: `$${(totalCommissions / 1000).toFixed(1)}K` },
    { label: 'Pending Payout', value: `$${(pendingCommissions / 1000).toFixed(1)}K` },
    { label: 'Paid This Month', value: `$${(paidCommissions / 1000).toFixed(1)}K` },
    { label: 'Disputed', value: disputedCount },
  ];

  const detailSections: DetailSection[] = selectedRecord ? [
    { id: 'overview', title: 'Commission Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Sales Rep:</strong> {selectedRecord.salesRep}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedRecord.status}</Body>
        <Body size="sm"><strong>Deal:</strong> {selectedRecord.dealName}</Body>
        <Body size="sm"><strong>Client:</strong> {selectedRecord.client}</Body>
        <Body size="sm"><strong>Deal Value:</strong> ${selectedRecord.dealValue.toLocaleString()}</Body>
        <Body size="sm"><strong>Rate:</strong> {selectedRecord.commissionRate}%</Body>
        <Body size="sm"><strong>Commission:</strong> ${selectedRecord.commissionAmount.toLocaleString()}</Body>
        <Body size="sm"><strong>Close Date:</strong> {selectedRecord.closeDate}</Body>
        {selectedRecord.paymentDate && <Body size="sm"><strong>Payment Date:</strong> {selectedRecord.paymentDate}</Body>}
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<CommissionRecord, 'id'>>({

    entityType: 'commissions',

    requiredFields: ['salesRep', 'dealName', 'client'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/commissions', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('commissions');


  return (
    <AtlvsAppLayout>
      <ListPage<Commission>
        title="Commission Management"
        subtitle="Calculate, track, and manage sales commissions"
        data={records}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error as Error | undefined}
        searchPlaceholder="Search commissions..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedRecord(r); setDrawerOpen(true); }}
        createLabel="Add Commission"
        onCreate={() => setCreateModalOpen(true)}
        entityType="commissions"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['salesRep', 'dealName', 'client', 'dealValue', 'commissionRate', 'commissions', 'commissionAmount']}
        onExport={createExportHandler({
          filename: "commissions",
          getData: () => records.map(c => ({
            id: c.id,
            salesperson: c.salesRep,
            deal: c.dealName,
            amount: c.commissionAmount,
            rate: c.commissionRate,
            status: c.status,
            paidDate: c.paymentDate || '',
          })),
        })}
        stats={stats}
        emptyMessage="No commission records found"
        emptyAction={{ label: 'Add Commission', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await deleteCommissionsAsync(ids);
            refetch();
          } else if (action === 'approve') {
            await bulkUpdateStatusAsync({ ids, status: 'Approved' });
            refetch();
          } else if (action === 'pay') {
            await bulkUpdateStatusAsync({ ids, status: 'Paid' });
            refetch();
          }
        }}
        bulkActions={[
          { id: 'approve', label: 'Approve Selected', variant: 'default' },
          { id: 'pay', label: 'Mark Paid', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      {selectedRecord && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedRecord}
          title={(r) => r.dealName}
          subtitle={(r) => `${r.salesRep} • $${r.commissionAmount.toLocaleString()}`}
          sections={detailSections}
          actions={[
            { id: 'approve', label: 'Approve', icon: <Check className="size-4" /> },
            { id: 'pay', label: 'Mark Paid', icon: <DollarSign className="size-4" /> },
          ]}
          onAction={async (id, r) => {
            if (id === 'approve') await handleStatusChange(r, 'Approved');
            if (id === 'pay') await handleStatusChange(r, 'Paid', new Date().toISOString().split('T')[0]);
            setDrawerOpen(false);
          }}
        />
      )}
      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Commission Record"
        fields={formFields}
        onSubmit={handleCreate}
        mode="create"
      />
    </AtlvsAppLayout>
  );
}
