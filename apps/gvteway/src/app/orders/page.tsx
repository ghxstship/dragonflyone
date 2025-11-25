'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import { Display, H2, H3, Body, Button, Card, Badge, Grid, LoadingSpinner, Container, Section, Stack, Breadcrumb, BreadcrumbItem, EmptyState } from '@ghxstship/ui';
import { useOrders } from '@/hooks/useOrders';

export default function OrdersPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState('all');
  const { data: orders, isLoading } = useOrders();

  if (isLoading) {
    return (
      <Section className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading orders..." />
      </Section>
    );
  }

  const displayOrders = orders || [];
  const filteredOrders = filterStatus === 'all' 
    ? displayOrders 
    : displayOrders.filter(o => o.status.toLowerCase() === filterStatus);

  const totalSpent = displayOrders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <Section className="min-h-screen bg-black text-white">
      <Navigation />
      <Container className="py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem active>Orders</BreadcrumbItem>
        </Breadcrumb>

        <Stack className="mb-8 border-b-2 border-grey-800 pb-8">
          <Display>MY ORDERS</Display>
          <Body className="mt-2 text-grey-400">Order history and ticket management</Body>
        </Stack>

        <Grid cols={3} gap={6} className="mb-8">
          <Card className="p-6 text-center bg-black border-grey-800">
            <H2 className="text-white">{displayOrders.length}</H2>
            <Body className="text-grey-400">Total Orders</Body>
          </Card>
          <Card className="p-6 text-center bg-black border-grey-800">
            <H2 className="text-white">${totalSpent.toLocaleString()}</H2>
            <Body className="text-grey-400">Total Spent</Body>
          </Card>
          <Card className="p-6 text-center bg-black border-grey-800">
            <H2 className="text-white">{displayOrders.reduce((sum, o) => sum + (o.ticket_count || 0), 0)}</H2>
            <Body className="text-grey-400">Tickets Purchased</Body>
          </Card>
        </Grid>

        <Stack gap={4} direction="horizontal" className="mb-6">
          <Button 
            variant={filterStatus === 'all' ? 'solid' : 'outline'}
            onClick={() => setFilterStatus('all')}
          >
            All
          </Button>
          <Button 
            variant={filterStatus === 'confirmed' ? 'solid' : 'outline'}
            onClick={() => setFilterStatus('confirmed')}
          >
            Confirmed
          </Button>
          <Button 
            variant={filterStatus === 'pending' ? 'solid' : 'outline'}
            onClick={() => setFilterStatus('pending')}
          >
            Pending
          </Button>
        </Stack>

        <Stack gap={4}>
          {filteredOrders.map(order => (
            <Card key={order.id} className="p-6">
              <Stack direction="horizontal" className="justify-between items-start">
                <Stack gap={2} className="flex-1">
                  <Stack direction="horizontal" gap={4} className="items-center">
                    <H3 className="uppercase">Order #{order.id.slice(0, 8)}</H3>
                    <Badge>{order.status}</Badge>
                  </Stack>
                  <Body className="font-bold">{order.gvteway_events?.title || 'Event'}</Body>
                  {order.gvteway_events?.event_date && (
                    <Body size="sm">
                      {new Date(order.gvteway_events.event_date).toLocaleDateString()}
                    </Body>
                  )}
                  <Body>${order.total_amount.toLocaleString()}</Body>
                  <Body size="sm">
                    Ordered: {new Date(order.created_at).toLocaleDateString()}
                  </Body>
                  {order.ticket_count && (
                    <Body size="sm">
                      {order.ticket_count} {order.ticket_count === 1 ? 'ticket' : 'tickets'}
                    </Body>
                  )}
                </Stack>
                <Stack direction="horizontal" gap={2}>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/orders/${order.id}`)}>View Details</Button>
                  {order.status === 'confirmed' && (
                    <Button variant="solid" size="sm" onClick={() => router.push(`/tickets?order=${order.id}`)}>View Tickets</Button>
                  )}
                </Stack>
              </Stack>
            </Card>
          ))}
          {filteredOrders.length === 0 && <EmptyState title="No orders found" description="You haven't placed any orders yet." />}
        </Stack>
      </Container>
    </Section>
  );
}
