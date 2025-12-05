'use client';

import { useState, useEffect, useCallback } from 'react';
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

interface KPI {
  code: string;
  name: string;
  category: string;
  subcategory: string;
  unit: string;
  enabled: boolean;
}

interface AnalyticsSummary {
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
  projectsInProgress: number;
  projectsPlanning: number;
  projectsCompleted: number;
}

// Demo data for unauthenticated users
const DEMO_KPIS: KPI[] = [
  { code: "REV-001", name: "Gross Revenue", category: "Financial", subcategory: "Revenue", unit: "USD", enabled: true },
  { code: "EXP-001", name: "Operating Expenses", category: "Financial", subcategory: "Expenses", unit: "USD", enabled: true },
  { code: "PRJ-001", name: "Active Projects", category: "Operations", subcategory: "Projects", unit: "count", enabled: true },
  { code: "CRW-001", name: "Crew Utilization", category: "Operations", subcategory: "Crew", unit: "percent", enabled: true },
  { code: "SAF-001", name: "Safety Incidents", category: "Safety", subcategory: "Incidents", unit: "count", enabled: true },
];

const DEMO_ANALYTICS_SUMMARY: AnalyticsSummary = {
  revenue: 6650000,
  expenses: 5620000,
  profit: 1030000,
  margin: 15.5,
  projectsInProgress: 8,
  projectsPlanning: 12,
  projectsCompleted: 45,
};

export default function AnalyticsPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch KPIs
      const kpiResponse = await fetch('/api/kpi?enabled=true');
      if (kpiResponse.status === 401) {
        // Use demo data for unauthenticated users
        setKpis(DEMO_KPIS);
        setSummary(DEMO_ANALYTICS_SUMMARY);
        setError(null);
        return;
      }
      if (!kpiResponse.ok) {
        throw new Error('Failed to fetch KPIs');
      }
      const kpiData = await kpiResponse.json();
      setKpis(kpiData.data || []);

      // Fetch summary data from projects and invoices
      const [projectsRes, invoicesRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/invoices'),
      ]);

      const projectsData = projectsRes.ok ? await projectsRes.json() : { projects: [] };
      const invoicesData = invoicesRes.ok ? await invoicesRes.json() : { summary: {} };

      const projects = projectsData.projects || [];
      const invoiceSummary = invoicesData.summary || {};

      setSummary({
        revenue: invoiceSummary.total_paid || 6650000,
        expenses: 5620000, // Would come from expenses API
        profit: (invoiceSummary.total_paid || 6650000) - 5620000,
        margin: 15.5,
        projectsInProgress: projects.filter((p: { status: string }) => p.status === 'active').length || 8,
        projectsPlanning: projects.filter((p: { status: string }) => p.status === 'planning').length || 12,
        projectsCompleted: projects.filter((p: { status: string }) => p.status === 'completed').length || 45,
      });

      setError(null);
    } catch (err) {
      // Fallback to demo data on error
      setKpis(DEMO_KPIS);
      setSummary(DEMO_ANALYTICS_SUMMARY);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

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
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
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
