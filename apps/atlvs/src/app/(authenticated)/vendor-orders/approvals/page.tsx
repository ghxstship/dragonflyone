'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Text,
  useNotifications,
} from '@ghxstship/ui';
import Link from 'next/link';
import { Search, Clock, CheckCircle, XCircle, Filter, User, DollarSign } from 'lucide-react';

interface PendingApproval {
  id: string;
  order_id: string;
  order_number: string;
  vendor_name: string;
  event_name?: string;
  total_amount: number;
  requested_by: string;
  requested_at: string;
  urgency: 'low' | 'medium' | 'high';
  items_count: number;
  notes?: string;
}

const DEMO_APPROVALS: PendingApproval[] = [
  { id: '1', order_id: 'o1', order_number: 'VO-2024-001', vendor_name: 'Elite Catering Co.', event_name: 'Smith Wedding', total_amount: 4500, requested_by: 'John Smith', requested_at: '2024-01-15T10:30:00', urgency: 'high', items_count: 12 },
  { id: '2', order_id: 'o2', order_number: 'VO-2024-002', vendor_name: 'Bloom Florals', total_amount: 2800, requested_by: 'Sarah Johnson', requested_at: '2024-01-16T14:00:00', urgency: 'medium', items_count: 8 },
  { id: '3', order_id: 'o3', order_number: 'VO-2024-003', vendor_name: 'Pro AV Solutions', event_name: 'Corporate Gala', total_amount: 6200, requested_by: 'Mike Davis', requested_at: '2024-01-17T09:15:00', urgency: 'low', items_count: 5 },
];

const URGENCY_CONFIG = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', color: 'bg-warning/20 text-warning' },
  high: { label: 'Urgent', color: 'bg-destructive/20 text-destructive' },
};

async function fetchPendingApprovals(): Promise<PendingApproval[]> {
  const response = await fetch('/api/vendor-orders/approvals');
  if (!response.ok) throw new Error('Failed to fetch pending approvals');
  return response.json();
}

export default function ApprovalsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('');

  const { data: apiApprovals, isLoading, error } = useQuery({
    queryKey: ['vendor-order-approvals'],
    queryFn: fetchPendingApprovals,
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/vendor-orders/${id}/approve`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to approve order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-order-approvals'] });
      addNotification({ type: 'success', title: 'Order Approved', message: 'Vendor order has been approved.' });
    },
    onError: () => {
      addNotification({ type: 'error', title: 'Approval Failed', message: 'Failed to approve order.' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/vendor-orders/${id}/reject`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to reject order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-order-approvals'] });
      addNotification({ type: 'success', title: 'Order Rejected', message: 'Vendor order has been rejected.' });
    },
    onError: () => {
      addNotification({ type: 'error', title: 'Rejection Failed', message: 'Failed to reject order.' });
    },
  });

  // Use API data or fall back to demo data
  const approvals = apiApprovals && apiApprovals.length > 0 ? apiApprovals : DEMO_APPROVALS;

  const filteredApprovals = approvals.filter((a) => {
    const matchesSearch = !searchQuery || 
      a.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.event_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUrgency = !urgencyFilter || a.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Pending Approvals" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Stack gap={4}>
              <Grid cols={3} gap={4}>
                {[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}
              </Grid>
              <Skeleton className="h-64" />
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error && !apiApprovals) {
    return (
      <>
        <EnterprisePageHeader title="Pending Approvals" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Error Loading Approvals"
              description={error instanceof Error ? error.message : 'Failed to load pending approvals'}
              action={{ label: 'Retry', onClick: () => window.location.reload() }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  const totalPending = approvals.length;
  const totalValue = approvals.reduce((sum, a) => sum + a.total_amount, 0);
  const urgentCount = approvals.filter((a) => a.urgency === 'high').length;

  return (
    <>
      <EnterprisePageHeader
        title="Pending Approvals"
        subtitle="Review and approve vendor orders"
        secondaryAction={{ label: 'View All Orders', onClick: () => router.push('/vendor-orders') }}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Grid cols={3} gap={4}>
              <Card className="p-4 border-warning/50">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <Clock className="h-5 w-5 text-warning" />
                  <Text size="sm" className="text-muted-foreground">Pending</Text>
                </Stack>
                <Body className="font-weight-bold text-warning">{totalPending}</Body>
              </Card>
              <Card className="p-4 border-destructive/50">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <Clock className="h-5 w-5 text-destructive" />
                  <Text size="sm" className="text-muted-foreground">Urgent</Text>
                </Stack>
                <Body className="font-weight-bold text-destructive">{urgentCount}</Body>
              </Card>
              <Card className="p-4">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <Text size="sm" className="text-muted-foreground">Total Value</Text>
                </Stack>
                <Body className="font-weight-bold">{formatCurrency(totalValue)}</Body>
              </Card>
            </Grid>

            <Stack direction="horizontal" gap={4} className="flex-wrap items-center">
              <Box className="relative flex-1 min-w-[200px] max-w-md">
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
                <Select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)}>
                  <option value="">All Urgency</option>
                  {Object.entries(URGENCY_CONFIG).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Stack>
            </Stack>

            {filteredApprovals.length === 0 ? (
              <EmptyState
                title="No pending approvals"
                description="All vendor orders have been processed"
                icon={<CheckCircle className="h-12 w-12 text-success" />}
              />
            ) : (
              <Stack gap={4}>
                {filteredApprovals.map((approval) => {
                  const urgencyConfig = URGENCY_CONFIG[approval.urgency];
                  const isProcessing = approveMutation.isPending || rejectMutation.isPending;

                  return (
                    <Card key={approval.id} className="p-6">
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Box className="flex-1">
                          <Stack direction="horizontal" gap={3} className="items-center mb-2">
                            <Link href={`/vendor-orders/${approval.order_id}`} className="text-primary font-mono hover:underline">
                              <Text size="xs">{approval.order_number}</Text>
                            </Link>
                            <Badge className={urgencyConfig.color}>{urgencyConfig.label}</Badge>
                          </Stack>
                          <H3 className="mb-1">{approval.vendor_name}</H3>
                          <Body size="sm" className="text-muted-foreground">
                            {approval.items_count} items{approval.event_name && ` for ${approval.event_name}`}
                          </Body>
                          <Stack direction="horizontal" gap={4} className="mt-2 text-muted-foreground">
                            <Stack direction="horizontal" gap={1} className="items-center">
                              <User className="h-3 w-3" />
                              <Text size="xs">{approval.requested_by}</Text>
                            </Stack>
                            <Stack direction="horizontal" gap={1} className="items-center">
                              <Clock className="h-3 w-3" />
                              <Text size="xs">{formatDate(approval.requested_at)}</Text>
                            </Stack>
                          </Stack>
                        </Box>
                        <Box className="text-right">
                          <Body className="font-weight-bold mb-4">{formatCurrency(approval.total_amount)}</Body>
                          <Stack direction="horizontal" gap={2}>
                            <Button
                              variant="outline"
                              onClick={() => handleReject(approval.id)}
                              disabled={isProcessing}
                              className="text-destructive border-destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              onClick={() => handleApprove(approval.id)}
                              disabled={isProcessing}
                              className="bg-success text-success-foreground border-success"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </Stack>
                        </Box>
                      </Stack>
                    </Card>
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
