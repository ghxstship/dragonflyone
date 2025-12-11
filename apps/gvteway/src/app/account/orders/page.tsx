'use client';

import { useState } from 'react';
import {
  SectionHeader,
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
} from '@ghxstship/ui';
import {
  Download,
  Eye,
} from 'lucide-react';
import { GvtewayAppLayout } from '../../../components/app-layout';

import { DEMO_ORDERS } from '../../../lib/demo-data';

export default function AccountOrdersPage() {
  const [orders] = useState(DEMO_ORDERS);

  const totalSpent = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0);

  return (
    <GvtewayAppLayout>
      <Stack gap={8}>
        <SectionHeader kicker="My Account" title="Order History" description="View your past orders and receipts" colorScheme="on-dark" />

        <Grid cols={3} gap={4}>
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
    </GvtewayAppLayout>
  );
}
