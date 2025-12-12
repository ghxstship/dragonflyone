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
import { ArrowRightLeft, Clock, Send, Inbox } from 'lucide-react';
import { GvtewayAppLayout } from '../../../components/app-layout';

interface Transfer {
  id: string;
  orderNumber: string;
  eventName: string;
  ticketType: string;
  quantity: number;
  direction: 'sent' | 'received';
  otherParty: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
}

const DEMO_TRANSFERS: Transfer[] = [
  {
    id: '1',
    orderNumber: 'ORD-2025-001234',
    eventName: 'Summer Music Festival 2025',
    ticketType: 'VIP Pass',
    quantity: 2,
    direction: 'sent',
    otherParty: 'john.doe@email.com',
    date: '2025-05-20',
    status: 'completed',
  },
  {
    id: '2',
    orderNumber: 'ORD-2025-001456',
    eventName: 'Tech Conference 2025',
    ticketType: 'General Admission',
    quantity: 1,
    direction: 'received',
    otherParty: 'jane.smith@email.com',
    date: '2025-04-15',
    status: 'completed',
  },
  {
    id: '3',
    orderNumber: 'ORD-2025-001567',
    eventName: 'Comedy Night',
    ticketType: 'Standard',
    quantity: 4,
    direction: 'sent',
    otherParty: 'friend@email.com',
    date: '2025-06-01',
    status: 'pending',
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-009123',
    eventName: 'Food & Wine Expo',
    ticketType: 'Weekend Pass',
    quantity: 2,
    direction: 'received',
    otherParty: 'colleague@work.com',
    date: '2024-03-05',
    status: 'completed',
  },
];

const statusVariants: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
  pending: 'warning',
  completed: 'success',
  cancelled: 'error',
};

export default function MyTransfersPage() {
  const [transfers] = useState<Transfer[]>(DEMO_TRANSFERS);
  const [directionFilter, setDirectionFilter] = useState<string>('all');

  const filteredTransfers = transfers.filter((t) => {
    return directionFilter === 'all' || t.direction === directionFilter;
  });

  const sentCount = transfers.filter((t) => t.direction === 'sent').length;
  const receivedCount = transfers.filter((t) => t.direction === 'received').length;
  const pendingCount = transfers.filter((t) => t.status === 'pending').length;
  return (
    <GvtewayAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="My Account"
          title="Transfer History"
          description="View your ticket transfer history"
          colorScheme="on-dark"
        />

        <Grid cols={4} gap={4}>
          <StatCard label="Total Transfers" value={transfers.length.toString()} icon={<ArrowRightLeft size={20} />} inverted />
          <StatCard label="Sent" value={sentCount.toString()} icon={<Send size={20} />} inverted />
          <StatCard label="Received" value={receivedCount.toString()} icon={<Inbox size={20} />} inverted />
          <StatCard label="Pending" value={pendingCount.toString()} icon={<Clock size={20} />} inverted />
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <H3 className="text-white">All Transfers</H3>
                <Stack direction="horizontal" gap={2}>
                  <Button
                    variant={directionFilter === 'all' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setDirectionFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={directionFilter === 'sent' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setDirectionFilter('sent')}
                  >
                    Sent
                  </Button>
                  <Button
                    variant={directionFilter === 'received' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setDirectionFilter('received')}
                  >
                    Received
                  </Button>
                </Stack>
              </Stack>

              <Stack gap={3}>
                {filteredTransfers.map((transfer) => (
                  <Stack key={transfer.id} className="rounded-card border-2 border-ink-700 p-4">
                    <Stack direction="horizontal" className="items-start justify-between">
                      <Stack gap={1}>
                        <Body className="font-weight-semibold text-white">{transfer.eventName}</Body>
                        <Body size="sm" className="text-on-dark-muted">
                          {transfer.orderNumber} - {transfer.ticketType} x{transfer.quantity}
                        </Body>
                      </Stack>
                      <Stack gap={1} className="items-end">
                        <Badge variant={transfer.direction === 'sent' ? 'warning' : 'success'}>
                          {transfer.direction === 'sent' ? 'Sent' : 'Received'}
                        </Badge>
                        <Badge variant={statusVariants[transfer.status]}>
                          {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                        </Badge>
                      </Stack>
                    </Stack>
                    <Stack direction="horizontal" className="mt-3 justify-between border-t border-ink-700 pt-3">
                      <Stack gap={0}>
                        <Body size="sm" className="text-on-dark-muted">
                          {transfer.direction === 'sent' ? 'Sent To' : 'Received From'}
                        </Body>
                        <Body className="text-white">{transfer.otherParty}</Body>
                      </Stack>
                      <Stack gap={0}>
                        <Body size="sm" className="text-on-dark-muted">Date</Body>
                        <Body className="text-white">{new Date(transfer.date).toLocaleDateString()}</Body>
                      </Stack>
                      <Stack gap={0}>
                        <Body size="sm" className="text-on-dark-muted">Tickets</Body>
                        <Body className="text-white">{transfer.quantity}</Body>
                      </Stack>
                    </Stack>
                  </Stack>
                ))}
                {filteredTransfers.length === 0 && (
                  <Body className="text-center text-on-dark-muted py-8">No transfers found</Body>
                )}
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </GvtewayAppLayout>
  );
}
