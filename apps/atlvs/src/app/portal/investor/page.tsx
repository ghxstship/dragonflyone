'use client';

import { useState } from 'react';
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
} from '@ghxstship/ui';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  Download,
  FileText,
  BarChart3,
} from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';

interface Investment {
  id: string;
  production: string;
  amount: number;
  equity: number;
  status: 'active' | 'completed';
  projectedReturn: number;
  actualReturn?: number;
}

const MOCK_INVESTMENTS: Investment[] = [
  { id: 'I-001', production: 'Summer Music Festival 2024', amount: 250000, equity: 15, status: 'active', projectedReturn: 325000 },
  { id: 'I-002', production: 'Concert Series 2024', amount: 100000, equity: 10, status: 'completed', projectedReturn: 130000, actualReturn: 142000 },
  { id: 'I-003', production: 'New Years Eve Concert', amount: 150000, equity: 12, status: 'active', projectedReturn: 195000 },
];

export default function InvestorPortalPage() {
  const [investments] = useState(MOCK_INVESTMENTS);

  const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
  const totalReturns = investments.filter(i => i.actualReturn).reduce((sum, i) => sum + (i.actualReturn || 0), 0);
  const projectedReturns = investments.filter(i => i.status === 'active').reduce((sum, i) => sum + i.projectedReturn, 0);
  const avgROI = investments.filter(i => i.actualReturn).reduce((sum, i, _, arr) => sum + ((i.actualReturn! - i.amount) / i.amount * 100) / arr.length, 0);

  return (
    <AtlvsAppLayout>
      <Stack gap={8}>
        <SectionHeader kicker="Investor Portal" title="My Dashboard" description="Track investments and returns" colorScheme="on-dark" />

        <Grid cols={4} gap={4}>
          <StatCard label="Total Invested" value={`$${(totalInvested / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
          <StatCard label="Realized Returns" value={`$${(totalReturns / 1000).toFixed(0)}K`} icon={<TrendingUp size={20} />} trend="up" inverted />
          <StatCard label="Projected Returns" value={`$${(projectedReturns / 1000).toFixed(0)}K`} icon={<PieChart size={20} />} inverted />
          <StatCard label="Avg ROI" value={`${avgROI.toFixed(1)}%`} icon={<TrendingUp size={20} />} trend="up" inverted />
        </Grid>

        <Grid cols={2} gap={6}>
          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <H3 className="text-white">My Investments</H3>
                <Stack gap={3}>
                  {investments.map(investment => (
                    <Stack key={investment.id} className="rounded border-2 border-ink-700 p-4">
                      <Stack direction="horizontal" className="items-start justify-between">
                        <Stack gap={1}>
                          <Body className="font-weight-semibold text-white">{investment.production}</Body>
                          <Body className="text-body-sm text-on-dark-muted">{investment.equity}% equity stake</Body>
                        </Stack>
                        <Badge variant={investment.status === 'active' ? 'success' : 'info'}>
                          {investment.status}
                        </Badge>
                      </Stack>
                      <Stack direction="horizontal" className="mt-3 justify-between border-t border-ink-700 pt-3">
                        <Stack gap={0}>
                          <Body className="text-body-sm text-on-dark-muted">Invested</Body>
                          <Body className="font-weight-semibold text-white">${investment.amount.toLocaleString()}</Body>
                        </Stack>
                        <Stack gap={0}>
                          <Body className="text-body-sm text-on-dark-muted">Projected</Body>
                          <Body className="text-white">${investment.projectedReturn.toLocaleString()}</Body>
                        </Stack>
                        <Stack gap={0}>
                          <Body className="text-body-sm text-on-dark-muted">Actual</Body>
                          <Body className={investment.actualReturn ? 'font-weight-semibold text-success' : 'text-on-dark-muted'}>
                            {investment.actualReturn ? `$${investment.actualReturn.toLocaleString()}` : '-'}
                          </Body>
                        </Stack>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </CardBody>
          </Card>

          <Stack gap={6}>
            <Card variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <H3 className="text-white">Upcoming Distributions</H3>
                  <Stack gap={3}>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack gap={0}>
                        <Body className="text-white">Summer Music Festival</Body>
                        <Body className="text-body-sm text-on-dark-muted">Q4 Distribution</Body>
                      </Stack>
                      <Stack gap={0} className="text-right">
                        <Body className="font-weight-semibold text-white">$75,000</Body>
                        <Stack direction="horizontal" gap={1} className="items-center">
                          <Calendar size={12} className="text-on-dark-muted" />
                          <Body className="text-body-sm text-on-dark-muted">Dec 15, 2024</Body>
                        </Stack>
                      </Stack>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack gap={0}>
                        <Body className="text-white">New Years Eve Concert</Body>
                        <Body className="text-body-sm text-on-dark-muted">Final Settlement</Body>
                      </Stack>
                      <Stack gap={0} className="text-right">
                        <Body className="font-weight-semibold text-white">$195,000</Body>
                        <Stack direction="horizontal" gap={1} className="items-center">
                          <Calendar size={12} className="text-on-dark-muted" />
                          <Body className="text-body-sm text-on-dark-muted">Jan 31, 2025</Body>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>

            <Card variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <H3 className="text-white">Documents</H3>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <FileText size={16} />
                        <Body className="text-white">K-1 Tax Documents</Body>
                      </Stack>
                      <Button variant="ghost" size="sm"><Download size={14} /></Button>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <BarChart3 size={16} />
                        <Body className="text-white">Quarterly Reports</Body>
                      </Stack>
                      <Button variant="ghost" size="sm"><Download size={14} /></Button>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <FileText size={16} />
                        <Body className="text-white">Investment Agreements</Body>
                      </Stack>
                      <Button variant="ghost" size="sm"><Download size={14} /></Button>
                    </Stack>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        </Grid>
      </Stack>
    </AtlvsAppLayout>
  );
}
