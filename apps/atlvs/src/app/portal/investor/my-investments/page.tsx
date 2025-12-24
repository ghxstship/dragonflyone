'use client';

import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  Grid,
  Badge,
  Body,
  H3,
  StatCard,
  ProgressBar,
  Skeleton,
  Button,
} from '@ghxstship/ui';
import { DollarSign, TrendingUp, PieChart, Calendar, AlertCircle } from 'lucide-react';
import { AtlvsAppLayout } from '../../../../components/app-layout';
import { useInvestors, type Investor } from '@ghxstship/config';

interface DisplayInvestment {
  id: string;
  name: string;
  type: 'equity' | 'convertible' | 'revenue_share';
  amount: number;
  date: string;
  status: 'active' | 'pending' | 'exited';
  currentValue: number;
  returnRate: number;
  nextDistribution: string | null;
}

const DEMO_INVESTMENTS: DisplayInvestment[] = [
  {
    id: '1',
    name: 'Series A - Live Events Platform',
    type: 'equity',
    amount: 250000,
    date: '2023-06-15',
    status: 'active',
    currentValue: 312500,
    returnRate: 25,
    nextDistribution: '2025-06-15',
  },
  {
    id: '2',
    name: 'Convertible Note - Festival Tech',
    type: 'convertible',
    amount: 100000,
    date: '2024-01-10',
    status: 'active',
    currentValue: 108000,
    returnRate: 8,
    nextDistribution: null,
  },
];

const typeLabels: Record<string, string> = {
  equity: 'Equity',
  convertible: 'Convertible Note',
  revenue_share: 'Revenue Share',
};

const statusVariants: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
  active: 'success',
  pending: 'warning',
  exited: 'info',
};

export default function MyInvestmentsPage() {
  const { investors: apiInvestors, isLoading, error, refetch } = useInvestors();

  // Map API investors to display format or fall back to demo data
  const investments: DisplayInvestment[] = apiInvestors.length > 0
    ? apiInvestors.map((i: Investor) => ({
        id: i.id,
        name: i.name || i.contact_name || 'Investment',
        type: (i.investor_type === 'individual' ? 'equity' : i.investor_type === 'entity' ? 'convertible' : 'revenue_share') as DisplayInvestment['type'],
        amount: i.investment_amount || 0,
        date: i.created_at,
        status: (i.status === 'funded' ? 'active' : i.status === 'exited' ? 'exited' : 'pending') as DisplayInvestment['status'],
        currentValue: (i.investment_amount || 0) * 1.1, // Placeholder calculation
        returnRate: 10, // Placeholder
        nextDistribution: null,
      }))
    : DEMO_INVESTMENTS;

  const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
  const totalValue = investments.reduce((sum, i) => sum + i.currentValue, 0);
  const totalReturn = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;
  const activeCount = investments.filter((i) => i.status === 'active').length;

  if (isLoading) {
    return (
      <AtlvsAppLayout>
        <Stack gap={8}>
          <SectionHeader kicker="Investor Portal" title="My Investments" description="Track your investment portfolio and returns" colorScheme="on-dark" />
          <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} inverted className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24" />
              </Card>
            ))}
          </Grid>
        </Stack>
      </AtlvsAppLayout>
    );
  }

  if (error) {
    return (
      <AtlvsAppLayout>
        <Stack gap={8}>
          <SectionHeader kicker="Investor Portal" title="My Investments" description="Track your investment portfolio and returns" colorScheme="on-dark" />
          <Card inverted className="p-8 text-center">
            <Stack gap={4} className="items-center">
              <AlertCircle size={48} className="text-error" />
              <H3 className="text-white">Failed to Load Investments</H3>
              <Body className="text-grey-300">{error.message}</Body>
              <Button variant="solid" onClick={() => refetch()}>
                Try Again
              </Button>
            </Stack>
          </Card>
        </Stack>
      </AtlvsAppLayout>
    );
  }

  return (
    <AtlvsAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Investor Portal"
          title="My Investments"
          description="Track your investment portfolio and returns"
          colorScheme="on-dark"
        />

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Invested" value={`$${(totalInvested / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
          <StatCard label="Current Value" value={`$${(totalValue / 1000).toFixed(0)}K`} icon={<PieChart size={20} />} inverted />
          <StatCard label="Total Return" value={`${totalReturn.toFixed(1)}%`} icon={<TrendingUp size={20} />} inverted />
          <StatCard label="Active Investments" value={activeCount.toString()} icon={<Calendar size={20} />} inverted />
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <H3 className="text-white">Investment Portfolio</H3>

              <Stack gap={3}>
                {investments.map((investment) => (
                  <Stack key={investment.id} className="rounded border-2 border-ink-700 p-4">
                    <Stack direction="horizontal" className="items-start justify-between">
                      <Stack gap={1}>
                        <Body className="font-weight-semibold text-white">{investment.name}</Body>
                        <Stack direction="horizontal" gap={2}>
                          <Badge variant="info">{typeLabels[investment.type]}</Badge>
                          <Body size="sm" className=" text-on-dark-muted">
                            Invested: {new Date(investment.date).toLocaleDateString()}
                          </Body>
                        </Stack>
                      </Stack>
                      <Badge variant={statusVariants[investment.status]}>
                        {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                      </Badge>
                    </Stack>
                    <Stack gap={2} className="mt-3 border-t border-ink-700 pt-3">
                      <Stack direction="horizontal" className="justify-between">
                        <Body className="text-on-dark-muted">Return</Body>
                        <Body className={investment.returnRate >= 0 ? 'text-success' : 'text-error'}>
                          {investment.returnRate >= 0 ? '+' : ''}{investment.returnRate}%
                        </Body>
                      </Stack>
                      <ProgressBar value={Math.min(investment.returnRate, 100)} />
                      <Stack direction="horizontal" className="justify-between">
                        <Stack gap={0}>
                          <Body size="sm" className=" text-on-dark-muted">Amount Invested</Body>
                          <Body className="font-weight-semibold text-white">${investment.amount.toLocaleString()}</Body>
                        </Stack>
                        <Stack gap={0}>
                          <Body size="sm" className=" text-on-dark-muted">Current Value</Body>
                          <Body className="font-weight-semibold text-white">${investment.currentValue.toLocaleString()}</Body>
                        </Stack>
                        <Stack gap={0}>
                          <Body size="sm" className=" text-on-dark-muted">Gain/Loss</Body>
                          <Body className={investment.currentValue >= investment.amount ? 'text-success' : 'text-error'}>
                            {investment.currentValue >= investment.amount ? '+' : ''}${(investment.currentValue - investment.amount).toLocaleString()}
                          </Body>
                        </Stack>
                        <Stack gap={0}>
                          <Body size="sm" className=" text-on-dark-muted">Next Distribution</Body>
                          <Body className="text-white">
                            {investment.nextDistribution ? new Date(investment.nextDistribution).toLocaleDateString() : 'N/A'}
                          </Body>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </AtlvsAppLayout>
  );
}
