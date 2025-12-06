'use client';

import { useState, useEffect, useCallback } from 'react';
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

interface RefundRequest {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedAt: string;
}

const MOCK_REFUNDS: RefundRequest[] = [
  { id: 'REF-001', orderId: 'ORD-12345', customerName: 'John Smith', amount: 150, reason: 'Unable to attend', status: 'pending', requestedAt: '2024-11-16 10:30' },
  { id: 'REF-002', orderId: 'ORD-12346', customerName: 'Jane Doe', amount: 75, reason: 'Event rescheduled', status: 'approved', requestedAt: '2024-11-15 14:20' },
  { id: 'REF-003', orderId: 'ORD-12347', customerName: 'Bob Wilson', amount: 300, reason: 'Duplicate purchase', status: 'processed', requestedAt: '2024-11-14 09:15' },
  { id: 'REF-004', orderId: 'ORD-12348', customerName: 'Sarah Chen', amount: 75, reason: 'Changed mind', status: 'rejected', requestedAt: '2024-11-16 08:00' },
];

export default function EventRefundsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [refunds, setRefunds] = useState<RefundRequest[]>(MOCK_REFUNDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRefunds = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/refunds`);
      if (response.ok) {
        const data = await response.json();
        if (data.refunds && data.refunds.length > 0) {
          setRefunds(data.refunds);
        }
      }
    } catch (error) {
      console.error('Failed to fetch refunds:', error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const totalPending = refunds.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);
  const totalProcessed = refunds.filter(r => r.status === 'processed').reduce((sum, r) => sum + r.amount, 0);
  const pendingCount = refunds.filter(r => r.status === 'pending').length;

  const filteredRefunds = refunds.filter(r =>
    r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/refunds/${id}/approve`, { method: 'POST' });
      if (response.ok) {
        setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' as const } : r));
      }
    } catch (error) {
      console.error('Failed to approve refund:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/refunds/${id}/reject`, { method: 'POST' });
      if (response.ok) {
        setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r));
      }
    } catch (error) {
      console.error('Failed to reject refund:', error);
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

        <Grid cols={4} gap={4}>
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
                  {filteredRefunds.map(refund => (
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
