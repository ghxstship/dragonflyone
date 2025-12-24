'use client';

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
  Skeleton,
} from '@ghxstship/ui';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  Download,
  FileText,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { useInvestors, type Investor } from '@ghxstship/config';
import { DEMO_INVESTMENTS, type DemoInvestment } from '../../../lib/demo-data';

export default function InvestorPortalPage() {
  const { investors: apiInvestors, isLoading, error, refetch } = useInvestors({ status: 'funded' });

  // Map API investors to display format or fall back to demo data
  const investments: DemoInvestment[] = apiInvestors.length > 0
    ? apiInvestors.map((inv: Investor) => ({
        id: inv.id,
        fund: inv.name,
        amount: inv.investment_amount,
        returns: 0, // Would come from distributions API
        ownership: inv.ownership_percentage || 0,
        status: (inv.status === 'funded' ? 'active' : 'pending') as 'active' | 'pending',
        lastDistribution: inv.funding_date || 'N/A',
      }))
    : DEMO_INVESTMENTS;

  const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
  const totalReturns = investments.reduce((sum, i) => sum + i.returns, 0);
  const projectedReturns = investments.filter(i => i.status === 'active').reduce((sum, i) => sum + (i.amount * 1.15), 0);
  const avgROI = investments.filter(i => i.returns > 0).length > 0
    ? investments.filter(i => i.returns > 0).reduce((sum, i, _, arr) => sum + (i.returns / i.amount * 100) / arr.length, 0)
    : 0;

  if (isLoading) {
    return (
      <AtlvsAppLayout>
        <Stack gap={8}>
          <SectionHeader kicker="Investor Portal" title="My Dashboard" description="Track investments and returns" colorScheme="on-dark" />
          <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} inverted className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24" />
              </Card>
            ))}
          </Grid>
          <Card inverted className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Stack gap={3}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </Stack>
          </Card>
        </Stack>
      </AtlvsAppLayout>
    );
  }

  if (error) {
    return (
      <AtlvsAppLayout>
        <Stack gap={8}>
          <SectionHeader kicker="Investor Portal" title="My Dashboard" description="Track investments and returns" colorScheme="on-dark" />
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
        <SectionHeader kicker="Investor Portal" title="My Dashboard" description="Track investments and returns" colorScheme="on-dark" />

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Invested" value={`$${(totalInvested / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
          <StatCard label="Realized Returns" value={`$${(totalReturns / 1000).toFixed(0)}K`} icon={<TrendingUp size={20} />} trend="up" inverted />
          <StatCard label="Projected Returns" value={`$${(projectedReturns / 1000).toFixed(0)}K`} icon={<PieChart size={20} />} inverted />
          <StatCard label="Avg ROI" value={`${avgROI.toFixed(1)}%`} icon={<TrendingUp size={20} />} trend="up" inverted />
        </Grid>

        <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <H3 className="text-white">My Investments</H3>
                <Stack gap={3}>
                  {investments.map(investment => (
                    <Stack key={investment.id} className="rounded border-2 border-ink-700 p-4">
                      <Stack direction="horizontal" className="items-start justify-between">
                        <Stack gap={1}>
                          <Body className="font-weight-semibold text-white">{investment.fund}</Body>
                          <Body size="sm" className=" text-on-dark-muted">{investment.ownership}% ownership stake</Body>
                        </Stack>
                        <Badge variant={investment.status === 'active' ? 'success' : 'info'}>
                          {investment.status}
                        </Badge>
                      </Stack>
                      <Stack direction="horizontal" className="mt-3 justify-between border-t border-ink-700 pt-3">
                        <Stack gap={0}>
                          <Body size="sm" className=" text-on-dark-muted">Invested</Body>
                          <Body className="font-weight-semibold text-white">${investment.amount.toLocaleString()}</Body>
                        </Stack>
                        <Stack gap={0}>
                          <Body size="sm" className=" text-on-dark-muted">Returns</Body>
                          <Body className="text-white">${investment.returns.toLocaleString()}</Body>
                        </Stack>
                        <Stack gap={0}>
                          <Body size="sm" className=" text-on-dark-muted">Last Distribution</Body>
                          <Body className={investment.returns > 0 ? 'font-weight-semibold text-success' : 'text-on-dark-muted'}>
                            {investment.lastDistribution}
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
                        <Body size="sm" className=" text-on-dark-muted">Q4 Distribution</Body>
                      </Stack>
                      <Stack gap={0} className="text-right">
                        <Body className="font-weight-semibold text-white">$75,000</Body>
                        <Stack direction="horizontal" gap={1} className="items-center">
                          <Calendar size={12} className="text-on-dark-muted" />
                          <Body size="sm" className=" text-on-dark-muted">Dec 15, 2024</Body>
                        </Stack>
                      </Stack>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack gap={0}>
                        <Body className="text-white">New Years Eve Concert</Body>
                        <Body size="sm" className=" text-on-dark-muted">Final Settlement</Body>
                      </Stack>
                      <Stack gap={0} className="text-right">
                        <Body className="font-weight-semibold text-white">$195,000</Body>
                        <Stack direction="horizontal" gap={1} className="items-center">
                          <Calendar size={12} className="text-on-dark-muted" />
                          <Body size="sm" className=" text-on-dark-muted">Jan 31, 2025</Body>
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
