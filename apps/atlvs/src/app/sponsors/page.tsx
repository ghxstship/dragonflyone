'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, DollarSign, FileText, CheckCircle, Building2 } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import { useSponsors, useSponsorStats, useSponsorTiers } from '../../hooks/useSponsors';
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

interface Sponsor {
  id: string;
  company_name: string;
  contact_name?: string;
  contact_email?: string;
  status: string;
  contract_value: number;
  payment_status: string;
  amount_paid: number;
  tier?: { id: string; name: string; level: number; price: number };
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost'> = {
  confirmed: 'success',
  active: 'success',
  negotiating: 'warning',
  prospect: 'info',
  completed: 'ghost',
  cancelled: 'error',
};

const paymentColors: Record<string, 'success' | 'warning' | 'error' | 'ghost'> = {
  paid: 'success',
  partial: 'warning',
  pending: 'ghost',
  overdue: 'error',
};

const columns: ListPageColumn<Sponsor>[] = [
  { 
    key: 'company_name', 
    label: 'Company', 
    accessor: 'company_name', 
    sortable: true,
  },
  { 
    key: 'tier', 
    label: 'Tier', 
    accessor: (row) => row.tier?.name || '—',
    sortable: true,
    render: (_, row) => row.tier ? (
      <Badge>{row.tier.name}</Badge>
    ) : '—'
  },
  { 
    key: 'contact_name', 
    label: 'Contact', 
    accessor: 'contact_name', 
    render: (value) => value || '—'
  },
  { 
    key: 'contract_value', 
    label: 'Contract Value', 
    accessor: 'contract_value', 
    sortable: true,
    render: (value) => `$${Number(value || 0).toLocaleString()}`
  },
  { 
    key: 'amount_paid', 
    label: 'Paid', 
    accessor: 'amount_paid', 
    sortable: true,
    render: (value) => `$${Number(value || 0).toLocaleString()}`
  },
  { 
    key: 'payment_status', 
    label: 'Payment', 
    accessor: 'payment_status', 
    sortable: true,
    render: (value) => (
      <Badge variant={paymentColors[String(value)] || 'ghost'}>
        {String(value).toUpperCase()}
      </Badge>
    )
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
  { name: 'company_name', label: 'Company Name', type: 'text', required: true, placeholder: 'e.g., Acme Corp', colSpan: 2 },
  { name: 'sponsor_tier_id', label: 'Sponsor Tier', type: 'select', required: true, options: [] }, // Populated dynamically
  { name: 'status', label: 'Status', type: 'select', required: true, options: [
    { value: 'prospect', label: 'Prospect' },
    { value: 'negotiating', label: 'Negotiating' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ]},
  { name: 'contact_name', label: 'Contact Name', type: 'text', placeholder: 'Primary contact' },
  { name: 'contact_email', label: 'Contact Email', type: 'email', placeholder: 'email@company.com' },
  { name: 'contact_phone', label: 'Contact Phone', type: 'text', placeholder: '+1 (555) 000-0000' },
  { name: 'contract_value', label: 'Contract Value', type: 'number', required: true, placeholder: '0.00' },
  { name: 'website_url', label: 'Website', type: 'url', placeholder: 'https://...' },
  { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2, placeholder: 'Additional notes...' },
];

export default function SponsorsPage() {
  const router = useRouter();
  const { data: sponsors, isLoading, error, refetch } = useSponsors();
  const { data: stats } = useSponsorStats();
  const { data: tiers } = useSponsorTiers();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Update form fields with tiers
  const dynamicFormFields = formFields.map(field => {
    if (field.name === 'sponsor_tier_id') {
      return {
        ...field,
        options: tiers?.map(t => ({ value: t.id, label: `${t.name} ($${t.price.toLocaleString()})` })) || [],
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
        { value: 'negotiating', label: 'Negotiating' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
      ]
    },
    { 
      key: 'payment_status', 
      label: 'Payment', 
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'partial', label: 'Partial' },
        { value: 'paid', label: 'Paid' },
        { value: 'overdue', label: 'Overdue' },
      ]
    },
    { 
      key: 'sponsor_tier_id', 
      label: 'Tier', 
      options: tiers?.map(t => ({ value: t.id, label: t.name })) || []
    },
  ];

  const rowActions: ListPageAction<Sponsor>[] = [
    { 
      id: 'view', 
      label: 'View Details', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => router.push(`/sponsors/${row.id}`) 
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (row) => { setSelectedSponsor(row); setDrawerOpen(true); } 
    },
    { 
      id: 'payment', 
      label: 'Record Payment', 
      icon: <DollarSign className="size-4" />, 
      onClick: (row) => router.push(`/sponsors/${row.id}?action=payment`) 
    },
    { 
      id: 'deliverables', 
      label: 'Deliverables', 
      icon: <CheckCircle className="size-4" />, 
      onClick: (row) => router.push(`/sponsors/fulfillment?sponsor=${row.id}`) 
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await fetch('/api/sponsors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setCreateModalOpen(false);
    refetch();
  };

  const pageStats = [
    { label: 'Total Sponsors', value: stats?.total || 0 },
    { label: 'Confirmed', value: stats?.confirmed || 0 },
    { label: 'Total Value', value: `$${(stats?.totalValue || 0).toLocaleString()}` },
    { label: 'Outstanding', value: `$${(stats?.outstanding || 0).toLocaleString()}` },
  ];

  const detailSections: DetailSection[] = selectedSponsor ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Company</Body>
            <Body>{selectedSponsor.company_name}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Tier</Body>
            <Body>{selectedSponsor.tier?.name || '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Contact</Body>
            <Body>{selectedSponsor.contact_name || '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Email</Body>
            <Body>{selectedSponsor.contact_email || '—'}</Body>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'financials',
      title: 'Financials',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Contract Value</Body>
            <Body>${selectedSponsor.contract_value?.toLocaleString()}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Amount Paid</Body>
            <Body>${selectedSponsor.amount_paid?.toLocaleString()}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Outstanding</Body>
            <Body>${((selectedSponsor.contract_value || 0) - (selectedSponsor.amount_paid || 0)).toLocaleString()}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Payment Status</Body>
            <Badge variant={paymentColors[selectedSponsor.payment_status] || 'ghost'}>
              {selectedSponsor.payment_status.toUpperCase()}
            </Badge>
          </Stack>
        </Grid>
      ),
    },
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<Sponsor, 'id'>>({

    entityType: 'sponsors',

    requiredFields: ['company_name', 'sponsor_tier_id', 'status'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/sponsors', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('sponsors');


  return (
    <AtlvsAppLayout>
      <ListPage<Sponsor>
        title="Sponsors"
        subtitle="Manage sponsors, contracts, and deliverables"
        data={sponsors || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search sponsors..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => router.push(`/sponsors/${row.id}`)}
        createLabel="Add Sponsor"
        onCreate={() => setCreateModalOpen(true)}
        entityType="sponsors"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['company_name', 'sponsor_tier_id', 'status', 'contact_name', 'contact_email', 'contact_phone', 'contract_value']}
        onExport={createExportHandler({
          filename: 'sponsors',
          getData: () => (sponsors || []).map(s => ({
            id: s.id,
            company: s.company_name,
            contact: s.contact_name || '',
            email: s.contact_email || '',
            status: s.status,
            contract_value: s.contract_value,
          })),
        })}
        stats={pageStats}
        emptyMessage="No sponsors yet"
        emptyAction={{ label: 'Add First Sponsor', onClick: () => setCreateModalOpen(true) }}
        quickActions={[
          { id: 'tiers', label: 'Manage Tiers', icon: <Building2 className="size-4" />, onClick: () => router.push('/sponsors/tiers') },
          { id: 'deck', label: 'Sponsorship Deck', icon: <FileText className="size-4" />, onClick: () => router.push('/sponsors/deck') },
          { id: 'fulfillment', label: 'Fulfillment', icon: <CheckCircle className="size-4" />, onClick: () => router.push('/sponsors/fulfillment') },
        ]}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/sponsors/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          } else if (action === 'archive') {
            await fetch('/api/sponsors/bulk-archive', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          }
        }}
        bulkActions={[
          { id: 'archive', label: 'Archive Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Sponsor"
        fields={dynamicFormFields}
        onSubmit={handleCreate}
        size="lg"
        record={{ status: 'prospect', payment_status: 'pending', contract_value: 0, amount_paid: 0 }}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedSponsor}
        title={(s) => s.company_name}
        subtitle={(s) => s.tier?.name || 'No tier'}
        sections={detailSections}
        onEdit={(s) => router.push(`/sponsors/${s.id}`)}
      />
    </AtlvsAppLayout>
  );
}
