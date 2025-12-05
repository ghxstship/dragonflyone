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
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Download,
  RefreshCw,
} from 'lucide-react';

interface ReconciliationItem {
  id: string;
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
  status: 'on-track' | 'over' | 'under';
}

const RECONCILIATION_DATA: ReconciliationItem[] = [
  { id: '1', category: 'Ticket Revenue', budgeted: 500000, actual: 485000, variance: -15000, variancePercent: -3, status: 'under' },
  { id: '2', category: 'Sponsorship', budgeted: 150000, actual: 175000, variance: 25000, variancePercent: 16.7, status: 'over' },
  { id: '3', category: 'Merchandise', budgeted: 50000, actual: 48000, variance: -2000, variancePercent: -4, status: 'on-track' },
  { id: '4', category: 'F&B Revenue', budgeted: 75000, actual: 82000, variance: 7000, variancePercent: 9.3, status: 'over' },
  { id: '5', category: 'Production Costs', budgeted: -200000, actual: -215000, variance: -15000, variancePercent: 7.5, status: 'over' },
  { id: '6', category: 'Talent Fees', budgeted: -150000, actual: -145000, variance: 5000, variancePercent: -3.3, status: 'under' },
  { id: '7', category: 'Venue Costs', budgeted: -100000, actual: -98000, variance: 2000, variancePercent: -2, status: 'on-track' },
  { id: '8', category: 'Marketing', budgeted: -75000, actual: -82000, variance: -7000, variancePercent: 9.3, status: 'over' },
  { id: '9', category: 'Labor', budgeted: -80000, actual: -78000, variance: 2000, variancePercent: -2.5, status: 'on-track' },
  { id: '10', category: 'Insurance & Permits', budgeted: -25000, actual: -24000, variance: 1000, variancePercent: -4, status: 'on-track' },
];

export default function ProductionReconciliationPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totals = RECONCILIATION_DATA.reduce(
    (acc, item) => ({
      budgeted: acc.budgeted + item.budgeted,
      actual: acc.actual + item.actual,
      variance: acc.variance + item.variance,
    }),
    { budgeted: 0, actual: 0, variance: 0 }
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch(`/api/productions/${productionId}/reconciliation/refresh`, {
        method: 'POST',
      });
    } catch (_error) {
      // Handle error
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusBadge = (status: string, variance: number) => {
    if (status === 'on-track') {
      return <Badge variant="success">On Track</Badge>;
    }
    if (variance > 0) {
      return <Badge variant="success">Favorable</Badge>;
    }
    return <Badge variant="error">Unfavorable</Badge>;
  };

  return (
    <Stack gap={8}>
      <Stack direction="horizontal" className="items-start justify-between">
        <SectionHeader
          kicker="Production"
          title="Financial Reconciliation"
          description="Final budget vs actual comparison for production close-out"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </Stack>
      </Stack>

      <Grid cols={4} gap={4}>
        <StatCard
          label="Budgeted Net"
          value={`$${(totals.budgeted / 1000).toFixed(0)}K`}
          icon={<DollarSign size={20} />}
          inverted
        />
        <StatCard
          label="Actual Net"
          value={`$${(totals.actual / 1000).toFixed(0)}K`}
          icon={<DollarSign size={20} />}
          inverted
        />
        <StatCard
          label="Variance"
          value={`${totals.variance >= 0 ? '+' : ''}$${(totals.variance / 1000).toFixed(0)}K`}
          icon={totals.variance >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          trend={totals.variance >= 0 ? 'up' : 'down'}
          inverted
        />
        <StatCard
          label="Status"
          value={totals.variance >= 0 ? 'Favorable' : 'Unfavorable'}
          icon={totals.variance >= 0 ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          inverted
        />
      </Grid>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <H3 className="text-white">Budget vs Actual</H3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Budgeted</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RECONCILIATION_DATA.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">
                      ${Math.abs(item.budgeted).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ${Math.abs(item.actual).toLocaleString()}
                    </TableCell>
                    <TableCell className={`text-right ${item.variance >= 0 ? 'text-success' : 'text-error'}`}>
                      {item.variance >= 0 ? '+' : ''}${item.variance.toLocaleString()}
                    </TableCell>
                    <TableCell className={`text-right ${item.variancePercent >= 0 ? 'text-success' : 'text-error'}`}>
                      {item.variancePercent >= 0 ? '+' : ''}{item.variancePercent.toFixed(1)}%
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status, item.variance)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 border-ink-600 font-weight-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">${totals.budgeted.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${totals.actual.toLocaleString()}</TableCell>
                  <TableCell className={`text-right ${totals.variance >= 0 ? 'text-success' : 'text-error'}`}>
                    {totals.variance >= 0 ? '+' : ''}${totals.variance.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell>{getStatusBadge(totals.variance >= 0 ? 'over' : 'under', totals.variance)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Stack>
        </CardBody>
      </Card>

      <Stack direction="horizontal" gap={4} className="justify-end">
        <Button variant="solid">
          <CheckCircle size={16} className="mr-2" />
          Approve Reconciliation
        </Button>
      </Stack>
    </Stack>
  );
}
