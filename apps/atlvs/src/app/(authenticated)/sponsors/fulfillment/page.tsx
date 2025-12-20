'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertTriangle, Eye } from 'lucide-react';
import { AtlvsAppLayout } from '../../../../components/app-layout';
import { useSponsors, useCompleteDeliverable } from '../../../../hooks/useSponsors';
import {
  ListPage,
  Badge,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Stack,
  Body,
  Select,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from '@ghxstship/ui';

interface Deliverable {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: string;
  completed_at?: string;
  sponsor_id: string;
  sponsor_name: string;
  tier_name?: string;
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  completed: 'success',
  in_progress: 'warning',
  pending: 'info',
  cancelled: 'error',
};

const columns: ListPageColumn<Deliverable>[] = [
  { 
    key: 'title', 
    label: 'Deliverable', 
    accessor: 'title', 
    sortable: true,
  },
  { 
    key: 'sponsor_name', 
    label: 'Sponsor', 
    accessor: 'sponsor_name', 
    sortable: true,
  },
  { 
    key: 'tier_name', 
    label: 'Tier', 
    accessor: 'tier_name', 
    render: (value) => value ? <Badge>{String(value)}</Badge> : '—'
  },
  { 
    key: 'due_date', 
    label: 'Due Date', 
    accessor: 'due_date', 
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      const date = new Date(String(value));
      const isOverdue = date < new Date() && !value;
      return (
        <Stack direction="horizontal" gap={2} className="items-center">
          {isOverdue && <AlertTriangle className="size-4 text-error" />}
          <Body className={isOverdue ? 'text-error' : ''}>{date.toLocaleDateString()}</Body>
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
      <Badge variant={statusColors[String(value)] || 'solid'}>
        {String(value).replace('_', ' ').toUpperCase()}
      </Badge>
    )
  },
  { 
    key: 'completed_at', 
    label: 'Completed', 
    accessor: 'completed_at', 
    sortable: true,
    render: (value) => value ? new Date(String(value)).toLocaleDateString() : '—'
  },
];

function SponsorFulfillmentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sponsorId = searchParams.get('sponsor');
  
  const { data: sponsors, refetch } = useSponsors();
  const completeDeliverableMutation = useCompleteDeliverable();
  
  const [selectedSponsorId, setSelectedSponsorId] = useState(sponsorId || '');
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [deliverableToComplete, setDeliverableToComplete] = useState<Deliverable | null>(null);

  // Flatten deliverables from all sponsors
  const allDeliverables: Deliverable[] = sponsors?.flatMap(sponsor => 
    (sponsor.deliverables || []).map(d => ({
      ...d,
      sponsor_id: sponsor.id,
      sponsor_name: sponsor.company_name,
      tier_name: sponsor.tier?.name,
    }))
  ) || [];

  // Filter by sponsor if selected
  const filteredDeliverables = selectedSponsorId 
    ? allDeliverables.filter(d => d.sponsor_id === selectedSponsorId)
    : allDeliverables;

  const filters: ListPageFilter[] = [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ]
    },
  ];

  const rowActions: ListPageAction<Deliverable>[] = [
    { 
      id: 'view', 
      label: 'View Details', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => { setSelectedDeliverable(row); setDrawerOpen(true); } 
    },
    { 
      id: 'sponsor', 
      label: 'View Sponsor', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => router.push(`/sponsors/${row.sponsor_id}`) 
    },
    { 
      id: 'complete', 
      label: 'Mark Complete', 
      icon: <CheckCircle className="size-4" />, 
      onClick: (row) => { 
        if (row.status !== 'completed') {
          setDeliverableToComplete(row); 
          setCompleteDialogOpen(true); 
        }
      }
    },
  ];

  const handleComplete = async () => {
    if (deliverableToComplete) {
      await completeDeliverableMutation.mutateAsync({
        id: deliverableToComplete.id,
        sponsorId: deliverableToComplete.sponsor_id,
        completedBy: '', 
      });
      setCompleteDialogOpen(false);
      setDeliverableToComplete(null);
      refetch();
    }
  };

  const stats = [
    { label: 'Total Deliverables', value: allDeliverables.length },
    { label: 'Completed', value: allDeliverables.filter(d => d.status === 'completed').length },
    { label: 'Pending', value: allDeliverables.filter(d => d.status === 'pending').length },
    { label: 'Overdue', value: allDeliverables.filter(d => {
      if (!d.due_date || d.status === 'completed') return false;
      return new Date(d.due_date) < new Date();
    }).length },
  ];

  const detailSections: DetailSection[] = selectedDeliverable ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Sponsor</Body>
            <Body>{selectedDeliverable.sponsor_name}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Tier</Body>
            <Body>{selectedDeliverable.tier_name || '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Due Date</Body>
            <Body>{selectedDeliverable.due_date ? new Date(selectedDeliverable.due_date).toLocaleDateString() : 'No due date'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Status</Body>
            <Badge variant={statusColors[selectedDeliverable.status] || 'ghost'}>
              {selectedDeliverable.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'description',
      title: 'Description',
      content: <Body>{selectedDeliverable.description || 'No description provided.'}</Body>,
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <Stack gap={4}>
        <Select
          value={selectedSponsorId}
          onChange={(e) => {
            setSelectedSponsorId(e.target.value);
            if (e.target.value) {
              router.push(`/sponsors/fulfillment?sponsor=${e.target.value}`);
            } else {
              router.push('/sponsors/fulfillment');
            }
          }}
          className="w-64 border-2 border-grey-300 px-3 py-2"
        >
          <option value="">All Sponsors</option>
          {sponsors?.map(sponsor => (
            <option key={sponsor.id} value={sponsor.id}>{sponsor.company_name}</option>
          ))}
        </Select>
        <ListPage<Deliverable>
          title="Sponsor Fulfillment"
          subtitle="Track and manage sponsor deliverables"
          data={filteredDeliverables}
          columns={columns}
          rowKey="id"
          loading={false}
          searchPlaceholder="Search deliverables..."
          filters={filters}
          rowActions={rowActions}
          onRowClick={(row) => { setSelectedDeliverable(row); setDrawerOpen(true); }}
          stats={stats}
          emptyMessage="No deliverables found"
          onBulkAction={async (action, ids) => {
            if (action === 'delete') {
              await fetch('/api/sponsors/deliverables/bulk', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
              });
              refetch();
            } else if (action === 'complete') {
              await fetch('/api/sponsors/deliverables/bulk-complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
              });
              refetch();
            }
          }}
          bulkActions={[
            { id: 'complete', label: 'Complete Selected', variant: 'default' },
            { id: 'delete', label: 'Delete Selected', variant: 'danger' },
          ]}
        />
      </Stack>

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedDeliverable}
        title={(d) => d.title}
        subtitle={(d) => d.sponsor_name}
        sections={detailSections}
      />

      <ConfirmDialog
        open={completeDialogOpen}
        title="Complete Deliverable"
        message={`Mark "${deliverableToComplete?.title}" as completed?`}
        variant="info"
        confirmLabel="Complete"
        onConfirm={handleComplete}
        onCancel={() => { setCompleteDialogOpen(false); setDeliverableToComplete(null); }}
      />
    </AtlvsAppLayout>
  );
}

export default function SponsorFulfillmentPage() {
  return (
    <Suspense fallback={<Stack className="flex min-h-screen items-center justify-center"><Body>Loading...</Body></Stack>}>
      <SponsorFulfillmentPageContent />
    </Suspense>
  );
}
