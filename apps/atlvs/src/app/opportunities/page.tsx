'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import { useOpportunities, useCreateOpportunity, useDeleteOpportunity } from '../../hooks/useOpportunities';
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
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';

interface Opportunity {
  id: string;
  name: string;
  type: string;
  stage: string;
  value: number;
  probability: number;
  expected_close_date: string;
  contact?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  owner?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

const stageColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'solid' | 'outline'> = {
  identified: 'outline',
  qualified: 'info',
  proposal: 'warning',
  negotiation: 'solid',
  closed_won: 'success',
  closed_lost: 'error',
};

const typeLabels: Record<string, string> = {
  new_business: 'New Business',
  upsell: 'Upsell',
  cross_sell: 'Cross-sell',
  renewal: 'Renewal',
  expansion: 'Expansion',
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const columns: ListPageColumn<Opportunity>[] = [
  {
    key: 'name',
    label: 'Opportunity',
    accessor: 'name',
    sortable: true,
  },
  {
    key: 'contact',
    label: 'Contact',
    accessor: (row) => row.contact ? `${row.contact.first_name} ${row.contact.last_name}` : '—',
  },
  {
    key: 'type',
    label: 'Type',
    accessor: 'type',
    render: (value) => (
      <Badge variant="outline">
        {typeLabels[String(value)] || String(value)}
      </Badge>
    ),
  },
  {
    key: 'value',
    label: 'Value',
    accessor: 'value',
    sortable: true,
    render: (value) => formatCurrency(Number(value) || 0),
  },
  {
    key: 'probability',
    label: 'Probability',
    accessor: 'probability',
    render: (value) => `${value}%`,
  },
  {
    key: 'stage',
    label: 'Stage',
    accessor: 'stage',
    sortable: true,
    render: (value) => (
      <Badge variant={stageColors[String(value)] || 'outline'}>
        {String(value).replace(/_/g, ' ').toUpperCase()}
      </Badge>
    ),
  },
  {
    key: 'expected_close_date',
    label: 'Expected Close',
    accessor: 'expected_close_date',
    sortable: true,
    render: (value) => value ? new Date(String(value)).toLocaleDateString() : '—',
  },
];

const filters: ListPageFilter[] = [
  {
    key: 'stage',
    label: 'Stage',
    options: [
      { value: 'identified', label: 'Identified' },
      { value: 'qualified', label: 'Qualified' },
      { value: 'proposal', label: 'Proposal' },
      { value: 'negotiation', label: 'Negotiation' },
      { value: 'closed_won', label: 'Closed Won' },
      { value: 'closed_lost', label: 'Closed Lost' },
    ],
  },
  {
    key: 'type',
    label: 'Type',
    options: [
      { value: 'new_business', label: 'New Business' },
      { value: 'upsell', label: 'Upsell' },
      { value: 'cross_sell', label: 'Cross-sell' },
      { value: 'renewal', label: 'Renewal' },
      { value: 'expansion', label: 'Expansion' },
    ],
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Opportunity Name', type: 'text', required: true, colSpan: 2 },
  { name: 'contact_id', label: 'Contact', type: 'select', required: true, options: [] },
  { name: 'owner_id', label: 'Owner', type: 'select', required: true, options: [] },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    required: true,
    options: [
      { value: 'new_business', label: 'New Business' },
      { value: 'upsell', label: 'Upsell' },
      { value: 'cross_sell', label: 'Cross-sell' },
      { value: 'renewal', label: 'Renewal' },
      { value: 'expansion', label: 'Expansion' },
    ],
  },
  {
    name: 'stage',
    label: 'Stage',
    type: 'select',
    required: true,
    options: [
      { value: 'identified', label: 'Identified' },
      { value: 'qualified', label: 'Qualified' },
      { value: 'proposal', label: 'Proposal' },
      { value: 'negotiation', label: 'Negotiation' },
    ],
  },
  { name: 'value', label: 'Value ($)', type: 'number', required: true },
  { name: 'probability', label: 'Probability (%)', type: 'number', required: true },
  { name: 'expected_close_date', label: 'Expected Close Date', type: 'date', required: true },
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
  { name: 'next_step', label: 'Next Step', type: 'text', colSpan: 2 },
];

export default function OpportunitiesPage() {
  const router = useRouter();
  const { data: response, isLoading, error, refetch } = useOpportunities();
  const createMutation = useCreateOpportunity();
  const deleteMutation = useDeleteOpportunity();

  const opportunities = (response?.opportunities || []) as Opportunity[];
  const summary = response?.summary;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] = useState<Opportunity | null>(null);

  const rowActions: ListPageAction<Opportunity>[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: <Eye className="size-4" />,
      onClick: (row) => {
        setSelectedOpportunity(row);
        setDrawerOpen(true);
      },
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Pencil className="size-4" />,
      onClick: (row) => router.push(`/opportunities/${row.id}/edit`),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="size-4" />,
      variant: 'danger',
      onClick: (row) => {
        setOpportunityToDelete(row);
        setDeleteConfirmOpen(true);
      },
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createMutation.mutateAsync({
      name: String(data.name),
      contact_id: String(data.contact_id),
      owner_id: String(data.owner_id),
      type: data.type as Opportunity['type'],
      stage: data.stage as Opportunity['stage'],
      value: Number(data.value),
      probability: Number(data.probability),
      expected_close_date: String(data.expected_close_date),
      description: data.description ? String(data.description) : undefined,
      next_step: data.next_step ? String(data.next_step) : undefined,
    });
    setCreateModalOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    if (opportunityToDelete) {
      await deleteMutation.mutateAsync(opportunityToDelete.id);
      setDeleteConfirmOpen(false);
      setOpportunityToDelete(null);
      refetch();
    }
  };

  const stats = [
    { label: 'Total Opportunities', value: summary?.total_opportunities || 0 },
    { label: 'Pipeline Value', value: formatCurrency(summary?.total_value || 0) },
    { label: 'Weighted Value', value: formatCurrency(summary?.weighted_value || 0) },
    { label: 'Avg Probability', value: `${summary?.average_probability || 0}%` },
  ];

  const detailSections: DetailSection[] = selectedOpportunity
    ? [
        {
          id: 'overview',
          title: 'Opportunity Details',
          content: (
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Body size="sm"><strong>Name:</strong> {selectedOpportunity.name}</Body>
              <Body size="sm"><strong>Type:</strong> {typeLabels[selectedOpportunity.type] || selectedOpportunity.type}</Body>
              <Body size="sm"><strong>Stage:</strong> {selectedOpportunity.stage.replace(/_/g, ' ')}</Body>
              <Body size="sm"><strong>Value:</strong> {formatCurrency(selectedOpportunity.value)}</Body>
              <Body size="sm"><strong>Probability:</strong> {selectedOpportunity.probability}%</Body>
              <Body size="sm"><strong>Expected Close:</strong> {new Date(selectedOpportunity.expected_close_date).toLocaleDateString()}</Body>
              <Body size="sm"><strong>Contact:</strong> {selectedOpportunity.contact ? `${selectedOpportunity.contact.first_name} ${selectedOpportunity.contact.last_name}` : '—'}</Body>
              <Body size="sm"><strong>Owner:</strong> {selectedOpportunity.owner ? `${selectedOpportunity.owner.first_name} ${selectedOpportunity.owner.last_name}` : '—'}</Body>
            </Grid>
          ),
        },
      ]
    : [];

  return (
    <AtlvsAppLayout>
      <ListPage
        title="Opportunities"
        description="Manage your sales pipeline and opportunities"
        icon={<TrendingUp className="size-6" />}
        data={opportunities}
        columns={columns}
        filters={filters}
        rowActions={rowActions}
        stats={stats}
        loading={isLoading}
        error={error?.message}
        onRefresh={refetch}
        onCreate={() => setCreateModalOpen(true)}
        createLabel="Add Opportunity"
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Opportunity"
        fields={formFields}
        onSubmit={handleCreate}
        loading={createMutation.isPending}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedOpportunity?.name || 'Opportunity Details'}
        sections={detailSections}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Opportunity"
        message={`Are you sure you want to delete "${opportunityToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </AtlvsAppLayout>
  );
}
