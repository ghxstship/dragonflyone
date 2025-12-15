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
  Spinner,
  EmptyState,
} from '@ghxstship/ui';
import { DollarSign, Clock, CheckCircle, RotateCcw } from 'lucide-react';
import { GvtewayAppLayout } from '../../../components/app-layout';
import { useRefunds } from '@/hooks/useRefunds';
import { useRouter } from 'next/navigation';

const statusVariants: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
  pending: 'warning',
  approved: 'info',
  denied: 'error',
  processing: 'info',
  completed: 'success',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  denied: 'Denied',
  processing: 'Processing',
  completed: 'Completed',
};

export default function MyRefundsPage() {
  const router = useRouter();
  const { data: refundsData, isLoading, error } = useRefunds();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Transform refunds to expected format
  const refunds = (refundsData || []).map(refund => ({
    id: refund.id,
    orderNumber: refund.order_id,
    eventName: refund.order?.event?.name || 'Event',
    ticketType: 'Ticket',
    amount: refund.refund_amount,
    requestDate: refund.submitted_at,
    status: refund.status,
    reason: refund.reason,
    resolution: refund.resolution_notes || null,
  }));

  const filteredRefunds = refunds.filter((r) => {
    return statusFilter === 'all' || r.status === statusFilter;
  });

  const pendingCount = refunds.filter((r) => r.status === 'pending').length;
  const approvedCount = refunds.filter((r) => r.status === 'approved' || r.status === 'processing').length;
  const completedCount = refunds.filter((r) => r.status === 'completed').length;
  const totalRefunded = refunds
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + r.amount, 0);

  if (isLoading) {
    return (
      <GvtewayAppLayout>
        <Stack gap={8}>
          <SectionHeader kicker="My Account" title="Refund Requests" description="Track the status of your refund requests" colorScheme="on-dark" />
          <Stack className="flex items-center justify-center py-20">
            <Spinner variant="grey" size="lg" text="Loading refunds..." />
          </Stack>
        </Stack>
      </GvtewayAppLayout>
    );
  }

  if (error) {
    return (
      <GvtewayAppLayout>
        <Stack gap={8}>
          <SectionHeader kicker="My Account" title="Refund Requests" description="Track the status of your refund requests" colorScheme="on-dark" />
          <EmptyState
            icon={<RotateCcw size={48} />}
            title="Unable to load refunds"
            description="There was a problem loading your refund requests. Please try again."
            inverted
          />
        </Stack>
      </GvtewayAppLayout>
    );
  }

  if (refunds.length === 0) {
    return (
      <GvtewayAppLayout>
        <Stack gap={8}>
          <SectionHeader kicker="My Account" title="Refund Requests" description="Track the status of your refund requests" colorScheme="on-dark" />
          <EmptyState
            icon={<RotateCcw size={48} />}
            title="No refund requests"
            description="You haven't submitted any refund requests yet."
            action={{ label: "View Orders", onClick: () => router.push('/account/orders') }}
            inverted
          />
        </Stack>
      </GvtewayAppLayout>
    );
  }

  return (
    <GvtewayAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="My Account"
          title="Refund Requests"
          description="Track the status of your refund requests"
          colorScheme="on-dark"
        />

        <Grid cols={4} gap={4}>
          <StatCard label="Pending" value={pendingCount.toString()} icon={<Clock size={20} />} inverted />
          <StatCard label="Approved" value={approvedCount.toString()} icon={<CheckCircle size={20} />} inverted />
          <StatCard label="Completed" value={completedCount.toString()} icon={<DollarSign size={20} />} inverted />
          <StatCard label="Total Refunded" value={`$${totalRefunded.toFixed(2)}`} icon={<DollarSign size={20} />} inverted />
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <H3 className="text-white">All Refund Requests</H3>
                <Stack direction="horizontal" gap={2}>
                  <Button
                    variant={statusFilter === 'all' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === 'pending' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={statusFilter === 'completed' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('completed')}
                  >
                    Completed
                  </Button>
                </Stack>
              </Stack>

              <Stack gap={3}>
                {filteredRefunds.map((refund) => (
                  <Stack key={refund.id} className="rounded-card border-2 border-ink-700 p-4">
                    <Stack direction="horizontal" className="items-start justify-between">
                      <Stack gap={1}>
                        <Body className="font-weight-semibold text-white">{refund.eventName}</Body>
                        <Body size="sm" className="text-on-dark-muted">
                          {refund.orderNumber} - {refund.ticketType}
                        </Body>
                      </Stack>
                      <Stack gap={1} className="items-end">
                        <Badge variant={statusVariants[refund.status]}>
                          {statusLabels[refund.status]}
                        </Badge>
                        <Body className="font-weight-semibold text-white">${refund.amount.toFixed(2)}</Body>
                      </Stack>
                    </Stack>
                    <Stack gap={2} className="mt-3 border-t border-ink-700 pt-3">
                      <Stack direction="horizontal" className="justify-between">
                        <Stack gap={0}>
                          <Body size="sm" className="text-on-dark-muted">Request Date</Body>
                          <Body className="text-white">{new Date(refund.requestDate).toLocaleDateString()}</Body>
                        </Stack>
                        <Stack gap={0} className="flex-1 ml-8">
                          <Body size="sm" className="text-on-dark-muted">Reason</Body>
                          <Body className="text-white">{refund.reason}</Body>
                        </Stack>
                      </Stack>
                      {refund.resolution && (
                        <Stack gap={1} className="mt-2 rounded-card bg-ink-800 p-3">
                          <Body size="sm" className="text-on-dark-muted">Resolution</Body>
                          <Body className="text-white">{refund.resolution}</Body>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                ))}
                {filteredRefunds.length === 0 && (
                  <Body className="text-center text-on-dark-muted py-8">No refund requests found</Body>
                )}
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </GvtewayAppLayout>
  );
}
