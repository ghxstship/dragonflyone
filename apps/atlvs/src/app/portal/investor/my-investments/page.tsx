'use client';

import { useState } from 'react';
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
} from '@ghxstship/ui';
import { DollarSign, TrendingUp, PieChart, Calendar } from 'lucide-react';
import { AtlvsAppLayout } from '../../../../components/app-layout';

interface Investment {
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

const DEMO_INVESTMENTS: Investment[] = [
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
  {
    id: '3',
    name: 'Revenue Share - Venue Network',
    type: 'revenue_share',
    amount: 75000,
    date: '2023-09-01',
    status: 'active',
    currentValue: 82500,
    returnRate: 10,
    nextDistribution: '2025-03-01',
  },
  {
    id: '4',
    name: 'Seed Round - Ticketing Startup',
    type: 'equity',
    amount: 50000,
    date: '2022-03-20',
    status: 'exited',
    currentValue: 125000,
    returnRate: 150,
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
  const [investments] = useState<Investment[]>(DEMO_INVESTMENTS);

  const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
  const totalValue = investments.reduce((sum, i) => sum + i.currentValue, 0);
  const totalReturn = ((totalValue - totalInvested) / totalInvested) * 100;
  const activeCount = investments.filter((i) => i.status === 'active').length;

  return (
    <AtlvsAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Investor Portal"
          title="My Investments"
          description="Track your investment portfolio and returns"
          colorScheme="on-dark"
        />

        <Grid cols={4} gap={4}>
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
                          <Body className="text-body-sm text-on-dark-muted">
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
                          <Body className="text-body-sm text-on-dark-muted">Amount Invested</Body>
                          <Body className="font-weight-semibold text-white">${investment.amount.toLocaleString()}</Body>
                        </Stack>
                        <Stack gap={0}>
                          <Body className="text-body-sm text-on-dark-muted">Current Value</Body>
                          <Body className="font-weight-semibold text-white">${investment.currentValue.toLocaleString()}</Body>
                        </Stack>
                        <Stack gap={0}>
                          <Body className="text-body-sm text-on-dark-muted">Gain/Loss</Body>
                          <Body className={investment.currentValue >= investment.amount ? 'text-success' : 'text-error'}>
                            {investment.currentValue >= investment.amount ? '+' : ''}${(investment.currentValue - investment.amount).toLocaleString()}
                          </Body>
                        </Stack>
                        <Stack gap={0}>
                          <Body className="text-body-sm text-on-dark-muted">Next Distribution</Body>
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
