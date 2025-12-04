'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Users, DollarSign, TrendingUp } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { useInvestmentRounds, useCreateInvestmentRound, useUpdateInvestmentRound, useInvestors } from '../../../hooks/useInvestors';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  Grid,
  Stack,
  Body,
  Box,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';

interface InvestmentRound {
  id: string;
  name: string;
  round_type: string;
  target_amount: number;
  minimum_investment: number;
  raised_amount: number;
  status: string;
  open_date?: string;
  close_date?: string;
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  closed: 'success',
  closing: 'warning',
  open: 'info',
  planning: 'default',
};

const roundTypeLabels: Record<string, string> = {
  seed: 'Seed',
  series_a: 'Series A',
  series_b: 'Series B',
  bridge: 'Bridge',
  other: 'Other',
};

const columns: ListPageColumn<InvestmentRound>[] = [
  { 
    key: 'name', 
    label: 'Round Name', 
    accessor: 'name', 
    sortable: true,
  },
  { 
    key: 'round_type', 
    label: 'Type', 
    accessor: 'round_type', 
    render: (value) => roundTypeLabels[String(value)] || String(value)
  },
  { 
    key: 'target_amount', 
    label: 'Target', 
    accessor: 'target_amount', 
    sortable: true,
    render: (value) => `$${Number(value || 0).toLocaleString()}`
  },
  { 
    key: 'raised_amount', 
    label: 'Raised', 
    accessor: 'raised_amount', 
    sortable: true,
    render: (value, row) => {
      const raised = Number(value || 0);
      const target = row.target_amount || 1;
      const percentage = Math.round((raised / target) * 100);
      return (
        <Stack gap={1}>
          <Body>${raised.toLocaleString()}</Body>
          <Body className="text-body-sm text-grey-500">{percentage}% of target</Body>
        </Stack>
      );
    }
  },
  { 
    key: 'minimum_investment', 
    label: 'Minimum', 
    accessor: 'minimum_investment', 
    render: (value) => `$${Number(value || 0).toLocaleString()}`
  },
  { 
    key: 'status', 
    label: 'Status', 
    accessor: 'status', 
    sortable: true,
    render: (value) => (
      <Badge variant={statusColors[String(value)] || 'default'}>
        {String(value).toUpperCase()}
      </Badge>
    )
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Round Name', type: 'text', required: true, placeholder: 'e.g., Seed Round', colSpan: 2 },
  { name: 'round_type', label: 'Round Type', type: 'select', required: true, options: [
    { value: 'seed', label: 'Seed' },
    { value: 'series_a', label: 'Series A' },
    { value: 'series_b', label: 'Series B' },
    { value: 'bridge', label: 'Bridge' },
    { value: 'other', label: 'Other' },
  ]},
  { name: 'status', label: 'Status', type: 'select', required: true, options: [
    { value: 'planning', label: 'Planning' },
    { value: 'open', label: 'Open' },
    { value: 'closing', label: 'Closing' },
    { value: 'closed', label: 'Closed' },
  ]},
  { name: 'target_amount', label: 'Target Amount', type: 'number', required: true, placeholder: '0.00' },
  { name: 'minimum_investment', label: 'Minimum Investment', type: 'number', required: true, placeholder: '0.00' },
  { name: 'open_date', label: 'Open Date', type: 'date' },
  { name: 'close_date', label: 'Close Date', type: 'date' },
  { name: 'terms', label: 'Terms', type: 'textarea', colSpan: 2, placeholder: 'Investment terms...' },
];

export default function InvestmentRoundsPage() {
  const router = useRouter();
  const { data: rounds, isLoading, error, refetch } = useInvestmentRounds();
  const { data: investors } = useInvestors();
  const createMutation = useCreateInvestmentRound();
  const updateMutation = useUpdateInvestmentRound();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRound, setSelectedRound] = useState<InvestmentRound | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Count investors per round
  const investorCounts = rounds?.reduce((acc, round) => {
    acc[round.id] = investors?.filter(i => i.round_id === round.id).length || 0;
    return acc;
  }, {} as Record<string, number>) || {};

  const filters: ListPageFilter[] = [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { value: 'planning', label: 'Planning' },
        { value: 'open', label: 'Open' },
        { value: 'closing', label: 'Closing' },
        { value: 'closed', label: 'Closed' },
      ]
    },
    { 
      key: 'round_type', 
      label: 'Type', 
      options: [
        { value: 'seed', label: 'Seed' },
        { value: 'series_a', label: 'Series A' },
        { value: 'series_b', label: 'Series B' },
        { value: 'bridge', label: 'Bridge' },
        { value: 'other', label: 'Other' },
      ]
    },
  ];

  const rowActions: ListPageAction<InvestmentRound>[] = [
    { 
      id: 'view', 
      label: 'View Details', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => { setSelectedRound(row); setDrawerOpen(true); } 
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (row) => { setSelectedRound(row); setEditModalOpen(true); } 
    },
    { 
      id: 'investors', 
      label: 'View Investors', 
      icon: <Users className="size-4" />, 
      onClick: (row) => router.push(`/investors?round=${row.id}`) 
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createMutation.mutateAsync({
      ...data,
      production_id: 'current-production-id', // TODO: Get from context
      raised_amount: 0,
    } as InvestmentRound);
    setCreateModalOpen(false);
    refetch();
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (selectedRound) {
      await updateMutation.mutateAsync({ id: selectedRound.id, ...data } as InvestmentRound & { id: string });
      setEditModalOpen(false);
      setSelectedRound(null);
      refetch();
    }
  };

  const stats = [
    { label: 'Total Rounds', value: rounds?.length || 0 },
    { label: 'Open', value: rounds?.filter(r => r.status === 'open').length || 0 },
    { label: 'Total Target', value: `$${(rounds?.reduce((sum, r) => sum + (r.target_amount || 0), 0) || 0).toLocaleString()}` },
    { label: 'Total Raised', value: `$${(rounds?.reduce((sum, r) => sum + (r.raised_amount || 0), 0) || 0).toLocaleString()}` },
  ];

  const detailSections: DetailSection[] = selectedRound ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Type</Body>
            <Body>{roundTypeLabels[selectedRound.round_type] || selectedRound.round_type}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Status</Body>
            <Badge variant={statusColors[selectedRound.status] || 'default'}>
              {selectedRound.status.toUpperCase()}
            </Badge>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Investors</Body>
            <Body>{investorCounts[selectedRound.id] || 0}</Body>
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
            <Body className="text-body-sm text-grey-500">Target Amount</Body>
            <Body>${selectedRound.target_amount?.toLocaleString()}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Raised Amount</Body>
            <Body>${selectedRound.raised_amount?.toLocaleString()}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Minimum Investment</Body>
            <Body>${selectedRound.minimum_investment?.toLocaleString()}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Progress</Body>
            <Box className="h-2 overflow-hidden rounded-badge bg-grey-200">
              <Box 
                className="h-full bg-success" 
                style={{ width: `${Math.min(100, (selectedRound.raised_amount / selectedRound.target_amount) * 100)}%` }} 
              />
            </Box>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'dates',
      title: 'Timeline',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Open Date</Body>
            <Body>{selectedRound.open_date ? new Date(selectedRound.open_date).toLocaleDateString() : 'Not set'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Close Date</Body>
            <Body>{selectedRound.close_date ? new Date(selectedRound.close_date).toLocaleDateString() : 'Not set'}</Body>
          </Stack>
        </Grid>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<InvestmentRound>
        title="Investment Rounds"
        subtitle="Manage fundraising rounds and targets"
        data={rounds || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search rounds..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => { setSelectedRound(row); setDrawerOpen(true); }}
        createLabel="New Round"
        onCreate={() => setCreateModalOpen(true)}
        stats={stats}
        emptyMessage="No investment rounds yet"
        emptyAction={{ label: 'Create First Round', onClick: () => setCreateModalOpen(true) }}
        breadcrumbs={[
          { label: 'ATLVS', href: '/dashboard' }, 
          { label: 'Investors', href: '/investors' },
          { label: 'Rounds' }
        ]}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Investment Round"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
        defaultValues={{ status: 'planning', round_type: 'seed', target_amount: 0, minimum_investment: 0 }}
      />

      <RecordFormModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedRound(null); }}
        mode="edit"
        title="Edit Investment Round"
        fields={formFields}
        onSubmit={handleUpdate}
        size="lg"
        defaultValues={selectedRound || {}}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRound}
        title={(r) => r.name}
        subtitle={(r) => roundTypeLabels[r.round_type] || r.round_type}
        sections={detailSections}
        onEdit={(r) => { setSelectedRound(r); setEditModalOpen(true); setDrawerOpen(false); }}
      />
    </AtlvsAppLayout>
  );
}
