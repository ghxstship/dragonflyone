'use client';

import { useState } from 'react';
import {
  EnterprisePageHeader,
  MainContent,
  Container,
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
import { ArrowRightLeft, Clock, Send, Inbox } from 'lucide-react';
import { GvtewayAppLayout } from '../../../../components/app-layout';
import { useTransfers } from '@/hooks/useTransfers';
import { useRouter } from 'next/navigation';

const statusVariants: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
  pending: 'warning',
  completed: 'success',
  cancelled: 'error',
};

export default function MyTransfersPage() {
  const router = useRouter();
  const { data: transfersData, isLoading, error } = useTransfers();
  const [directionFilter, setDirectionFilter] = useState<string>('all');

  // Transform transfers to expected format
  const transfers = (transfersData || []).map(transfer => ({
    id: transfer.id,
    orderNumber: transfer.ticket_id,
    eventName: transfer.ticket?.event?.name || 'Event',
    ticketType: 'Ticket',
    quantity: 1,
    direction: transfer.direction,
    otherParty: transfer.recipient_email,
    date: transfer.created_at,
    status: transfer.status,
  }));

  const filteredTransfers = transfers.filter((t) => {
    return directionFilter === 'all' || t.direction === directionFilter;
  });

  const sentCount = transfers.filter((t) => t.direction === 'sent').length;
  const receivedCount = transfers.filter((t) => t.direction === 'received').length;
  const pendingCount = transfers.filter((t) => t.status === 'pending').length;

  if (isLoading) {
    return (
      <GvtewayAppLayout>
        <EnterprisePageHeader title="Transfer History" subtitle="View your ticket transfer history" showFavorite showSettings />
        <MainContent padding="lg"><Container>
          <Stack className="flex items-center justify-center py-20">
            <Spinner variant="grey" size="lg" text="Loading transfers..." />
          </Stack>
        </Container></MainContent>
      </GvtewayAppLayout>
    );
  }

  if (error) {
    return (
      <GvtewayAppLayout>
        <EnterprisePageHeader title="Transfer History" subtitle="View your ticket transfer history" showFavorite showSettings />
        <MainContent padding="lg"><Container>
          <EmptyState
            icon={<ArrowRightLeft size={48} />}
            title="Unable to load transfers"
            description="There was a problem loading your transfer history. Please try again."
            inverted
          />
        </Container></MainContent>
      </GvtewayAppLayout>
    );
  }

  if (transfers.length === 0) {
    return (
      <GvtewayAppLayout>
        <EnterprisePageHeader title="Transfer History" subtitle="View your ticket transfer history" showFavorite showSettings />
        <MainContent padding="lg"><Container>
          <EmptyState
            icon={<ArrowRightLeft size={48} />}
            title="No transfers yet"
            description="You haven't sent or received any ticket transfers yet."
            action={{ label: "View Tickets", onClick: () => router.push('/account/tickets') }}
            inverted
          />
        </Container></MainContent>
      </GvtewayAppLayout>
    );
  }

  return (
    <GvtewayAppLayout>
      <EnterprisePageHeader title="Transfer History" subtitle="View your ticket transfer history" showFavorite showSettings />
      <MainContent padding="lg"><Container>
        <Stack gap={8}>
          <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
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
      </Container></MainContent>
    </GvtewayAppLayout>
  );
}
