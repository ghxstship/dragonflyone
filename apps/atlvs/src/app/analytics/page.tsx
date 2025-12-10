'use client';

import { AtlvsAppLayout } from '../../components/app-layout';
import {
  StatCard,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  EmptyState,
  Container,
  Grid,
  Stack,
  Badge,
  H3,
  Body,
  Label,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';
import { useAnalyticsPageData } from '@/hooks/useAnalytics';

export default function AnalyticsPage() {
  const {
    kpis,
    summary,
    isLoading: loading,
    error,
  } = useAnalyticsPageData();

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  if (loading) {
    return (
      <AtlvsAppLayout>
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <Spinner variant="grey" size="lg" text="Loading analytics..." />
          </Container>
        </MainContent>
      </AtlvsAppLayout>
    );
  }

  if (error) {
    return (
      <AtlvsAppLayout>
        <MainContent padding="lg">
          <Container className="py-16">
            <EmptyState
              title="Error Loading Analytics"
              description={error}
              action={{ label: "Retry", onClick: fetchAnalytics }}
              inverted
            />
          </Container>
        </MainContent>
      </AtlvsAppLayout>
    );
  }

  return (
    <AtlvsAppLayout>
      <EnterprisePageHeader
        title="Analytics Dashboard"
        subtitle="Real-time financial metrics and KPI tracking for production operations"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={12}>

            {/* Stats Grid - Hard offset shadows, 2px borders */}
            <Grid cols={4} gap={6}>
              <StatCard
                value={formatCurrency(summary?.revenue || 0)}
                label="Revenue (YTD)"
                icon={<TrendingUp className="size-6" />}
                trend="up"
                trendValue="+12.5%"
                inverted
              />
              <StatCard
                value={formatCurrency(summary?.expenses || 0)}
                label="Expenses (YTD)"
                icon={<TrendingDown className="size-6" />}
                trend="down"
                trendValue="-3.2%"
                inverted
              />
              <StatCard
                value={formatCurrency(summary?.profit || 0)}
                label="Net Profit"
                icon={<Activity className="size-6" />}
                trend="up"
                trendValue="+8.7%"
                inverted
              />
              <StatCard
                value={`${summary?.margin || 0}%`}
                label="Margin"
                icon={<Target className="size-6" />}
                trend="neutral"
                trendValue="On Track"
                inverted
              />
            </Grid>

            {/* Content Cards - Comic panel aesthetic */}
            <Grid cols={2} gap={6}>
              {/* Project Status Card */}
              <Card variant="default" inverted>
                <CardHeader inverted>
                  <Stack gap={2} direction="horizontal" className="items-center justify-between">
                    <H3 className="text-white">Project Status</H3>
                    <Badge variant="outline" inverted>Live</Badge>
                  </Stack>
                </CardHeader>
                <CardBody inverted>
                  <Stack gap={4}>
                    <Stack gap={2} direction="horizontal" className="items-center justify-between pb-3">
                      <Stack gap={1}>
                        <Label size="xs" className="text-on-dark-disabled">IN PROGRESS</Label>
                        <Body className="text-on-dark-secondary">Active production projects</Body>
                      </Stack>
                      <Body className="font-display text-h2-sm text-white">{summary?.projectsInProgress || 0}</Body>
                    </Stack>
                    <Stack gap={2} direction="horizontal" className="items-center justify-between pb-3">
                      <Stack gap={1}>
                        <Label size="xs" className="text-on-dark-disabled">PLANNING</Label>
                        <Body className="text-on-dark-secondary">Upcoming projects</Body>
                      </Stack>
                      <Body className="font-display text-h2-sm text-white">{summary?.projectsPlanning || 0}</Body>
                    </Stack>
                    <Stack gap={2} direction="horizontal" className="items-center justify-between">
                      <Stack gap={1}>
                        <Label size="xs" className="text-on-dark-disabled">COMPLETED (YTD)</Label>
                        <Body className="text-on-dark-secondary">Successfully delivered</Body>
                      </Stack>
                      <Body className="font-display text-h2-sm text-white">{summary?.projectsCompleted || 0}</Body>
                    </Stack>
                  </Stack>
                </CardBody>
              </Card>

              {/* Active KPIs Card */}
              <Card variant="default" inverted>
                <CardHeader inverted>
                  <Stack gap={2} direction="horizontal" className="items-center justify-between">
                    <H3 className="text-white">Active KPIs</H3>
                    <Badge variant="solid" inverted>{kpis.length} Tracked</Badge>
                  </Stack>
                </CardHeader>
                <CardBody inverted>
                  <Stack gap={3}>
                    {kpis.slice(0, 5).map((kpi) => (
                      <Stack key={kpi.code} gap={2} direction="horizontal" className="items-center justify-between pb-3">
                        <Stack gap={1}>
                          <Body className="text-white">{kpi.name}</Body>
                          <Label size="xs" className="text-on-dark-disabled">{kpi.category} / {kpi.subcategory}</Label>
                        </Stack>
                        <Badge variant="outline" size="sm" inverted>{kpi.code}</Badge>
                      </Stack>
                    ))}
                    {kpis.length > 5 && (
                      <Body className="pt-2 text-center text-on-dark-disabled">
                        +{kpis.length - 5} more KPIs tracked
                      </Body>
                    )}
                  </Stack>
                </CardBody>
              </Card>
            </Grid>
          </Stack>
        </Container>
      </MainContent>
    </AtlvsAppLayout>
  );
}
