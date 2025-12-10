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
  Body,
  H3,
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
  Users,
  CheckCircle,
  Clock,
  Download,
} from 'lucide-react';
import { CompvssAppLayout } from '../../../../components/app-layout';
import { log } from '@ghxstship/config';

interface SettlementItem {
  id: string;
  name: string;
  role: string;
  type: 'crew' | 'vendor';
  contractAmount: number;
  adjustments: number;
  finalAmount: number;
  status: 'pending' | 'approved' | 'paid';
}

const MOCK_SETTLEMENTS: SettlementItem[] = [
  { id: 'S-001', name: 'John Smith', role: 'Stage Manager', type: 'crew', contractAmount: 5000, adjustments: 500, finalAmount: 5500, status: 'paid' },
  { id: 'S-002', name: 'Audio Solutions Inc', role: 'Audio Vendor', type: 'vendor', contractAmount: 45000, adjustments: -2000, finalAmount: 43000, status: 'approved' },
  { id: 'S-003', name: 'Sarah Chen', role: 'Lighting Designer', type: 'crew', contractAmount: 4500, adjustments: 0, finalAmount: 4500, status: 'pending' },
  { id: 'S-004', name: 'Stage Masters', role: 'Staging Vendor', type: 'vendor', contractAmount: 52000, adjustments: 3500, finalAmount: 55500, status: 'pending' },
];

export default function ProductionSettlementPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const [settlements, setSettlements] = useState<SettlementItem[]>(MOCK_SETTLEMENTS);
  const [loading, setLoading] = useState(true);

  const fetchSettlements = useCallback(async () => {
    if (!productionId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/productions/${productionId}/settlements`);
      if (response.ok) {
        const data = await response.json();
        if (data.settlements && data.settlements.length > 0) {
          setSettlements(data.settlements);
        }
      }
    } catch (error) {
      log.error('Failed to fetch settlements:', error instanceof Error ? error : undefined);
    } finally {
      setLoading(false);
    }
  }, [productionId]);

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  const totalContract = settlements.reduce((sum, s) => sum + s.contractAmount, 0);
  const totalFinal = settlements.reduce((sum, s) => sum + s.finalAmount, 0);
  const paidCount = settlements.filter(s => s.status === 'paid').length;

  const getStatusBadge = (status: SettlementItem['status']) => {
    const variants: Record<string, 'warning' | 'info' | 'success'> = {
      pending: 'warning', approved: 'info', paid: 'success'
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <Stack direction="horizontal" className="items-start justify-between">
          <SectionHeader kicker="Production" title="Settlement" description="Crew and vendor settlement management" colorScheme="on-dark" />
          <Button variant="outline"><Download size={16} className="mr-2" />Export</Button>
        </Stack>

        <Grid cols={4} gap={4}>
          <StatCard label="Contract Total" value={`$${(totalContract / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
          <StatCard label="Final Total" value={`$${(totalFinal / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
          <StatCard label="Settlements" value={settlements.length.toString()} icon={<Users size={20} />} inverted />
          <StatCard label="Paid" value={paidCount.toString()} icon={<CheckCircle size={20} />} inverted />
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <H3 className="text-white">All Settlements</H3>
              {loading ? (
                <Stack className="items-center py-12">
                  <Spinner variant="grey" size="lg" />
                </Stack>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Contract</TableHead>
                    <TableHead className="text-right">Adjustments</TableHead>
                    <TableHead className="text-right">Final</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settlements.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.role}</TableCell>
                      <TableCell><Badge variant={item.type === 'crew' ? 'info' : 'solid'}>{item.type}</Badge></TableCell>
                      <TableCell className="text-right">${item.contractAmount.toLocaleString()}</TableCell>
                      <TableCell className={`text-right ${item.adjustments >= 0 ? 'text-success' : 'text-error'}`}>
                        {item.adjustments >= 0 ? '+' : ''}${item.adjustments.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-weight-semibold">${item.finalAmount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        {item.status === 'pending' && <Button variant="ghost" size="sm">Approve</Button>}
                        {item.status === 'approved' && <Button variant="ghost" size="sm">Mark Paid</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </Stack>
          </CardBody>
        </Card>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack direction="horizontal" className="items-center justify-between">
              <Stack gap={1}>
                <H3 className="text-white">Settlement Summary</H3>
                <Body className="text-on-dark-muted">
                  {paidCount} of {settlements.length} settlements completed
                </Body>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Button variant="outline"><Clock size={16} className="mr-2" />Approve All Pending</Button>
                <Button variant="solid"><CheckCircle size={16} className="mr-2" />Process Payments</Button>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </CompvssAppLayout>
  );
}
