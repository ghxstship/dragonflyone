'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  StatCard,
  Button,
  Badge,
  Grid,
  H3,
  Input,
  Spinner,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ghxstship/ui';
import {
  DollarSign,
  Clock,
  CheckCircle,
  Search,
  XCircle,
} from 'lucide-react';
import { GvtewayAppLayout } from '../../../../components/app-layout';
import { useEventRefundsData, type RefundRequest } from '@/hooks/useEventOperations';

export default function EventRefundsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [searchQuery, setSearchQuery] = useState('');

  const { refunds, isLoading: loading, processRefund } = useEventRefundsData(eventId);

  const totalPending = refunds.filter((r: RefundRequest) => r.status === 'pending').reduce((sum: number, r: RefundRequest) => sum + r.amount, 0);
  const totalProcessed = refunds.filter((r: RefundRequest) => r.status === 'processed').reduce((sum: number, r: RefundRequest) => sum + r.amount, 0);
  const pendingCount = refunds.filter((r: RefundRequest) => r.status === 'pending').length;

  const filteredRefunds = refunds.filter((r: RefundRequest) =>
    r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = async (id: string) => {
    try {
      await processRefund({ refundId: id, action: 'approve' });
    } catch {
      // Error handled by hook
    }
  };

  const handleReject = async (id: string) => {
    try {
      await processRefund({ refundId: id, action: 'reject' });
    } catch {
      // Error handled by hook
    }
  };

  const getStatusBadge = (status: RefundRequest['status']) => {
    const variants: Record<string, 'warning' | 'info' | 'success' | 'error'> = {
      pending: 'warning', approved: 'info', processed: 'success', rejected: 'error'
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <GvtewayAppLayout>
      <Stack gap={8}>
        <SectionHeader kicker="Event" title="Refunds" description="Manage ticket refund requests" colorScheme="on-dark" />

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Pending Refunds" value={pendingCount.toString()} icon={<Clock size={20} />} inverted />
          <StatCard label="Pending Amount" value={`$${totalPending.toLocaleString()}`} icon={<DollarSign size={20} />} inverted />
          <StatCard label="Processed" value={`$${totalProcessed.toLocaleString()}`} icon={<CheckCircle size={20} />} inverted />
          <StatCard label="Total Requests" value={refunds.length.toString()} icon={<DollarSign size={20} />} inverted />
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <H3 className="text-white">Refund Requests</H3>
                <Stack direction="horizontal" gap={2}>
                  <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <Button variant="outline"><Search size={16} /></Button>
                </Stack>
              </Stack>
              {loading ? (
                <Stack className="items-center py-12">
                  <Spinner variant="grey" size="lg" />
                </Stack>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRefunds.map((refund: RefundRequest) => (
                    <TableRow key={refund.id}>
                      <TableCell>{refund.id}</TableCell>
                      <TableCell>{refund.orderId}</TableCell>
                      <TableCell>{refund.customerName}</TableCell>
                      <TableCell>{refund.reason}</TableCell>
                      <TableCell className="text-right">${refund.amount}</TableCell>
                      <TableCell>{getStatusBadge(refund.status)}</TableCell>
                      <TableCell>
                        {refund.status === 'pending' && (
                          <Stack direction="horizontal" gap={1}>
                            <Button variant="ghost" size="sm" onClick={() => handleApprove(refund.id)}><CheckCircle size={14} /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleReject(refund.id)}><XCircle size={14} /></Button>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </GvtewayAppLayout>
  );
}
