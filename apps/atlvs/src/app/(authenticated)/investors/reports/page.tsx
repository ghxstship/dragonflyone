'use client';

import { useRouter } from 'next/navigation';
import { Download, TrendingUp, DollarSign, Users, PieChart, BarChart3 } from 'lucide-react';
import { AtlvsAppLayout } from '../../../../components/app-layout';
import { useInvestorStats, useInvestors, useInvestmentRounds } from '../../../../hooks/useInvestors';
import {
  Container,
  Section,
  Stack,
  Grid,
  Card,
  H2,
  H3,
  Body,
  Button,
  Badge,
  Box,
  StatCard,
} from '@ghxstship/ui';

export default function InvestorReportsPage() {
  const router = useRouter();
  const { data: stats } = useInvestorStats();
  const { data: investors } = useInvestors();
  const { data: rounds } = useInvestmentRounds();

  // Calculate round distribution
  const roundDistribution = rounds?.map(round => {
    const roundInvestors = investors?.filter(i => i.round_id === round.id) || [];
    const totalInvested = roundInvestors.reduce((sum, i) => sum + (i.investment_amount || 0), 0);
    return {
      ...round,
      investorCount: roundInvestors.length,
      totalInvested,
      progress: round.target_amount ? Math.round((round.raised_amount / round.target_amount) * 100) : 0,
    };
  }) || [];

  // Calculate status distribution
  const statusDistribution = [
    { status: 'Funded', count: stats?.funded || 0, color: '#22c55e' },
    { status: 'Committed', count: stats?.committed || 0, color: '#f59e0b' },
    { status: 'Prospect', count: stats?.prospect || 0, color: '#6b7280' },
  ];

  // Calculate type distribution
  const typeDistribution = [
    { type: 'Individual', count: investors?.filter(i => i.investor_type === 'individual').length || 0 },
    { type: 'Entity', count: investors?.filter(i => i.investor_type === 'entity').length || 0 },
    { type: 'Fund', count: investors?.filter(i => i.investor_type === 'fund').length || 0 },
  ];

  const fundingRate = stats?.totalCommitted ? Math.round((stats.totalFunded / stats.totalCommitted) * 100) : 0;

  return (
    <AtlvsAppLayout>
      <Section className="min-h-screen bg-grey-100 py-8">
        <Container>
          <Stack gap={6}>
            {/* Header */}
            <Stack direction="horizontal" gap={4} className="items-center justify-between">
              <Stack gap={1}>
                <H2>Investor Reports</H2>
                <Body className="text-grey-600">Analytics and insights for investor relations</Body>
              </Stack>
              <Button
                onClick={() => {}}
                className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
              >
                <Download className="size-4" />
                Export Report
              </Button>
            </Stack>

            {/* Key Metrics */}
            <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total Investors"
                value={stats?.totalInvestors || 0}
                icon={<Users className="size-5" />}
              />
              <StatCard
                label="Total Committed"
                value={`$${(stats?.totalCommitted || 0).toLocaleString()}`}
                icon={<DollarSign className="size-5" />}
              />
              <StatCard
                label="Total Funded"
                value={`$${(stats?.totalFunded || 0).toLocaleString()}`}
                icon={<DollarSign className="size-5" />}
                trend="up"
                trendValue={`${fundingRate}%`}
              />
              <StatCard
                label="Open Rounds"
                value={stats?.openRounds || 0}
                icon={<TrendingUp className="size-5" />}
              />
            </Grid>

            <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
              {/* Round Progress */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <BarChart3 className="size-5 text-grey-500" />
                    <H3>Round Progress</H3>
                  </Stack>
                  <Stack gap={3}>
                    {roundDistribution.map(round => (
                      <Box key={round.id} className="flex flex-col gap-2">
                        <Stack direction="horizontal" gap={4} className="items-center justify-between">
                          <Body className="font-weight-semibold">{round.name}</Body>
                          <Badge variant={round.status === 'closed' ? 'success' : round.status === 'open' ? 'info' : 'ghost'}>
                            {round.status.toUpperCase()}
                          </Badge>
                        </Stack>
                        <Box className="h-3 overflow-hidden rounded-badge bg-grey-200">
                          <Box 
                            className="h-full bg-success" 
                            style={{ width: `${round.progress}%` }} 
                          />
                        </Box>
                        <Stack direction="horizontal" gap={4} className="items-center justify-between">
                          <Body size="sm" className=" text-grey-500">
                            ${round.raised_amount?.toLocaleString()} of ${round.target_amount?.toLocaleString()}
                          </Body>
                          <Body size="sm" className=" text-grey-500">{round.progress}%</Body>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </Card>

              {/* Status Distribution */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <PieChart className="size-5 text-grey-500" />
                    <H3>Investor Status</H3>
                  </Stack>
                  <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
                    {statusDistribution.map(item => (
                      <Card key={item.status} className="border-2 border-grey-200 p-4 text-center">
                        <Stack gap={2}>
                          <Box 
                            className="mx-auto size-4 rounded-avatar" 
                            style={{ backgroundColor: item.color }} 
                          />
                          <Body className="text-body-lg font-weight-bold">{item.count}</Body>
                          <Body size="sm" className=" text-grey-500">{item.status}</Body>
                        </Stack>
                      </Card>
                    ))}
                  </Grid>
                </Stack>
              </Card>

              {/* Type Distribution */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <H3>Investor Types</H3>
                  <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
                    {typeDistribution.map(item => (
                      <Card key={item.type} className="border-2 border-grey-200 p-4 text-center">
                        <Stack gap={2}>
                          <Body className="text-body-lg font-weight-bold">{item.count}</Body>
                          <Body size="sm" className=" text-grey-500">{item.type}</Body>
                        </Stack>
                      </Card>
                    ))}
                  </Grid>
                </Stack>
              </Card>

              {/* Funding Progress */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <H3>Funding Progress</H3>
                  <Box className="h-6 overflow-hidden rounded-card bg-grey-200">
                    <Box 
                      className="h-full bg-success" 
                      style={{ width: `${fundingRate}%` }} 
                    />
                  </Box>
                  <Stack direction="horizontal" gap={4} className="items-center justify-between">
                    <Body size="sm" className=" text-grey-500">
                      ${(stats?.totalFunded || 0).toLocaleString()} funded of ${(stats?.totalCommitted || 0).toLocaleString()} committed
                    </Body>
                    <Badge variant="success">{fundingRate}%</Badge>
                  </Stack>
                  <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                    <Stack gap={1}>
                      <Body size="sm" className=" text-grey-500">Total Target</Body>
                      <Body className="font-weight-semibold">${(stats?.totalTarget || 0).toLocaleString()}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body size="sm" className=" text-grey-500">Total Raised</Body>
                      <Body className="font-weight-semibold">${(stats?.totalRaised || 0).toLocaleString()}</Body>
                    </Stack>
                  </Grid>
                </Stack>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Card className="border-2 border-grey-200 p-6">
              <Stack gap={4}>
                <H3>Quick Actions</H3>
                <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
                  <Button
                    onClick={() => router.push('/investors')}
                    className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                  >
                    <Users className="size-4" />
                    View All Investors
                  </Button>
                  <Button
                    onClick={() => router.push('/investors/rounds')}
                    className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                  >
                    <BarChart3 className="size-4" />
                    Investment Rounds
                  </Button>
                  <Button
                    onClick={() => router.push('/investors/documents')}
                    className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                  >
                    <PieChart className="size-4" />
                    Documents
                  </Button>
                  <Button
                    onClick={() => {}}
                    className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                  >
                    <Download className="size-4" />
                    Export Data
                  </Button>
                </Grid>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Section>
    </AtlvsAppLayout>
  );
}
