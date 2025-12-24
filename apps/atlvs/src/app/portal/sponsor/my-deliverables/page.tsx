'use client';

import { useState } from 'react';
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  Grid,
  Badge,
  Button,
  Body,
  H3,
  StatCard,
  ProgressBar,
  Skeleton,
} from '@ghxstship/ui';
import { CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import { AtlvsAppLayout } from '../../../../components/app-layout';
import { useSponsorDeliverables, type SponsorDeliverable } from '@ghxstship/config';

interface DisplayDeliverable {
  id: string;
  name: string;
  category: string;
  event: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  progress: number;
  assignee: string;
  notes: string;
}

const DEMO_DELIVERABLES: DisplayDeliverable[] = [
  {
    id: '1',
    name: 'Logo Placement - Main Stage Banner',
    category: 'Branding',
    event: 'Summer Music Festival 2025',
    dueDate: '2025-06-01',
    status: 'completed',
    progress: 100,
    assignee: 'Production Team',
    notes: 'Approved and installed',
  },
  {
    id: '2',
    name: 'VIP Lounge Setup',
    category: 'Hospitality',
    event: 'Summer Music Festival 2025',
    dueDate: '2025-06-10',
    status: 'in_progress',
    progress: 65,
    assignee: 'Venue Operations',
    notes: 'Furniture ordered, awaiting delivery',
  },
  {
    id: '3',
    name: 'Social Media Mentions (10x)',
    category: 'Digital',
    event: 'Summer Music Festival 2025',
    dueDate: '2025-06-15',
    status: 'in_progress',
    progress: 40,
    assignee: 'Marketing Team',
    notes: '4 of 10 posts completed',
  },
];

const typeToCategory: Record<string, string> = {
  logo_placement: 'Branding',
  signage: 'Branding',
  digital: 'Digital',
  activation: 'Activation',
  hospitality: 'Hospitality',
  merchandise: 'Merchandise',
  content: 'Content',
  other: 'Other',
};

const statusVariants: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
  pending: 'info',
  in_progress: 'warning',
  completed: 'success',
  delivered: 'success',
  approved: 'success',
  rejected: 'error',
  overdue: 'error',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  delivered: 'Delivered',
  approved: 'Approved',
  rejected: 'Rejected',
  overdue: 'Overdue',
};

export default function MyDeliverablesPage() {
  const { deliverables: apiDeliverables, isLoading, error, refetch } = useSponsorDeliverables();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Map API deliverables to display format or fall back to demo data
  const deliverables: DisplayDeliverable[] = apiDeliverables.length > 0
    ? apiDeliverables.map((d: SponsorDeliverable) => ({
        id: d.id,
        name: d.title,
        category: typeToCategory[d.deliverable_type] || 'Other',
        event: d.sponsor?.company_name || 'Unknown Event',
        dueDate: d.due_date || '',
        status: (d.status === 'delivered' || d.status === 'approved' ? 'completed' : d.status === 'rejected' ? 'overdue' : d.status) as DisplayDeliverable['status'],
        progress: d.status === 'delivered' || d.status === 'approved' ? 100 : d.status === 'in_progress' ? 50 : 0,
        assignee: 'Team',
        notes: d.notes || '',
      }))
    : DEMO_DELIVERABLES;

  const filteredDeliverables = deliverables.filter((d) => {
    return categoryFilter === 'all' || d.category === categoryFilter;
  });

  const completedCount = deliverables.filter((d) => d.status === 'completed').length;
  const inProgressCount = deliverables.filter((d) => d.status === 'in_progress').length;
  const overdueCount = deliverables.filter((d) => d.status === 'overdue').length;
  const categories = [...new Set(deliverables.map((d) => d.category))];

  if (isLoading) {
    return (
      <AtlvsAppLayout>
        <Stack gap={8}>
          <SectionHeader kicker="Sponsor Portal" title="My Deliverables" description="Track the status of your sponsorship deliverables" colorScheme="on-dark" />
          <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} inverted className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24" />
              </Card>
            ))}
          </Grid>
        </Stack>
      </AtlvsAppLayout>
    );
  }

  if (error) {
    return (
      <AtlvsAppLayout>
        <Stack gap={8}>
          <SectionHeader kicker="Sponsor Portal" title="My Deliverables" description="Track the status of your sponsorship deliverables" colorScheme="on-dark" />
          <Card inverted className="p-8 text-center">
            <Stack gap={4} className="items-center">
              <AlertCircle size={48} className="text-error" />
              <H3 className="text-white">Failed to Load Deliverables</H3>
              <Body className="text-grey-300">{error.message}</Body>
              <Button variant="solid" onClick={() => refetch()}>
                Try Again
              </Button>
            </Stack>
          </Card>
        </Stack>
      </AtlvsAppLayout>
    );
  }

  return (
    <AtlvsAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Sponsor Portal"
          title="My Deliverables"
          description="Track the status of your sponsorship deliverables"
          colorScheme="on-dark"
        />

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total" value={deliverables.length.toString()} icon={<FileText size={20} />} inverted />
          <StatCard label="Completed" value={completedCount.toString()} icon={<CheckCircle size={20} />} inverted />
          <StatCard label="In Progress" value={inProgressCount.toString()} icon={<Clock size={20} />} inverted />
          <StatCard label="Overdue" value={overdueCount.toString()} icon={<AlertCircle size={20} />} inverted />
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <H3 className="text-white">All Deliverables</H3>
                <Stack direction="horizontal" gap={2}>
                  <Button
                    variant={categoryFilter === 'all' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter('all')}
                  >
                    All
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={categoryFilter === cat ? 'solid' : 'outline'}
                      size="sm"
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </Stack>
              </Stack>

              <Stack gap={3}>
                {filteredDeliverables.map((deliverable) => (
                  <Stack key={deliverable.id} className="rounded border-2 border-ink-700 p-4">
                    <Stack direction="horizontal" className="items-start justify-between">
                      <Stack gap={1}>
                        <Body className="font-weight-semibold text-white">{deliverable.name}</Body>
                        <Stack direction="horizontal" gap={2}>
                          <Badge variant="info">{deliverable.category}</Badge>
                          <Body size="sm" className=" text-on-dark-muted">{deliverable.event}</Body>
                        </Stack>
                      </Stack>
                      <Badge variant={statusVariants[deliverable.status]}>
                        {statusLabels[deliverable.status]}
                      </Badge>
                    </Stack>
                    <Stack gap={2} className="mt-3 border-t border-ink-700 pt-3">
                      <Stack direction="horizontal" className="justify-between">
                        <Body className="text-on-dark-muted">Progress</Body>
                        <Body className="text-white">{deliverable.progress}%</Body>
                      </Stack>
                      <ProgressBar value={deliverable.progress} />
                      <Stack direction="horizontal" className="justify-between">
                        <Stack gap={0}>
                          <Body size="sm" className=" text-on-dark-muted">Due Date</Body>
                          <Body className="text-white">{new Date(deliverable.dueDate).toLocaleDateString()}</Body>
                        </Stack>
                        <Stack gap={0}>
                          <Body size="sm" className=" text-on-dark-muted">Assignee</Body>
                          <Body className="text-white">{deliverable.assignee}</Body>
                        </Stack>
                        <Stack gap={0}>
                          <Body size="sm" className=" text-on-dark-muted">Notes</Body>
                          <Body className="text-white">{deliverable.notes}</Body>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                ))}
                {filteredDeliverables.length === 0 && (
                  <Body className="text-center text-on-dark-muted py-8">No deliverables found</Body>
                )}
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </AtlvsAppLayout>
  );
}
