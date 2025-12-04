'use client';

import { useRouter } from 'next/navigation';
import { TrendingUp, DollarSign, Users, CheckSquare, Shield, Building2, Calendar, Target } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import { useProductionMetrics, useKPIs } from '../../hooks/useMetrics';
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

export default function MetricsPage() {
  const router = useRouter();
  // TODO: Get productionId from route params or context
  const productionId = '';
  const { data: metrics } = useProductionMetrics(productionId);
  const { data: kpis } = useKPIs(productionId);

  const kpiStatusColors: Record<string, 'success' | 'warning' | 'error'> = {
    on_track: 'success',
    at_risk: 'warning',
    off_track: 'error',
  };

  const categoryLabels: Record<string, string> = {
    financial: 'Financial',
    operational: 'Operational',
    compliance: 'Compliance',
    engagement: 'Engagement',
  };

  return (
    <AtlvsAppLayout>
      <Section className="min-h-screen bg-grey-100 py-8">
        <Container>
          <Stack gap={6}>
            {/* Header */}
            <Stack direction="horizontal" gap={4} className="items-center justify-between">
              <Stack gap={1}>
                <H2>Production Metrics</H2>
                <Body className="text-grey-600">Key performance indicators and production analytics</Body>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Button
                  onClick={() => router.push('/metrics/kpis')}
                  className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                >
                  <Target className="size-4" />
                  KPI Dashboard
                </Button>
                <Button
                  onClick={() => router.push('/metrics/reports')}
                  className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                >
                  <TrendingUp className="size-4" />
                  Reports
                </Button>
              </Stack>
            </Stack>

            {/* Key Stats */}
            <Grid cols={4} gap={4}>
              <StatCard
                label="Budget Utilization"
                value={`${metrics?.budgetUtilization || 0}%`}
                icon={<DollarSign className="size-5" />}
                trend={metrics?.budgetUtilization && metrics.budgetUtilization <= 80 ? 'up' : 'down'}
              />
              <StatCard
                label="Task Completion"
                value={`${metrics?.taskCompletionRate || 0}%`}
                icon={<CheckSquare className="size-5" />}
                trend="up"
                trendValue={`${metrics?.tasksCompleted || 0}/${metrics?.totalTasks || 0}`}
              />
              <StatCard
                label="Funding Progress"
                value={`${metrics?.fundingProgress || 0}%`}
                icon={<TrendingUp className="size-5" />}
                trend="up"
              />
              <StatCard
                label="Days Until Event"
                value={metrics?.daysUntilEvent || 0}
                icon={<Calendar className="size-5" />}
              />
            </Grid>

            {/* KPI Overview */}
            <Card className="border-2 border-grey-200 p-6">
              <Stack gap={4}>
                <Stack direction="horizontal" gap={4} className="items-center justify-between">
                  <H3>Key Performance Indicators</H3>
                  <Button
                    onClick={() => router.push('/metrics/kpis')}
                    className="border-2 border-grey-300 bg-white px-4 py-2"
                  >
                    View All
                  </Button>
                </Stack>
                <Grid cols={3} gap={4}>
                  {kpis?.slice(0, 6).map(kpi => (
                    <Card key={kpi.id} className="border-2 border-grey-200 p-4">
                      <Stack gap={3}>
                        <Stack direction="horizontal" gap={2} className="items-center justify-between">
                          <Body className="text-body-sm text-grey-500">{categoryLabels[kpi.category]}</Body>
                          <Badge variant={kpiStatusColors[kpi.status]}>
                            {kpi.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="font-weight-semibold">{kpi.name}</Body>
                          <Stack direction="horizontal" gap={2} className="items-baseline">
                            <Body className="text-body-lg font-weight-bold">{kpi.value}{kpi.unit}</Body>
                            <Body className="text-body-sm text-grey-500">/ {kpi.target}{kpi.unit}</Body>
                          </Stack>
                        </Stack>
                        <Box className="h-2 overflow-hidden bg-grey-200 rounded-badge">
                          <Box 
                            className={`h-full ${kpi.status === 'on_track' ? 'bg-success' : kpi.status === 'at_risk' ? 'bg-warning' : 'bg-error'}`}
                            style={{ width: `${Math.min(100, (kpi.value / kpi.target) * 100)}%` }} 
                          />
                        </Box>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Card>

            <Grid cols={2} gap={6}>
              {/* Financial Overview */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <DollarSign className="size-5 text-grey-500" />
                    <H3>Financial Overview</H3>
                  </Stack>
                  <Grid cols={2} gap={4}>
                    <Stack gap={1}>
                      <Body className="text-body-sm text-grey-500">Total Budget</Body>
                      <Body className="text-body-lg font-weight-bold">${(metrics?.totalBudget || 0).toLocaleString()}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body className="text-body-sm text-grey-500">Total Spent</Body>
                      <Body className="text-body-lg font-weight-bold">${(metrics?.totalSpent || 0).toLocaleString()}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body className="text-body-sm text-grey-500">Sponsor Revenue</Body>
                      <Body className="text-body-lg font-weight-bold">${(metrics?.sponsorRevenue || 0).toLocaleString()}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body className="text-body-sm text-grey-500">Investment Raised</Body>
                      <Body className="text-body-lg font-weight-bold">${(metrics?.totalRaised || 0).toLocaleString()}</Body>
                    </Stack>
                  </Grid>
                </Stack>
              </Card>

              {/* Operations Overview */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <CheckSquare className="size-5 text-grey-500" />
                    <H3>Operations Overview</H3>
                  </Stack>
                  <Grid cols={2} gap={4}>
                    <Stack gap={1}>
                      <Body className="text-body-sm text-grey-500">Total Tasks</Body>
                      <Body className="text-body-lg font-weight-bold">{metrics?.totalTasks || 0}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body className="text-body-sm text-grey-500">Completed</Body>
                      <Body className="text-body-lg font-weight-bold text-success">{metrics?.tasksCompleted || 0}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body className="text-body-sm text-grey-500">Critical Tasks</Body>
                      <Body className="text-body-lg font-weight-bold text-error">{metrics?.criticalTasks || 0}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body className="text-body-sm text-grey-500">Completion Rate</Body>
                      <Body className="text-body-lg font-weight-bold">{metrics?.taskCompletionRate || 0}%</Body>
                    </Stack>
                  </Grid>
                </Stack>
              </Card>

              {/* Compliance Overview */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Shield className="size-5 text-grey-500" />
                    <H3>Compliance Overview</H3>
                  </Stack>
                  <Grid cols={2} gap={4}>
                    <Stack gap={1}>
                      <Body className="text-body-sm text-grey-500">Total Permits</Body>
                      <Body className="text-body-lg font-weight-bold">{metrics?.totalPermits || 0}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body className="text-body-sm text-grey-500">Approved</Body>
                      <Body className="text-body-lg font-weight-bold text-success">{metrics?.permitsApproved || 0}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body className="text-body-sm text-grey-500">Expiring Soon</Body>
                      <Body className="text-body-lg font-weight-bold text-warning">{metrics?.permitsExpiringSoon || 0}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body className="text-body-sm text-grey-500">Insurance Coverage</Body>
                      <Body className="text-body-lg font-weight-bold">${((metrics?.insuranceCoverage || 0) / 1000000).toFixed(1)}M</Body>
                    </Stack>
                  </Grid>
                </Stack>
              </Card>

              {/* Venues Overview */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Building2 className="size-5 text-grey-500" />
                    <H3>Venues Overview</H3>
                  </Stack>
                  <Grid cols={2} gap={4}>
                    <Stack gap={1}>
                      <Body className="text-body-sm text-grey-500">Total Venues</Body>
                      <Body className="text-body-lg font-weight-bold">{metrics?.totalVenues || 0}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body className="text-body-sm text-grey-500">Total Capacity</Body>
                      <Body className="text-body-lg font-weight-bold">{(metrics?.totalCapacity || 0).toLocaleString()}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body className="text-body-sm text-grey-500">Venues Cost</Body>
                      <Body className="text-body-lg font-weight-bold">${(metrics?.venuesCost || 0).toLocaleString()}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body className="text-body-sm text-grey-500">Total Sponsors</Body>
                      <Body className="text-body-lg font-weight-bold">{metrics?.totalSponsors || 0}</Body>
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
                    onClick={() => router.push('/expenses')}
                    className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                  >
                    <DollarSign className="size-4" />
                    Expenses
                  </Button>
                  <Button
                    onClick={() => router.push('/schedule/tasks')}
                    className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                  >
                    <CheckSquare className="size-4" />
                    Tasks
                  </Button>
                  <Button
                    onClick={() => router.push('/sponsors')}
                    className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                  >
                    <Users className="size-4" />
                    Sponsors
                  </Button>
                  <Button
                    onClick={() => router.push('/permits')}
                    className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                  >
                    <Shield className="size-4" />
                    Permits
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
