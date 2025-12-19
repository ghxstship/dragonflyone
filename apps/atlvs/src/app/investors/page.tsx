'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, DollarSign, FileText, Building2 } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import { useInvestors, useInvestorStats, useInvestmentRounds } from '../../hooks/useInvestors';
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

interface Investor {
  id: string;
  name: string;
  investor_type: string;
  contact_name?: string;
  contact_email?: string;
  investment_amount: number;
  ownership_percentage?: number;
  status: string;
  commitment_date?: string;
  funding_date?: string;
  round?: { id: string; name: string; round_type: string };
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost'> = {
  funded: 'success',
  committed: 'warning',
  prospect: 'info',
  exited: 'default',
};

const typeLabels: Record<string, string> = {
  individual: 'Individual',
  entity: 'Entity',
  fund: 'Fund',
};

const columns: ListPageColumn<Investor>[] = [
  { 
    key: 'name', 
    label: 'Investor', 
    accessor: 'name', 
    sortable: true,
  },
  { 
    key: 'investor_type', 
    label: 'Type', 
    accessor: 'investor_type', 
    render: (value) => typeLabels[String(value)] || String(value)
  },
  { 
    key: 'round', 
    label: 'Round', 
    accessor: (row) => row.round?.name || '—',
    sortable: true,
    render: (_, row) => row.round ? <Badge>{row.round.name}</Badge> : '—'
  },
  { 
    key: 'investment_amount', 
    label: 'Investment', 
    accessor: 'investment_amount', 
    sortable: true,
    render: (value) => `$${Number(value || 0).toLocaleString()}`
  },
  { 
    key: 'ownership_percentage', 
    label: 'Ownership', 
    accessor: 'ownership_percentage', 
    sortable: true,
    render: (value) => value ? `${value}%` : '—'
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
  { name: 'name', label: 'Investor Name', type: 'text', required: true, placeholder: 'e.g., John Smith or Acme Ventures', colSpan: 2 },
  { name: 'investor_type', label: 'Investor Type', type: 'select', required: true, options: [
    { value: 'individual', label: 'Individual' },
    { value: 'entity', label: 'Entity' },
    { value: 'fund', label: 'Fund' },
  ]},
  { name: 'round_id', label: 'Investment Round', type: 'select', options: [] }, // Populated dynamically
  { name: 'contact_name', label: 'Contact Name', type: 'text', placeholder: 'Primary contact' },
  { name: 'contact_email', label: 'Contact Email', type: 'email', placeholder: 'email@example.com' },
  { name: 'contact_phone', label: 'Contact Phone', type: 'text', placeholder: '+1 (555) 000-0000' },
  { name: 'investment_amount', label: 'Investment Amount', type: 'number', required: true, placeholder: '0.00' },
  { name: 'ownership_percentage', label: 'Ownership %', type: 'number', placeholder: '0.00' },
  { name: 'status', label: 'Status', type: 'select', required: true, options: [
    { value: 'prospect', label: 'Prospect' },
    { value: 'committed', label: 'Committed' },
    { value: 'funded', label: 'Funded' },
    { value: 'exited', label: 'Exited' },
  ]},
  { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2, placeholder: 'Additional notes...' },
];

export default function InvestorsPage() {
  const router = useRouter();
  const { data: investors, isLoading, error, refetch } = useInvestors();
  const { data: stats } = useInvestorStats();
  const { data: rounds } = useInvestmentRounds();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Update form fields with rounds
  const dynamicFormFields = formFields.map(field => {
    if (field.name === 'round_id') {
      return {
        ...field,
        options: [
          { value: '', label: 'No Round' },
          ...(rounds?.map(r => ({ value: r.id, label: r.name })) || []),
        ],
      };
    }
    return field;
  });

  const filters: ListPageFilter[] = [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { value: 'prospect', label: 'Prospect' },
        { value: 'committed', label: 'Committed' },
        { value: 'funded', label: 'Funded' },
        { value: 'exited', label: 'Exited' },
      ]
    },
    { 
      key: 'investor_type', 
      label: 'Type', 
      options: [
        { value: 'individual', label: 'Individual' },
        { value: 'entity', label: 'Entity' },
        { value: 'fund', label: 'Fund' },
      ]
    },
    { 
      key: 'round_id', 
      label: 'Round', 
      options: rounds?.map(r => ({ value: r.id, label: r.name })) || []
    },
  ];

  const rowActions: ListPageAction<Investor>[] = [
    { 
      id: 'view', 
      label: 'View Details', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => router.push(`/investors/${row.id}`) 
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (row) => { setSelectedInvestor(row); setDrawerOpen(true); } 
    },
    { 
      id: 'documents', 
      label: 'Documents', 
      icon: <FileText className="size-4" />, 
      onClick: (row) => router.push(`/investors/documents?investor=${row.id}`) 
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await fetch('/api/investors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setCreateModalOpen(false);
    refetch();
  };

  const pageStats = [
    { label: 'Total Investors', value: stats?.totalInvestors || 0 },
    { label: 'Funded', value: stats?.funded || 0 },
    { label: 'Total Committed', value: `$${(stats?.totalCommitted || 0).toLocaleString()}` },
    { label: 'Total Funded', value: `$${(stats?.totalFunded || 0).toLocaleString()}` },
  ];

  const detailSections: DetailSection[] = selectedInvestor ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Investor</Body>
            <Body>{selectedInvestor.name}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Type</Body>
            <Body>{typeLabels[selectedInvestor.investor_type] || selectedInvestor.investor_type}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Round</Body>
            <Body>{selectedInvestor.round?.name || '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Status</Body>
            <Badge variant={statusColors[selectedInvestor.status] || 'ghost'}>
              {selectedInvestor.status.toUpperCase()}
            </Badge>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'investment',
      title: 'Investment Details',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Investment Amount</Body>
            <Body>${selectedInvestor.investment_amount?.toLocaleString()}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Ownership</Body>
            <Body>{selectedInvestor.ownership_percentage ? `${selectedInvestor.ownership_percentage}%` : '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Commitment Date</Body>
            <Body>{selectedInvestor.commitment_date ? new Date(selectedInvestor.commitment_date).toLocaleDateString() : '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Funding Date</Body>
            <Body>{selectedInvestor.funding_date ? new Date(selectedInvestor.funding_date).toLocaleDateString() : '—'}</Body>
          </Stack>
        </Grid>
      ),
    },
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<Investor, 'id'>>({

    entityType: 'investors',

    requiredFields: ['name', 'investor_type', 'round_id'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/investors', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('investors');


  return (
    <AtlvsAppLayout>
      <ListPage<Investor>
        title="Investors"
        subtitle="Manage investors and investment commitments"
        data={investors || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search investors..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => router.push(`/investors/${row.id}`)}
        createLabel="Add Investor"
        onCreate={() => setCreateModalOpen(true)}
        entityType="investors"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['name', 'investor_type', 'round_id', 'contact_name', 'contact_email', 'contact_phone', 'investment_amount']}
        onExport={createExportHandler({
          filename: 'investors',
          getData: () => (investors || []).map(i => ({
            id: i.id,
            name: i.name,
            type: i.investor_type,
            contact: i.contact_name || '',
            email: i.contact_email || '',
            investment: i.investment_amount,
            status: i.status,
          })),
        })}
        stats={pageStats}
        emptyMessage="No investors yet"
        emptyAction={{ label: 'Add First Investor', onClick: () => setCreateModalOpen(true) }}
        quickActions={[
          { id: 'rounds', label: 'Investment Rounds', icon: <Building2 className="size-4" />, onClick: () => router.push('/investors/rounds') },
          { id: 'documents', label: 'Documents', icon: <FileText className="size-4" />, onClick: () => router.push('/investors/documents') },
          { id: 'reports', label: 'Reports', icon: <DollarSign className="size-4" />, onClick: () => router.push('/investors/reports') },
        ]}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/investors/bulk', {
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
        title="Add Investor"
        fields={dynamicFormFields}
        onSubmit={handleCreate}
        size="lg"
        record={{ status: 'prospect', investor_type: 'individual', investment_amount: 0 }}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedInvestor}
        title={(i) => i.name}
        subtitle={(i) => i.round?.name || 'No round'}
        sections={detailSections}
        onEdit={(i) => router.push(`/investors/${i.id}`)}
      />
    </AtlvsAppLayout>
  );
}
