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
} from '@ghxstship/ui';
import { DollarSign, Clock, CheckCircle } from 'lucide-react';
import { GvtewayAppLayout } from '../../../components/app-layout';

interface RefundRequest {
  id: string;
  orderNumber: string;
  eventName: string;
  ticketType: string;
  amount: number;
  requestDate: string;
  status: 'pending' | 'approved' | 'denied' | 'processing' | 'completed';
  reason: string;
  resolution: string | null;
}

const DEMO_REFUNDS: RefundRequest[] = [
  {
    id: '1',
    orderNumber: 'ORD-2025-001234',
    eventName: 'Summer Music Festival 2025',
    ticketType: 'VIP Pass',
    amount: 299.99,
    requestDate: '2025-05-15',
    status: 'pending',
    reason: 'Unable to attend due to schedule conflict',
    resolution: null,
  },
  {
    id: '2',
    orderNumber: 'ORD-2025-001189',
    eventName: 'Tech Conference 2025',
    ticketType: 'General Admission',
    amount: 149.99,
    requestDate: '2025-04-20',
    status: 'approved',
    reason: 'Event date changed',
    resolution: 'Full refund approved - processing within 5-7 business days',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-009876',
    eventName: 'Food & Wine Expo',
    ticketType: 'Weekend Pass',
    amount: 199.99,
    requestDate: '2024-02-28',
    status: 'completed',
    reason: 'Event cancelled',
    resolution: 'Refund completed on March 5, 2024',
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-008765',
    eventName: 'Comedy Night',
    ticketType: 'Front Row',
    amount: 89.99,
    requestDate: '2024-01-15',
    status: 'denied',
    reason: 'Changed my mind',
    resolution: 'Refund denied - outside refund policy window (48 hours)',
  },
];

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
  const [refunds] = useState<RefundRequest[]>(DEMO_REFUNDS);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredRefunds = refunds.filter((r) => {
    return statusFilter === 'all' || r.status === statusFilter;
  });

  const pendingCount = refunds.filter((r) => r.status === 'pending').length;
  const approvedCount = refunds.filter((r) => r.status === 'approved' || r.status === 'processing').length;
  const completedCount = refunds.filter((r) => r.status === 'completed').length;
  const totalRefunded = refunds
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + r.amount, 0);

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
                        <Body className="text-body-sm text-on-dark-muted">
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
                          <Body className="text-body-sm text-on-dark-muted">Request Date</Body>
                          <Body className="text-white">{new Date(refund.requestDate).toLocaleDateString()}</Body>
                        </Stack>
                        <Stack gap={0} className="flex-1 ml-8">
                          <Body className="text-body-sm text-on-dark-muted">Reason</Body>
                          <Body className="text-white">{refund.reason}</Body>
                        </Stack>
                      </Stack>
                      {refund.resolution && (
                        <Stack gap={1} className="mt-2 rounded-card bg-ink-800 p-3">
                          <Body className="text-body-sm text-on-dark-muted">Resolution</Body>
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
