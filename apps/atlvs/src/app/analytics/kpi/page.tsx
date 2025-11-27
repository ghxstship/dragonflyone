'use client';

import { useState, useEffect } from 'react';
import { Container, Section, Display, H2, H3, Body, Card, Grid, Button, Badge, Select, Stack, LoadingSpinner } from '@ghxstship/ui';

interface KPIDefinition {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  unit: string;
  targetDirection: string;
  updateFrequency: string;
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
}

interface KPIReport {
  id: string;
  name: string;
  description: string;
  kpi_codes: string[];
  category: string;
}

export default function KPILibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [kpis, setKpis] = useState<KPIDefinition[]>([]);
  const [reports, setReports] = useState<KPIReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIs();
    loadReports();
  }, []);

  const loadKPIs = async () => {
    try {
      const response = await fetch('/api/kpi?enabled=true');
      const data = await response.json();
      if (data.success) {
        setKpis(data.data);
      }
    } catch (error) {
      console.error('Error loading KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const response = await fetch('/api/kpi/reports?global=true');
      const data = await response.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const categories = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'FINANCIAL_PERFORMANCE', label: 'Financial Performance' },
    { value: 'TICKET_ATTENDANCE', label: 'Ticket & Attendance' },
    { value: 'OPERATIONAL_EFFICIENCY', label: 'Operational Efficiency' },
    { value: 'MARKETING_ENGAGEMENT', label: 'Marketing & Engagement' },
    { value: 'CUSTOMER_EXPERIENCE', label: 'Customer Experience' }
  ];

  const filteredKPIs = selectedCategory === 'ALL' 
    ? kpis 
    : kpis.filter(kpi => kpi.category === selectedCategory);

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

  const getDirectionBadge = (direction: string) => {
    switch (direction) {
      case 'HIGHER_IS_BETTER':
        return <Badge variant="solid">↑ Higher is Better</Badge>;
      case 'LOWER_IS_BETTER':
        return <Badge variant="outline">↓ Lower is Better</Badge>;
      case 'TARGET_RANGE':
        return <Badge variant="solid">⊙ Target Range</Badge>;
      default:
        return <Badge variant="ghost">ℹ Informational</Badge>;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FINANCIAL_PERFORMANCE': return 'bg-success-100 border-success-500';
      case 'TICKET_ATTENDANCE': return 'bg-info-100 border-info-500';
      case 'OPERATIONAL_EFFICIENCY': return 'bg-purple-100 border-purple-500';
      case 'MARKETING_ENGAGEMENT': return 'bg-warning-100 border-warning-500';
      case 'CUSTOMER_EXPERIENCE': return 'bg-pink-100 border-pink-500';
      default: return 'bg-grey-100 border-grey-500';
    }
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-white">
        <Container>
          <Stack className="border-b-2 border-black py-8 mb-8">
            <Display>KPI MASTER LIBRARY</Display>
          </Stack>
          <Stack className="items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Loading KPI definitions..." />
          </Stack>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        {/* Header */}
        <Stack className="border-b-2 border-black py-8 mb-8">
          <Display>KPI MASTER LIBRARY</Display>
          <Body className="mt-4">
            Complete reference library of 200 preconfigured KPI metrics for analytics and insights
          </Body>
        </Stack>

        {/* Global Reports */}
        <Stack className="mb-8">
          <H2 className="mb-4">PRECONFIGURED REPORTS</H2>
          <Grid cols={6} gap={6} className="mb-6">
            {reports.map((report) => (
              <Card
                key={report.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedReport === report.id ? 'ring-2 ring-black' : ''
                }`}
                onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
              >
                <H3 className="mb-2">{report.name}</H3>
                <Body className="mb-3 text-grey-600">{report.description}</Body>
                <Badge variant="outline">{report.kpi_codes.length} KPIs</Badge>
              </Card>
            ))}
          </Grid>
        </Stack>

        {/* Category Filter */}
        <Stack className="mb-6">
          <Stack direction="horizontal" gap={4} className="items-center">
            <Body className="font-bold">FILTER BY CATEGORY:</Body>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="min-w-[300px]"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </Select>
            <Body className="text-grey-600">
              Showing {filteredKPIs.length} of {kpis.length} KPIs
            </Body>
          </Stack>
        </Stack>

        {/* KPI Grid */}
        <Stack gap={4}>
          {filteredKPIs.map((kpi) => (
            <Card
              key={kpi.id}
              className={`p-6 border-l-4 ${getCategoryColor(kpi.category)}`}
            >
              <Stack direction="horizontal" className="justify-between items-start">
                <Stack className="flex-1">
                  <Stack direction="horizontal" gap={3} className="items-center mb-2">
                    <H3>{kpi.name}</H3>
                    <Badge variant="outline" className="font-mono text-mono-xs">
                      {kpi.code}
                    </Badge>
                    {getDirectionBadge(kpi.targetDirection)}
                  </Stack>
                  <Body className="text-grey-600 mb-3">{kpi.description}</Body>
                  <Stack direction="horizontal" gap={4} className="items-center text-body-sm">
                    <Body className="text-grey-500">
                      <strong>Unit:</strong> {getUnitDisplay(kpi.unit)}
                    </Body>
                    <Body className="text-grey-500">
                      <strong>Update:</strong> {kpi.updateFrequency.replace(/_/g, ' ')}
                    </Body>
                    <Body className="text-grey-500">
                      <strong>Subcategory:</strong> {kpi.subcategory.replace(/_/g, ' ')}
                    </Body>
                  </Stack>
                  {(kpi.targetValue || kpi.warningThreshold) && (
                    <Stack className="mt-3 pt-3 border-t border-grey-200">
                      <Body size="sm" className="text-grey-600">
                        {kpi.targetValue && (
                          <Body className="mr-4 inline">
                            <strong>Target:</strong> {kpi.targetValue}{getUnitDisplay(kpi.unit)}
                          </Body>
                        )}
                        {kpi.warningThreshold && (
                          <Body className="mr-4 inline">
                            <strong>Warning:</strong> {kpi.warningThreshold}{getUnitDisplay(kpi.unit)}
                          </Body>
                        )}
                        {kpi.criticalThreshold && (
                          <Body className="inline">
                            <strong>Critical:</strong> {kpi.criticalThreshold}{getUnitDisplay(kpi.unit)}
                          </Body>
                        )}
                      </Body>
                    </Stack>
                  )}
                </Stack>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = `/analytics/kpi/${kpi.code}`}
                >
                  VIEW DATA
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>

        {filteredKPIs.length === 0 && (
          <Card className="p-12 text-center">
            <Body className="text-grey-500">
              No KPIs found for the selected category.
            </Body>
          </Card>
        )}

        {/* Category Summary Stats */}
        <Stack className="mt-12 pt-8 border-t-2 border-black">
          <H2 className="mb-6">CATEGORY BREAKDOWN</H2>
          <Grid cols={4} gap={4}>
            <Card className="p-6 bg-success-50">
              <H3 className="text-success-700">45</H3>
              <Body className="text-body-sm">Financial KPIs</Body>
            </Card>
            <Card className="p-6 bg-info-50">
              <H3 className="text-info-700">45</H3>
              <Body className="text-body-sm">Ticket & Attendance</Body>
            </Card>
            <Card className="p-6 bg-purple-50">
              <H3 className="text-purple-700">55</H3>
              <Body className="text-body-sm">Operational</Body>
            </Card>
            <Card className="p-6 bg-warning-50">
              <H3 className="text-warning-700">30</H3>
              <Body className="text-body-sm">Marketing</Body>
            </Card>
            <Card className="p-6 bg-pink-50">
              <H3 className="text-pink-700">25</H3>
              <Body className="text-body-sm">Customer Experience</Body>
            </Card>
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
