'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Container, Section, Display, H2, H3, Body, Card, Grid, Badge, Button, Stack, Label } from '@ghxstship/ui';

interface KPIDefinition {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  unit: string;
  targetDirection: string;
  calculation: string;
  updateFrequency: string;
  visualizations: string[];
  dataSources: Array<{
    table: string;
    fields: string[];
    filters?: string[];
  }>;
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
}

interface TrendData {
  date: string;
  value: number;
  target_value?: number;
  warning_threshold?: number;
  critical_threshold?: number;
}

export default function KPIDetailPage() {
  const params = useParams();
  const code = params.code as string;
  const [kpi, setKpi] = useState<KPIDefinition | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (code) {
      loadKPI();
      loadTrendData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, days]);

  const loadKPI = async () => {
    try {
      const response = await fetch(`/api/kpi/${code}`);
      const data = await response.json();
      if (data.success) {
        setKpi(data.data);
      }
    } catch (error) {
      console.error('Error loading KPI:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendData = async () => {
    try {
      const response = await fetch(`/api/kpi/trend/${code}?days=${days}`);
      const data = await response.json();
      if (data.success) {
        setTrendData(data.data);
      }
    } catch (error) {
      console.error('Error loading trend data:', error);
    }
  };

  if (loading || !kpi) {
    return (
      <Section className="min-h-screen bg-white">
        <Container>
          <Section className="border-b-2 border-black py-8 mb-8">
            <Display>KPI DETAIL</Display>
          </Section>
          <Stack className="items-center justify-center py-12">
            <Body>Loading KPI data...</Body>
          </Stack>
        </Container>
      </Section>
    );
  }

  const getUnitDisplay = (unit: string) => {
    switch (unit) {
      case 'CURRENCY': return '$';
      case 'PERCENTAGE': return '%';
      case 'COUNT': return '#';
      case 'DAYS': return 'days';
      case 'HOURS': return 'hrs';
      case 'MINUTES': return 'min';
      case 'RATIO': return 'x';
      case 'SCORE': return 'pts';
      default: return unit;
    }
  };

  const latestValue = trendData.length > 0 ? trendData[0].value : null;
  const previousValue = trendData.length > 1 ? trendData[1].value : null;
  const change = latestValue && previousValue ? ((latestValue - previousValue) / previousValue) * 100 : null;

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        {/* Header */}
        <Section className="border-b-2 border-black py-8 mb-8">
          <Stack direction="horizontal" className="items-start justify-between">
            <Stack>
              <Display>{kpi.name}</Display>
              <Body className="mt-4 text-gray-600">{kpi.description}</Body>
              <Stack direction="horizontal" gap={3} className="mt-4 items-center">
                <Badge variant="outline" className="font-mono">
                  {kpi.code}
                </Badge>
                <Badge variant="solid">
                  {kpi.category.replace(/_/g, ' ')}
                </Badge>
                <Badge variant="outline">
                  {kpi.subcategory.replace(/_/g, ' ')}
                </Badge>
              </Stack>
            </Stack>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/analytics/kpi'}
            >
              ← BACK TO LIBRARY
            </Button>
          </Stack>
        </Section>

        {/* Current Value */}
        {latestValue !== null && (
          <Grid cols={4} className="mb-8">
            <Card className="p-6 bg-blue-50">
              <Body className="text-sm text-gray-600 mb-2">CURRENT VALUE</Body>
              <H2 className="text-blue-700">
                {latestValue.toFixed(2)}{getUnitDisplay(kpi.unit)}
              </H2>
              {change !== null && (
                <Body className={`text-sm mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% from previous
                </Body>
              )}
            </Card>

            {kpi.targetValue && (
              <Card className="p-6">
                <Body className="text-sm text-gray-600 mb-2">TARGET VALUE</Body>
                <H3 className="text-gray-900">
                  {kpi.targetValue}{getUnitDisplay(kpi.unit)}
                </H3>
                {latestValue && (
                  <Body className="text-sm mt-2 text-gray-600">
                    {((latestValue / kpi.targetValue) * 100).toFixed(0)}% of target
                  </Body>
                )}
              </Card>
            )}

            {kpi.warningThreshold && (
              <Card className="p-6 bg-yellow-50">
                <Body className="text-sm text-gray-600 mb-2">WARNING THRESHOLD</Body>
                <H3 className="text-yellow-700">
                  {kpi.warningThreshold}{getUnitDisplay(kpi.unit)}
                </H3>
              </Card>
            )}

            {kpi.criticalThreshold && (
              <Card className="p-6 bg-red-50">
                <Body className="text-sm text-gray-600 mb-2">CRITICAL THRESHOLD</Body>
                <H3 className="text-red-700">
                  {kpi.criticalThreshold}{getUnitDisplay(kpi.unit)}
                </H3>
              </Card>
            )}
          </Grid>
        )}

        {/* Trend Period Selector */}
        <Stack className="mb-6">
          <Stack direction="horizontal" gap={4} className="items-center">
            <Body className="font-bold">TREND PERIOD:</Body>
            <Stack direction="horizontal" gap={2}>
              {[7, 30, 90, 180, 365].map((d) => (
                <Button
                  key={d}
                  variant={days === d ? 'solid' : 'outline'}
                  size="sm"
                  onClick={() => setDays(d)}
                >
                  {d} DAYS
                </Button>
              ))}
            </Stack>
          </Stack>
        </Stack>

        {/* Trend Chart Placeholder */}
        <Card className="p-6 mb-8">
          <H3 className="mb-4">TREND ANALYSIS</H3>
          <Stack className="h-64 bg-gray-100 rounded items-center justify-center">
            <Body className="text-gray-500">
              Chart visualization: {trendData.length} data points over {days} days
            </Body>
          </Stack>
        </Card>

        {/* KPI Metadata */}
        <Grid cols={2} className="mb-8">
          <Card className="p-6">
            <H3 className="mb-4">CALCULATION METHOD</H3>
            <Body className="font-mono text-sm bg-gray-50 p-4 rounded">
              {kpi.calculation}
            </Body>
          </Card>

          <Card className="p-6">
            <H3 className="mb-4">DATA SOURCES</H3>
            <Stack gap={3}>
              {kpi.dataSources.map((source, idx) => (
                <Card key={idx} className="bg-gray-50 p-3 rounded">
                  <Body className="font-bold text-sm">Table: {source.table}</Body>
                  <Body className="text-sm text-gray-600">
                    Fields: {source.fields.join(', ')}
                  </Body>
                  {source.filters && source.filters.length > 0 && (
                    <Body className="text-sm text-gray-500 mt-1">
                      Filters: {source.filters.join(', ')}
                    </Body>
                  )}
                </Card>
              ))}
            </Stack>
          </Card>
        </Grid>

        {/* Properties */}
        <Card className="p-6">
          <H3 className="mb-4">KPI PROPERTIES</H3>
          <Grid cols={3}>
            <Stack>
              <Label className="font-bold mb-2">Update Frequency</Label>
              <Body className="text-gray-600">
                {kpi.updateFrequency.replace(/_/g, ' ')}
              </Body>
            </Stack>
            <Stack>
              <Label className="font-bold mb-2">Target Direction</Label>
              <Body className="text-gray-600">
                {kpi.targetDirection.replace(/_/g, ' ')}
              </Body>
            </Stack>
            <Stack>
              <Label className="font-bold mb-2">Unit</Label>
              <Body className="text-gray-600">{kpi.unit}</Body>
            </Stack>
            <Stack>
              <Label className="font-bold mb-2">Category</Label>
              <Body className="text-gray-600">
                {kpi.category.replace(/_/g, ' ')}
              </Body>
            </Stack>
            <Stack>
              <Label className="font-bold mb-2">Subcategory</Label>
              <Body className="text-gray-600">
                {kpi.subcategory.replace(/_/g, ' ')}
              </Body>
            </Stack>
            <Stack>
              <Label className="font-bold mb-2">Visualizations</Label>
              <Body className="text-gray-600">
                {kpi.visualizations.join(', ')}
              </Body>
            </Stack>
          </Grid>
        </Card>
      </Container>
    </Section>
  );
}
