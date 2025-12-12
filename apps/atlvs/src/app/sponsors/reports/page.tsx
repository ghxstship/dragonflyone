'use client';

import { useRouter } from 'next/navigation';
import { Download, TrendingUp, DollarSign, Users, PieChart, BarChart3 } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { useSponsorStats, useSponsors, useSponsorTiers } from '../../../hooks/useSponsors';
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

export default function SponsorReportsPage() {
  const router = useRouter();
  const { data: stats } = useSponsorStats();
  const { data: sponsors } = useSponsors();
  const { data: tiers } = useSponsorTiers();

  // Calculate tier distribution
  const tierDistribution = tiers?.map(tier => {
    const tierSponsors = sponsors?.filter(s => s.sponsor_tier_id === tier.id) || [];
    const totalValue = tierSponsors.reduce((sum, s) => sum + (s.contract_value || 0), 0);
    const totalPaid = tierSponsors.reduce((sum, s) => sum + (s.amount_paid || 0), 0);
    return {
      ...tier,
      count: tierSponsors.length,
      totalValue,
      totalPaid,
    };
  }).sort((a, b) => b.level - a.level) || [];

  // Calculate status distribution
  const statusDistribution = [
    { status: 'Confirmed', count: sponsors?.filter(s => s.status === 'confirmed').length || 0, color: '#22c55e' },
    { status: 'Active', count: sponsors?.filter(s => s.status === 'active').length || 0, color: '#3b82f6' },
    { status: 'Negotiating', count: sponsors?.filter(s => s.status === 'negotiating').length || 0, color: '#f59e0b' },
    { status: 'Prospect', count: sponsors?.filter(s => s.status === 'prospect').length || 0, color: '#6b7280' },
    { status: 'Completed', count: sponsors?.filter(s => s.status === 'completed').length || 0, color: '#8b5cf6' },
  ];

  // Calculate payment status
  const paymentDistribution = [
    { status: 'Paid', count: sponsors?.filter(s => s.payment_status === 'paid').length || 0, color: '#22c55e' },
    { status: 'Partial', count: sponsors?.filter(s => s.payment_status === 'partial').length || 0, color: '#f59e0b' },
    { status: 'Pending', count: sponsors?.filter(s => s.payment_status === 'pending').length || 0, color: '#6b7280' },
    { status: 'Overdue', count: sponsors?.filter(s => s.payment_status === 'overdue').length || 0, color: '#ef4444' },
  ];

  const collectionRate = stats?.totalValue ? Math.round((stats.totalPaid / stats.totalValue) * 100) : 0;

  return (
    <AtlvsAppLayout>
      <Section className="min-h-screen bg-grey-100 py-8">
        <Container>
          <Stack gap={6}>
            {/* Header */}
            <Stack direction="horizontal" gap={4} className="items-center justify-between">
              <Stack gap={1}>
                <H2>Sponsor Reports</H2>
                <Body className="text-grey-600">Analytics and insights for sponsorship performance</Body>
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
            <Grid cols={4} gap={4}>
              <StatCard
                label="Total Sponsors"
                value={stats?.total || 0}
                icon={<Users className="size-5" />}
              />
              <StatCard
                label="Total Contract Value"
                value={`$${(stats?.totalValue || 0).toLocaleString()}`}
                icon={<DollarSign className="size-5" />}
              />
              <StatCard
                label="Amount Collected"
                value={`$${(stats?.totalPaid || 0).toLocaleString()}`}
                icon={<DollarSign className="size-5" />}
                trend="up"
                trendValue={`${collectionRate}%`}
              />
              <StatCard
                label="Outstanding"
                value={`$${(stats?.outstanding || 0).toLocaleString()}`}
                icon={<TrendingUp className="size-5" />}
              />
            </Grid>

            <Grid cols={2} gap={6}>
              {/* Tier Distribution */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <PieChart className="size-5 text-grey-500" />
                    <H3>Revenue by Tier</H3>
                  </Stack>
                  <Stack gap={3}>
                    {tierDistribution.map(tier => (
                      <Box key={tier.id} className="flex items-center gap-4">
                        <Badge>{tier.name}</Badge>
                        <Box className="flex-1">
                          <Box className="mb-1 flex items-center justify-between">
                            <Body size="sm" className="">{tier.count} sponsors</Body>
                            <Body size="sm" className=" text-grey-500">${tier.totalValue.toLocaleString()}</Body>
                          </Box>
                          <Box className="h-2 overflow-hidden rounded-badge bg-grey-200">
                            <Box 
                              className="h-full bg-primary" 
                              style={{ width: `${(tier.totalValue / (stats?.totalValue || 1)) * 100}%` }} 
                            />
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </Card>

              {/* Status Distribution */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <BarChart3 className="size-5 text-grey-500" />
                    <H3>Sponsor Status</H3>
                  </Stack>
                  <Grid cols={2} gap={4}>
                    {statusDistribution.map(item => (
                      <Stack key={item.status} direction="horizontal" gap={3} className="items-center">
                        <Box 
                          className="size-4 rounded-badge" 
                          style={{ backgroundColor: item.color }} 
                        />
                        <Stack gap={0}>
                          <Body className="font-weight-semibold">{item.count}</Body>
                          <Body size="sm" className=" text-grey-500">{item.status}</Body>
                        </Stack>
                      </Stack>
                    ))}
                  </Grid>
                </Stack>
              </Card>

              {/* Payment Status */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <DollarSign className="size-5 text-grey-500" />
                    <H3>Payment Status</H3>
                  </Stack>
                  <Grid cols={2} gap={4}>
                    {paymentDistribution.map(item => (
                      <Stack key={item.status} direction="horizontal" gap={3} className="items-center">
                        <Box 
                          className="size-4 rounded-badge" 
                          style={{ backgroundColor: item.color }} 
                        />
                        <Stack gap={0}>
                          <Body className="font-weight-semibold">{item.count}</Body>
                          <Body size="sm" className=" text-grey-500">{item.status}</Body>
                        </Stack>
                      </Stack>
                    ))}
                  </Grid>
                </Stack>
              </Card>

              {/* Collection Progress */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <H3>Collection Progress</H3>
                  <Box className="h-6 overflow-hidden rounded-card bg-grey-200">
                    <Box 
                      className="h-full bg-success" 
                      style={{ width: `${collectionRate}%` }} 
                    />
                  </Box>
                  <Stack direction="horizontal" gap={4} className="items-center justify-between">
                    <Body size="sm" className=" text-grey-500">
                      ${(stats?.totalPaid || 0).toLocaleString()} collected of ${(stats?.totalValue || 0).toLocaleString()}
                    </Body>
                    <Badge variant="success">{collectionRate}%</Badge>
                  </Stack>
                  <Grid cols={2} gap={4}>
                    <Stack gap={1}>
                      <Body size="sm" className=" text-grey-500">Paid in Full</Body>
                      <Body className="font-weight-semibold">{stats?.paidInFull || 0} sponsors</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body size="sm" className=" text-grey-500">Overdue</Body>
                      <Body className="font-weight-semibold text-error">{stats?.overdue || 0} sponsors</Body>
                    </Stack>
                  </Grid>
                </Stack>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Card className="border-2 border-grey-200 p-6">
              <Stack gap={4}>
                <H3>Quick Actions</H3>
                <Grid cols={4} gap={4}>
                  <Button
                    onClick={() => router.push('/sponsors')}
                    className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                  >
                    <Users className="size-4" />
                    View All Sponsors
                  </Button>
                  <Button
                    onClick={() => router.push('/sponsors/tiers')}
                    className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                  >
                    <PieChart className="size-4" />
                    Manage Tiers
                  </Button>
                  <Button
                    onClick={() => router.push('/sponsors/fulfillment')}
                    className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                  >
                    <BarChart3 className="size-4" />
                    Fulfillment
                  </Button>
                  <Button
                    onClick={() => router.push('/sponsors/deck')}
                    className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                  >
                    <Download className="size-4" />
                    Sponsorship Deck
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
