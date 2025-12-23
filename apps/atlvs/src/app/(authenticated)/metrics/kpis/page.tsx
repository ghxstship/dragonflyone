'use client';


import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, Minus, Target, ArrowLeft } from 'lucide-react';
// Layout provided by route group
import { useKPIs } from '../../../../hooks/useMetrics';
import { useProductionContextSafe } from '@ghxstship/config';
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
} from '@ghxstship/ui';

export default function KPIsPage() {
  const router = useRouter();
  const { currentProductionId } = useProductionContextSafe();
  const productionId = currentProductionId || '';
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

  const categoryIcons: Record<string, React.ReactNode> = {
    financial: <TrendingUp className="size-5" />,
    operational: <Target className="size-5" />,
    compliance: <Target className="size-5" />,
    engagement: <Target className="size-5" />,
  };

  // Group KPIs by category
  const groupedKPIs = kpis?.reduce((acc, kpi) => {
    if (!acc[kpi.category]) {
      acc[kpi.category] = [];
    }
    acc[kpi.category].push(kpi);
    return acc;
  }, {} as Record<string, typeof kpis>) || {};

  // Calculate overall health
  const totalKPIs = kpis?.length || 0;
  const onTrackCount = kpis?.filter(k => k.status === 'on_track').length || 0;
  const atRiskCount = kpis?.filter(k => k.status === 'at_risk').length || 0;
  const offTrackCount = kpis?.filter(k => k.status === 'off_track').length || 0;
  const overallHealth = totalKPIs > 0 ? Math.round((onTrackCount / totalKPIs) * 100) : 0;

  return (
    <>
      <Section className="min-h-screen bg-grey-100 py-8">
        <Container>
          <Stack gap={6}>
            {/* Header */}
            <Stack gap={4}>
              <Button
                onClick={() => router.back()}
                className="flex w-fit items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
              >
                <ArrowLeft className="size-4" />
                Back to Metrics
              </Button>
              <Stack direction="horizontal" gap={4} className="items-center justify-between">
                <Stack gap={1}>
                  <H2>KPI Dashboard</H2>
                  <Body className="text-grey-600">Track key performance indicators across all areas</Body>
                </Stack>
              </Stack>
            </Stack>

            {/* Overall Health */}
            <Card className="border-2 border-grey-200 p-6">
              <Stack gap={4}>
                <H3>Overall KPI Health</H3>
                <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-2 border-grey-200 p-4 text-center">
                    <Stack gap={2}>
                      <Body className="text-body-lg font-weight-bold">{totalKPIs}</Body>
                      <Body size="sm" className=" text-grey-500">Total KPIs</Body>
                    </Stack>
                  </Card>
                  <Card className="border-2 border-success p-4 text-center">
                    <Stack gap={2}>
                      <Body className="text-body-lg font-weight-bold text-success">{onTrackCount}</Body>
                      <Body size="sm" className=" text-grey-500">On Track</Body>
                    </Stack>
                  </Card>
                  <Card className="border-2 border-warning p-4 text-center">
                    <Stack gap={2}>
                      <Body className="text-body-lg font-weight-bold text-warning">{atRiskCount}</Body>
                      <Body size="sm" className=" text-grey-500">At Risk</Body>
                    </Stack>
                  </Card>
                  <Card className="border-2 border-error p-4 text-center">
                    <Stack gap={2}>
                      <Body className="text-body-lg font-weight-bold text-error">{offTrackCount}</Body>
                      <Body size="sm" className=" text-grey-500">Off Track</Body>
                    </Stack>
                  </Card>
                </Grid>
                <Box className="h-4 overflow-hidden rounded-card bg-grey-200">
                  <Box 
                    className="h-full bg-success" 
                    style={{ width: `${overallHealth}%` }} 
                  />
                </Box>
                <Stack direction="horizontal" gap={4} className="items-center justify-between">
                  <Body size="sm" className=" text-grey-500">
                    {onTrackCount} of {totalKPIs} KPIs on track
                  </Body>
                  <Badge variant={overallHealth >= 70 ? 'success' : overallHealth >= 50 ? 'warning' : 'error'}>
                    {overallHealth}% Health
                  </Badge>
                </Stack>
              </Stack>
            </Card>

            {/* KPIs by Category */}
            {Object.entries(groupedKPIs).map(([category, categoryKPIs]) => (
              <Card key={category} className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    {categoryIcons[category]}
                    <H3>{categoryLabels[category]} KPIs</H3>
                  </Stack>
                  <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                    {categoryKPIs?.map(kpi => (
                      <Card key={kpi.id} className="border-2 border-grey-200 p-4">
                        <Stack gap={4}>
                          <Stack direction="horizontal" gap={4} className="items-start justify-between">
                            <Stack gap={1}>
                              <Body className="font-weight-semibold">{kpi.name}</Body>
                              <Stack direction="horizontal" gap={2} className="items-baseline">
                                <Body className="text-body-xl font-weight-bold">{kpi.value}{kpi.unit}</Body>
                                <Body size="sm" className=" text-grey-500">of {kpi.target}{kpi.unit}</Body>
                              </Stack>
                            </Stack>
                            <Badge variant={kpiStatusColors[kpi.status]}>
                              {kpi.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </Stack>
                          <Box className="h-3 overflow-hidden rounded-badge bg-grey-200">
                            <Box 
                              className={`h-full ${kpi.status === 'on_track' ? 'bg-success' : kpi.status === 'at_risk' ? 'bg-warning' : 'bg-error'}`}
                              style={{ width: `${Math.min(100, (kpi.value / kpi.target) * 100)}%` }} 
                            />
                          </Box>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            {kpi.trend === 'up' && <TrendingUp className="size-4 text-success" />}
                            {kpi.trend === 'down' && <TrendingDown className="size-4 text-error" />}
                            {kpi.trend === 'stable' && <Minus className="size-4 text-grey-400" />}
                            <Body size="sm" className={kpi.trend === 'up' ? 'text-success' : kpi.trend === 'down' ? 'text-error' : 'text-grey-500'}>
                              {kpi.trend === 'up' ? '+' : kpi.trend === 'down' ? '-' : ''}{kpi.trendValue}% from last period
                            </Body>
                          </Stack>
                        </Stack>
                      </Card>
                    ))}
                  </Grid>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Container>
      </Section>
    </>
  );
}
