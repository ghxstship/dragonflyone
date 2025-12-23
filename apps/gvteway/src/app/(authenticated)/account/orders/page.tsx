'use client';

import {
  EnterprisePageHeader,
  MainContent,
  Container,
  Card,
  CardBody,
  Stack,
  Button,
  Badge,
  Grid,
  Body,
  H3,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Spinner,
  EmptyState,
} from '@ghxstship/ui';
import {
  Download,
  Eye,
  ShoppingBag,
} from 'lucide-react';
// Layout provided by route group
import { useOrders } from '@/hooks/useOrders';
import { useRouter } from 'next/navigation';

export default function AccountOrdersPage() {
  const router = useRouter();
  const { data: ordersData, isLoading, error } = useOrders();
  
  // Transform data to match expected format
  const orders = (ordersData || []).map(order => ({
    id: order.id,
    date: new Date(order.created_at).toLocaleDateString(),
    eventName: order.gvteway_events?.title || 'Event',
    ticketCount: order.ticket_count || 1,
    total: order.total_amount,
    status: order.status === 'confirmed' ? 'completed' : order.status,
  }));

  const totalSpent = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0);

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Order History" subtitle="View your past orders and receipts" showFavorite showSettings />
        <MainContent padding="lg">
          <Container>
            <Stack className="flex items-center justify-center py-20">
              <Spinner variant="grey" size="lg" text="Loading orders..." />
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <EnterprisePageHeader title="Order History" subtitle="View your past orders and receipts" showFavorite showSettings />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              icon={<ShoppingBag size={48} />}
              title="Unable to load orders"
              description="There was a problem loading your order history. Please try again."
              inverted
            />
          </Container>
        </MainContent>
      </>
    );
  }

  if (orders.length === 0) {
    return (
      <>
        <EnterprisePageHeader title="Order History" subtitle="View your past orders and receipts" showFavorite showSettings />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              icon={<ShoppingBag size={48} />}
              title="No orders yet"
              description="You haven't made any purchases yet. Browse events to find your next experience!"
              action={{ label: "Browse Events", onClick: () => router.push('/browse') }}
              inverted
            />
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader title="Order History" subtitle="View your past orders and receipts" showFavorite showSettings />
      <MainContent padding="lg">
        <Container>
          <Stack gap={8}>
            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={2}>
                <Body className="text-on-dark-muted">Total Orders</Body>
                <H3 className="text-white">{orders.length}</H3>
              </Stack>
            </CardBody>
          </Card>
          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={2}>
                <Body className="text-on-dark-muted">Total Spent</Body>
                <H3 className="text-white">${totalSpent.toLocaleString()}</H3>
              </Stack>
            </CardBody>
          </Card>
          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={2}>
                <Body className="text-on-dark-muted">Tickets Purchased</Body>
                <H3 className="text-white">{orders.reduce((sum, o) => sum + o.ticketCount, 0)}</H3>
              </Stack>
            </CardBody>
          </Card>
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <H3 className="text-white">All Orders</H3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Tickets</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-weight-semibold">{order.id}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.eventName}</TableCell>
                      <TableCell>{order.ticketCount}</TableCell>
                      <TableCell className="text-right">${order.total}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'error'}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={1}>
                          <Button variant="ghost" size="sm"><Eye size={14} /></Button>
                          <Button variant="ghost" size="sm"><Download size={14} /></Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          </CardBody>
        </Card>
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
