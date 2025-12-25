'use client';

import {
  Badge,
  Body,
  Box,
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
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, FileText, Clock, CheckCircle, Filter, DollarSign } from 'lucide-react';
import { usePurchaseOrders, PurchaseOrder } from '@/hooks/usePurchaseOrders';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  pending_approval: { label: 'Pending Approval', color: 'bg-warning/20 text-warning' },
  approved: { label: 'Approved', color: 'bg-success/20 text-success' },
  sent: { label: 'Sent', color: 'bg-primary/20 text-primary' },
  acknowledged: { label: 'Acknowledged', color: 'bg-primary/20 text-primary' },
  fulfilled: { label: 'Fulfilled', color: 'bg-success text-success-foreground' },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/20 text-destructive' },
};

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: purchaseOrders = [], isLoading, error } = usePurchaseOrders({
    status: statusFilter || undefined,
  });

  const filteredPOs = purchaseOrders.filter((po: PurchaseOrder) => {
    const matchesSearch = !searchQuery || 
      po.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: purchaseOrders.length,
    pending: purchaseOrders.filter((p: PurchaseOrder) => p.status === 'pending_approval').length,
    approved: purchaseOrders.filter((p: PurchaseOrder) => p.status === 'approved' || p.status === 'sent' || p.status === 'ordered').length,
    fulfilled: purchaseOrders.filter((p: PurchaseOrder) => p.status === 'received' || p.status === 'fulfilled').length,
    totalValue: purchaseOrders.reduce((sum: number, p: PurchaseOrder) => sum + (p.total_amount || 0), 0),
  };

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Purchase Orders" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Stack gap={4}>
              <Grid cols={4} gap={4}>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
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
        <EnterprisePageHeader title="Purchase Orders" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load purchase orders"
              description="Please try again."
              action={{ label: 'Retry', onClick: () => window.location.reload() }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <EnterprisePageHeader
        title="Purchase Orders"
        subtitle="Manage vendor purchase orders and procurement"
        primaryAction={{ label: 'New PO', onClick: () => router.push('/purchase-orders/new') }}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Grid cols={4} gap={4}>
              <Card className="p-4">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <Text size="sm" className="text-muted-foreground">Total POs</Text>
                </Stack>
                <Body className="font-weight-bold">{stats.total}</Body>
              </Card>
              <Card className="p-4 border-warning/50">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <Clock className="h-5 w-5 text-warning" />
                  <Text size="sm" className="text-muted-foreground">Pending</Text>
                </Stack>
                <Body className="font-weight-bold text-warning">{stats.pending}</Body>
              </Card>
              <Card className="p-4 border-primary/50">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <Text size="sm" className="text-muted-foreground">Active</Text>
                </Stack>
                <Body className="font-weight-bold text-primary">{stats.approved}</Body>
              </Card>
              <Card className="p-4 border-success/50">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <Text size="sm" className="text-muted-foreground">Fulfilled</Text>
                </Stack>
                <Body className="font-weight-bold text-success">{stats.fulfilled}</Body>
              </Card>
            </Grid>

            <Stack direction="horizontal" gap={4} className="flex-wrap items-center">
              <Box className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by PO number, vendor, or event..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </Box>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Stack>
            </Stack>

            {filteredPOs.length === 0 ? (
              <EmptyState
                title="No purchase orders found"
                description={searchQuery ? 'Try adjusting your search' : 'Create your first purchase order'}
                icon={<FileText className="h-12 w-12" />}
                action={{ label: 'New PO', onClick: () => router.push('/purchase-orders/new') }}
              />
            ) : (
              <Stack gap={4}>
                {filteredPOs.map((po: PurchaseOrder) => {
                  const statusConfig = STATUS_CONFIG[po.status] || { label: po.status, color: 'bg-muted text-muted-foreground' };

                  return (
                    <Link key={po.id} href={`/purchase-orders/${po.id}`}>
                      <Card className="p-6 hover:border-primary transition-colors">
                        <Stack direction="horizontal" className="justify-between items-start">
                          <Box className="flex-1">
                            <Stack direction="horizontal" gap={3} className="items-center mb-2">
                              <Text size="xs" className="text-muted-foreground font-mono">{po.po_number}</Text>
                              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                              {po.priority && po.priority !== 'normal' && (
                                <Badge className={
                                  po.priority === 'urgent' ? 'bg-destructive/20 text-destructive' :
                                  po.priority === 'high' ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'
                                }>
                                  {po.priority}
                                </Badge>
                              )}
                            </Stack>
                            <H3 className="mb-1">{po.vendor?.name || 'Unknown Vendor'}</H3>
                            <Body size="sm" className="text-muted-foreground">
                              {po.category}{po.description && ` • ${po.description}`}
                            </Body>
                          </Box>
                          <Box className="text-right">
                            <Body className="font-weight-bold">{formatCurrency(po.total_amount || 0)}</Body>
                            <Body size="xs" className="text-muted-foreground mt-1">
                              {new Date(po.created_at).toLocaleDateString()}
                            </Body>
                          </Box>
                        </Stack>
                      </Card>
                    </Link>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
