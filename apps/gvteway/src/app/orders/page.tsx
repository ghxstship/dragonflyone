'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConsumerNavigationPublic } from '@/components/navigation';
import { 
  Display,
  H2, 
  H3, 
  Body, 
  Button, 
  Card, 
  Badge, 
  Grid, 
  LoadingSpinner, 
  Container, 
  Section, 
  Stack, 
  Kicker,
  Label,
  StatCard,
  EmptyState,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
} from '@ghxstship/ui';
import { useOrders } from '@/hooks/useOrders';
import { ShoppingBag, Ticket, Eye } from 'lucide-react';

/**
 * Orders Page - Bold Contemporary Pop Art Adventure
 * Hard offset shadows, 2px+ borders, bounce animations
 */
export default function OrdersPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState('all');
  const { data: orders, isLoading } = useOrders();

  const displayOrders = orders || [];
  const filteredOrders = filterStatus === 'all' 
    ? displayOrders 
    : displayOrders.filter(o => o.status.toLowerCase() === filterStatus);

  const totalSpent = displayOrders.reduce((sum, o) => sum + o.total_amount, 0);

  if (isLoading) {
    return (
      <PageLayout
        background="black"
        header={<ConsumerNavigationPublic />}
        footer={
          <Footer
            logo={<Display size="md">GVTEWAY</Display>}
            copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
          >
            <FooterColumn title="Discover">
              <FooterLink href="/events">Browse Events</FooterLink>
              <FooterLink href="/venues">Find Venues</FooterLink>
              <FooterLink href="/artists">Artists</FooterLink>
            </FooterColumn>
            <FooterColumn title="Support">
              <FooterLink href="/help">Help Center</FooterLink>
              <FooterLink href="/help#contact">Contact</FooterLink>
            </FooterColumn>
            <FooterColumn title="Legal">
              <FooterLink href="/legal/privacy">Privacy</FooterLink>
              <FooterLink href="/legal/terms">Terms</FooterLink>
            </FooterColumn>
          </Footer>
        }
      >
        <Section background="black" className="relative min-h-screen overflow-hidden py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(#fff 1px, transparent 1px),
                linear-gradient(90deg, #fff 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />
          <Container className="relative z-10 flex min-h-[60vh] items-center justify-center">
            <LoadingSpinner size="lg" text="Loading orders..." />
          </Container>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Discover">
            <FooterLink href="/events">Browse Events</FooterLink>
            <FooterLink href="/venues">Find Venues</FooterLink>
            <FooterLink href="/artists">Artists</FooterLink>
          </FooterColumn>
          <FooterColumn title="Support">
            <FooterLink href="/help">Help Center</FooterLink>
            <FooterLink href="/help#contact">Contact</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        {/* Grid Pattern Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(#fff 1px, transparent 1px),
              linear-gradient(90deg, #fff 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Order History</Kicker>
              <H2 size="lg" className="text-white">My Orders</H2>
              <Body className="text-on-dark-muted">Order history and ticket management</Body>
            </Stack>

            {/* Stats */}
            <Grid cols={3} gap={6}>
              <StatCard
                value={displayOrders.length.toString()}
                label="Total Orders"
                inverted
              />
              <StatCard
                value={`$${totalSpent.toLocaleString()}`}
                label="Total Spent"
                inverted
              />
              <StatCard
                value={displayOrders.reduce((sum, o) => sum + (o.ticket_count || 0), 0).toString()}
                label="Tickets Purchased"
                inverted
              />
            </Grid>

            {/* Filter Buttons */}
            <Card inverted variant="elevated" className="p-4">
              <Stack gap={2} direction="horizontal">
                <Button 
                  variant={filterStatus === 'all' ? 'solid' : 'outlineInk'}
                  onClick={() => setFilterStatus('all')}
                  inverted={filterStatus === 'all'}
                  size="sm"
                >
                  All Orders
                </Button>
                <Button 
                  variant={filterStatus === 'confirmed' ? 'solid' : 'outlineInk'}
                  onClick={() => setFilterStatus('confirmed')}
                  inverted={filterStatus === 'confirmed'}
                  size="sm"
                >
                  Confirmed
                </Button>
                <Button 
                  variant={filterStatus === 'pending' ? 'solid' : 'outlineInk'}
                  onClick={() => setFilterStatus('pending')}
                  inverted={filterStatus === 'pending'}
                  size="sm"
                >
                  Pending
                </Button>
              </Stack>
            </Card>

            {/* Orders List */}
            <Stack gap={4}>
              {filteredOrders.map(order => (
                <Card key={order.id} inverted interactive onClick={() => router.push(`/orders/${order.id}`)}>
                  <Stack direction="horizontal" className="items-start justify-between">
                    <Stack gap={3} className="flex-1">
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <ShoppingBag className="size-5 text-on-dark-muted" />
                        <H3 className="text-white">Order #{order.id.slice(0, 8)}</H3>
                        <Badge variant={order.status === 'confirmed' ? 'solid' : 'outline'}>
                          {order.status.toUpperCase()}
                        </Badge>
                      </Stack>
                      <Body className="font-display text-white">{order.gvteway_events?.title || 'Event'}</Body>
                      <Stack direction="horizontal" gap={6}>
                        {order.gvteway_events?.event_date && (
                          <Stack gap={1}>
                            <Label size="xs" className="text-on-dark-disabled">Event Date</Label>
                            <Body size="sm" className="text-on-dark-muted">
                              {new Date(order.gvteway_events.event_date).toLocaleDateString()}
                            </Body>
                          </Stack>
                        )}
                        <Stack gap={1}>
                          <Label size="xs" className="text-on-dark-disabled">Amount</Label>
                          <Body size="sm" className="font-display text-white">${order.total_amount.toLocaleString()}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Label size="xs" className="text-on-dark-disabled">Ordered</Label>
                          <Body size="sm" className="text-on-dark-muted">
                            {new Date(order.created_at).toLocaleDateString()}
                          </Body>
                        </Stack>
                        {order.ticket_count && (
                          <Stack gap={1}>
                            <Label size="xs" className="text-on-dark-disabled">Tickets</Label>
                            <Body size="sm" className="text-on-dark-muted">
                              {order.ticket_count} {order.ticket_count === 1 ? 'ticket' : 'tickets'}
                            </Body>
                          </Stack>
                        )}
                      </Stack>
                    </Stack>
                    <Stack direction="horizontal" gap={2}>
                      <Button 
                        variant="outlineInk" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); router.push(`/orders/${order.id}`); }}
                        icon={<Eye className="size-4" />}
                        iconPosition="left"
                      >
                        Details
                      </Button>
                      {order.status === 'confirmed' && (
                        <Button 
                          variant="solid" 
                          size="sm" 
                          inverted
                          onClick={(e) => { e.stopPropagation(); router.push(`/tickets?order=${order.id}`); }}
                          icon={<Ticket className="size-4" />}
                          iconPosition="left"
                        >
                          Tickets
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Card>
              ))}
              {filteredOrders.length === 0 && (
                <EmptyState 
                  title="No orders found" 
                  description="You haven't placed any orders yet."
                  action={{
                    label: "Browse Events",
                    onClick: () => router.push('/events')
                  }}
                  inverted 
                />
              )}
            </Stack>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
