'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, FileText, Shield, Clock, AlertTriangle } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import { useInsurancePolicies, useInsuranceStats, type InsurancePolicy } from '../../hooks/useCompliance';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  Grid,
  Stack,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost'> = {
  active: 'success',
  pending: 'warning',
  expired: 'error',
  cancelled: 'error',
};

const policyTypeLabels: Record<string, string> = {
  general_liability: 'General Liability',
  workers_comp: 'Workers Compensation',
  equipment: 'Equipment',
  event_cancellation: 'Event Cancellation',
  auto: 'Auto',
  umbrella: 'Umbrella',
  other: 'Other',
};

const columns: ListPageColumn<InsurancePolicy>[] = [
  { 
    key: 'policy_name', 
    label: 'Policy', 
    accessor: 'policy_name', 
    sortable: true,
  },
  { 
    key: 'policy_type', 
    label: 'Type', 
    accessor: 'policy_type', 
    render: (value) => policyTypeLabels[String(value)] || String(value)
  },
  { 
    key: 'provider', 
    label: 'Provider', 
    accessor: 'provider', 
  },
  { 
    key: 'coverage_amount', 
    label: 'Coverage', 
    accessor: 'coverage_amount', 
    sortable: true,
    render: (value) => `$${Number(value || 0).toLocaleString()}`
  },
  { 
    key: 'expiration_date', 
    label: 'Expires', 
    accessor: 'expiration_date', 
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      const date = new Date(String(value));
      const now = new Date();
      const isExpired = date < now;
      const isExpiringSoon = date > now && date < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      // Import handler for CSV/JSON files
      const handleImport = createImportHandler<Omit<InsurancePolicy, 'id'>>({
        entityType: 'insurance',
        requiredFields: ['policy_name', 'policy_type', 'status'],
        onImport: async (records) => {
          for (const record of records) {
            await fetch('/api/insurance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ organization_id: 'default-org', ...record }),
            });
          }
          refetch();
        },
      });

      // Import templates for field mapping
      const importTemplates = getImportTemplates('insurance');

      return (
        <Stack direction="horizontal" gap={2} className="items-center">
          {isExpired && <AlertTriangle className="size-4 text-error" />}
          {isExpiringSoon && <Clock className="size-4 text-warning" />}
          <Body className={isExpired ? 'text-error' : isExpiringSoon ? 'text-warning' : ''}>
            {date.toLocaleDateString()}
          </Body>
        </Stack>
      );
    }
  },
  { 
    key: 'status', 
    label: 'Status', 
    accessor: 'status', 
    sortable: true,
    render: (value) => (
      <Badge variant={statusColors[String(value)] || 'ghost'}>
        {String(value).toUpperCase()}
      </Badge>
    )
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'policy_name', label: 'Policy Name', type: 'text', required: true, placeholder: 'e.g., General Liability Policy', colSpan: 2 },
  { name: 'policy_type', label: 'Policy Type', type: 'select', required: true, options: Object.entries(policyTypeLabels).map(([value, label]) => ({ value, label })) },
  { name: 'status', label: 'Status', type: 'select', required: true, options: [
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
    { value: 'cancelled', label: 'Cancelled' },
  ]},
  { name: 'provider', label: 'Provider', type: 'text', required: true, placeholder: 'e.g., State Farm' },
  { name: 'policy_number', label: 'Policy Number', type: 'text', required: true, placeholder: 'e.g., POL-2024-001' },
  { name: 'coverage_amount', label: 'Coverage Amount', type: 'number', required: true, placeholder: '0.00' },
  { name: 'deductible', label: 'Deductible', type: 'number', placeholder: '0.00' },
  { name: 'premium', label: 'Premium', type: 'number', placeholder: '0.00' },
  { name: 'effective_date', label: 'Effective Date', type: 'date', required: true },
  { name: 'expiration_date', label: 'Expiration Date', type: 'date', required: true },
  { name: 'contact_name', label: 'Contact Name', type: 'text', placeholder: 'Agent name' },
  { name: 'contact_email', label: 'Contact Email', type: 'email', placeholder: 'agent@insurance.com' },
  { name: 'contact_phone', label: 'Contact Phone', type: 'text', placeholder: '+1 (555) 000-0000' },
  { name: 'document_url', label: 'Document URL', type: 'text', placeholder: 'https://...' },
  { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2, placeholder: 'Additional notes...' },
];

export default function InsurancePage() {
  const router = useRouter();
  const { data: policies, isLoading, error, refetch } = useInsurancePolicies();
  const { data: stats } = useInsuranceStats();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filters: ListPageFilter[] = [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'active', label: 'Active' },
        { value: 'expired', label: 'Expired' },
        { value: 'cancelled', label: 'Cancelled' },
      ]
    },
    { 
      key: 'policy_type', 
      label: 'Type', 
      options: Object.entries(policyTypeLabels).map(([value, label]) => ({ value, label }))
    },
  ];

  const rowActions: ListPageAction<InsurancePolicy>[] = [
    { 
      id: 'view', 
      label: 'View Details', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => router.push(`/insurance/${row.id}`) 
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (row) => { setSelectedPolicy(row); setDrawerOpen(true); } 
    },
    { 
      id: 'document', 
      label: 'View Document', 
      icon: <FileText className="size-4" />, 
      onClick: (row) => row.document_url && window.open(row.document_url, '_blank'),
      hidden: (row) => !row.document_url
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await fetch('/api/insurance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setCreateModalOpen(false);
    refetch();
  };

  const pageStats = [
    { label: 'Total Policies', value: stats?.total || 0 },
    { label: 'Active', value: stats?.active || 0 },
    { label: 'Total Coverage', value: `$${((stats?.totalCoverage || 0) / 1000000).toFixed(1)}M` },
    { label: 'Expiring Soon', value: stats?.expiringSoon || 0 },
  ];

  const detailSections: DetailSection[] = selectedPolicy ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Type</Body>
            <Body>{policyTypeLabels[selectedPolicy.policy_type] || selectedPolicy.policy_type}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Status</Body>
            <Badge variant={statusColors[selectedPolicy.status] || 'ghost'}>
              {selectedPolicy.status.toUpperCase()}
            </Badge>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Provider</Body>
            <Body>{selectedPolicy.provider}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Policy Number</Body>
            <Body>{selectedPolicy.policy_number}</Body>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'coverage',
      title: 'Coverage',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Coverage Amount</Body>
            <Body>${selectedPolicy.coverage_amount?.toLocaleString()}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Deductible</Body>
            <Body>{selectedPolicy.deductible ? `$${selectedPolicy.deductible.toLocaleString()}` : '—'}</Body>
          </Stack>
        </Grid>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<InsurancePolicy>
        title="Insurance Policies"
        subtitle="Manage insurance coverage and policies"
        data={policies || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search policies..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => router.push(`/insurance/${row.id}`)}
        createLabel="New Policy"
        onCreate={() => setCreateModalOpen(true)}
        entityType="insurance"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['policy_name', 'policy_type', 'status', 'provider', 'policy_number', 'coverage_amount', 'deductible']}
        onExport={createExportHandler({
          filename: 'insurance-policies',
          getData: () => (policies || []).map(p => ({
            id: p.id,
            type: p.policy_type,
            status: p.status,
            coverage: p.coverage_amount || 0,
          })),
        })}
        stats={pageStats}
        emptyMessage="No insurance policies yet"
        emptyAction={{ label: 'Add First Policy', onClick: () => setCreateModalOpen(true) }}
        quickActions={[
          { id: 'permits', label: 'Permits', icon: <FileText className="size-4" />, onClick: () => router.push('/permits') },
          { id: 'compliance', label: 'Compliance', icon: <Shield className="size-4" />, onClick: () => router.push('/compliance') },
        ]}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/insurance/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          }
        }}
        bulkActions={[
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Insurance Policy"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
        record={{ status: 'pending', policy_type: 'general_liability' }}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedPolicy}
        title={(p) => p.policy_name}
        subtitle={(p) => policyTypeLabels[p.policy_type] || p.policy_type}
        sections={detailSections}
        onEdit={(p) => router.push(`/insurance/${p.id}`)}
      />
    </AtlvsAppLayout>
  );
}
