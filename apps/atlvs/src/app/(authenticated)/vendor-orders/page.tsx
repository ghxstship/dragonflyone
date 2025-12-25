'use client';

import {
  Badge,
  Body,
  Box,
  Button,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Grid,
  H3,
  Input,
  MainContent,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, Package, Clock, CheckCircle, XCircle, Send, Eye } from 'lucide-react';
import { useVendorOrders } from '@/hooks/useVendorOrders';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: Clock },
  pending_approval: { label: 'Pending Approval', color: 'bg-warning/20 text-warning', icon: Clock },
  approved: { label: 'Approved', color: 'bg-primary/20 text-primary', icon: CheckCircle },
  sent: { label: 'Sent', color: 'bg-info/20 text-info', icon: Send },
  acknowledged: { label: 'Acknowledged', color: 'bg-info/20 text-info', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'bg-primary/20 text-primary', icon: Package },
  completed: { label: 'Completed', color: 'bg-success/20 text-success', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/20 text-destructive', icon: XCircle },
};

export default function VendorOrdersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error } = useVendorOrders({
    organization_id: 'current',
    status: statusFilter || undefined,
  });

  const filteredOrders = data?.orders?.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.order_number?.toLowerCase().includes(query) ||
      order.vendor?.name?.toLowerCase().includes(query) ||
      order.booking?.event_name?.toLowerCase().includes(query)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Vendor Orders" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Stack gap={4}>
              <Grid cols={4} gap={4}>
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </Grid>
              <Skeleton className="h-64" />
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <EnterprisePageHeader title="Vendor Orders" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load vendor orders"
              description="Please try again."
              action={{ label: 'Retry', onClick: () => window.location.reload() }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title="Vendor Orders"
        subtitle="Create and manage orders to vendors with approval workflows"
        primaryAction={{ label: 'New Order', onClick: () => router.push('/vendor-orders/new') }}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Grid cols={4} gap={4}>
              {Object.entries(STATUS_CONFIG).slice(0, 4).map(([status, config]) => {
                const count = data?.orders?.filter((o) => o.status === status).length || 0;
                const StatusIcon = config.icon;
                return (
                  <Card
                    key={status}
                    className={`p-4 cursor-pointer transition-all ${statusFilter === status ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                    onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
                  >
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <Box className={`p-2 rounded-card ${config.color}`}>
                        <StatusIcon className="h-4 w-4" />
                      </Box>
                      <Box>
                        <Body className="font-weight-bold">{count}</Body>
                        <Text size="xs" className="text-muted-foreground">{config.label}</Text>
                      </Box>
                    </Stack>
                  </Card>
                );
              })}
            </Grid>

            <Stack direction="horizontal" gap={4} className="items-center">
              <Box className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </Box>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Statuses</option>
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <option key={status} value={status}>{config.label}</option>
                  ))}
                </Select>
              </Stack>
            </Stack>

            {(!filteredOrders || filteredOrders.length === 0) ? (
              <EmptyState
                title="No orders found"
                description={statusFilter ? `No orders with status "${STATUS_CONFIG[statusFilter as keyof typeof STATUS_CONFIG]?.label}"` : 'Create your first vendor order to get started.'}
                icon={<Package className="h-12 w-12" />}
                action={{ label: 'Create Order', onClick: () => router.push('/vendor-orders/new') }}
              />
            ) : (
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
                      const StatusIcon = statusConfig.icon;
                      return (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Link href={`/vendor-orders/${order.id}`} className="font-weight-medium text-primary hover:underline">
                              {order.order_number}
                            </Link>
                            <Body size="xs" className="text-muted-foreground">{formatDate(order.created_at)}</Body>
                          </TableCell>
                          <TableCell>
                            <Stack direction="horizontal" gap={2} className="items-center">
                              {order.vendor?.logo_url ? (
                                <Image src={order.vendor.logo_url} alt="" width={32} height={32} className="rounded-card object-cover" />
                              ) : (
                                <Box className="w-8 h-8 rounded-card bg-muted flex items-center justify-center">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                </Box>
                              )}
                              <Text className="font-weight-medium">{order.vendor?.name || 'Unknown Vendor'}</Text>
                            </Stack>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{order.booking?.event_name || '-'}</TableCell>
                          <TableCell>
                            <Badge className={statusConfig.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(order.delivery_date)}</TableCell>
                          <TableCell className="text-right font-weight-medium">{formatCurrency(order.total)}</TableCell>
                          <TableCell className="text-right">
                            <Link href={`/vendor-orders/${order.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3 mr-1" /> View
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
