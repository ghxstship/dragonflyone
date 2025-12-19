'use client';


import { useRouter } from 'next/navigation';
import { Download, FileText, Calendar, TrendingUp, DollarSign, Users, ArrowLeft } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { useProductionMetrics } from '../../../hooks/useMetrics';
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
} from '@ghxstship/ui';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'executive' | 'compliance';
  frequency: 'daily' | 'weekly' | 'monthly' | 'on_demand';
  lastGenerated?: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'executive_summary',
    name: 'Executive Summary',
    description: 'High-level overview of production status, budget, and key milestones',
    category: 'executive',
    frequency: 'weekly',
    lastGenerated: '2024-01-15',
  },
  {
    id: 'financial_report',
    name: 'Financial Report',
    description: 'Detailed breakdown of expenses, revenue, and budget utilization',
    category: 'financial',
    frequency: 'monthly',
    lastGenerated: '2024-01-01',
  },
  {
    id: 'sponsor_report',
    name: 'Sponsor Report',
    description: 'Sponsor commitments, payments received, and deliverables status',
    category: 'financial',
    frequency: 'monthly',
    lastGenerated: '2024-01-10',
  },
  {
    id: 'operations_report',
    name: 'Operations Report',
    description: 'Task completion, team performance, and operational metrics',
    category: 'operational',
    frequency: 'weekly',
    lastGenerated: '2024-01-14',
  },
  {
    id: 'compliance_report',
    name: 'Compliance Report',
    description: 'Permits, insurance, and regulatory compliance status',
    category: 'compliance',
    frequency: 'monthly',
    lastGenerated: '2024-01-05',
  },
  {
    id: 'investor_update',
    name: 'Investor Update',
    description: 'Investment progress, milestones achieved, and financial projections',
    category: 'executive',
    frequency: 'monthly',
    lastGenerated: '2024-01-01',
  },
];

export default function MetricsReportsPage() {
  const router = useRouter();
  const { currentProductionId } = useProductionContextSafe();
  const productionId = currentProductionId || '';
  const { data: metrics } = useProductionMetrics(productionId);

  const categoryColors: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
    financial: 'success',
    operational: 'info',
    executive: 'warning',
    compliance: 'default',
  };

  const categoryLabels: Record<string, string> = {
    financial: 'Financial',
    operational: 'Operational',
    executive: 'Executive',
    compliance: 'Compliance',
  };

  const frequencyLabels: Record<string, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    on_demand: 'On Demand',
  };

  // Group reports by category
  const groupedReports = reportTemplates.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {} as Record<string, ReportTemplate[]>);

  return (
    <AtlvsAppLayout>
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
                  <H2>Reports</H2>
                  <Body className="text-grey-600">Generate and download production reports</Body>
                </Stack>
              </Stack>
            </Stack>

            {/* Quick Stats */}
            <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-2 border-grey-200 p-4">
                <Stack gap={2}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <DollarSign className="size-5 text-grey-500" />
                    <Body size="sm" className=" text-grey-500">Budget Status</Body>
                  </Stack>
                  <Body className="text-body-lg font-weight-bold">{metrics?.budgetUtilization || 0}% Used</Body>
                </Stack>
              </Card>
              <Card className="border-2 border-grey-200 p-4">
                <Stack gap={2}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <TrendingUp className="size-5 text-grey-500" />
                    <Body size="sm" className=" text-grey-500">Task Completion</Body>
                  </Stack>
                  <Body className="text-body-lg font-weight-bold">{metrics?.taskCompletionRate || 0}%</Body>
                </Stack>
              </Card>
              <Card className="border-2 border-grey-200 p-4">
                <Stack gap={2}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Users className="size-5 text-grey-500" />
                    <Body size="sm" className=" text-grey-500">Sponsors</Body>
                  </Stack>
                  <Body className="text-body-lg font-weight-bold">{metrics?.totalSponsors || 0}</Body>
                </Stack>
              </Card>
              <Card className="border-2 border-grey-200 p-4">
                <Stack gap={2}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Calendar className="size-5 text-grey-500" />
                    <Body size="sm" className=" text-grey-500">Days to Event</Body>
                  </Stack>
                  <Body className="text-body-lg font-weight-bold">{metrics?.daysUntilEvent || 0}</Body>
                </Stack>
              </Card>
            </Grid>

            {/* Report Templates by Category */}
            {Object.entries(groupedReports).map(([category, reports]) => (
              <Card key={category} className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <FileText className="size-5 text-grey-500" />
                    <H3>{categoryLabels[category]} Reports</H3>
                  </Stack>
                  <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                    {reports.map(report => (
                      <Card key={report.id} className="border-2 border-grey-200 p-4">
                        <Stack gap={4}>
                          <Stack gap={2}>
                            <Stack direction="horizontal" gap={2} className="items-center justify-between">
                              <Body className="font-weight-semibold">{report.name}</Body>
                              <Badge variant={categoryColors[report.category]}>
                                {frequencyLabels[report.frequency]}
                              </Badge>
                            </Stack>
                            <Body size="sm" className=" text-grey-600">{report.description}</Body>
                          </Stack>
                          <Stack direction="horizontal" gap={4} className="items-center justify-between">
                            <Body size="sm" className=" text-grey-500">
                              Last generated: {report.lastGenerated ? new Date(report.lastGenerated).toLocaleDateString() : 'Never'}
                            </Body>
                            <Button
                              onClick={() => {}}
                              className="flex items-center gap-2 border-2 border-grey-300 bg-white px-3 py-1"
                            >
                              <Download className="size-4" />
                              Generate
                            </Button>
                          </Stack>
                        </Stack>
                      </Card>
                    ))}
                  </Grid>
                </Stack>
              </Card>
            ))}

            {/* Custom Report */}
            <Card className="border-2 border-grey-200 p-6">
              <Stack gap={4}>
                <H3>Custom Report</H3>
                <Body className="text-grey-600">
                  Create a custom report with specific date ranges and metrics.
                </Body>
                <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                  <Stack gap={2}>
                    <Body size="sm" className=" font-weight-semibold">Date Range</Body>
                    <Stack direction="horizontal" gap={2}>
                      <Button
                        onClick={() => {}}
                        className="flex-1 border-2 border-grey-300 bg-white px-3 py-2"
                      >
                        Start Date
                      </Button>
                      <Button
                        onClick={() => {}}
                        className="flex-1 border-2 border-grey-300 bg-white px-3 py-2"
                      >
                        End Date
                      </Button>
                    </Stack>
                  </Stack>
                  <Stack gap={2}>
                    <Body size="sm" className=" font-weight-semibold">Report Type</Body>
                    <Button
                      onClick={() => {}}
                      className="border-2 border-grey-300 bg-white px-3 py-2"
                    >
                      Select Report Type
                    </Button>
                  </Stack>
                </Grid>
                <Stack gap={2}>
                  <Body size="sm" className=" font-weight-semibold">Include Metrics</Body>
                  <Grid cols={3} gap={2} className="sm:grid-cols-2 lg:grid-cols-3">
                    {['Budget vs Actual', 'Task Completion', 'Sponsor Revenue', 'Expense Breakdown', 'Team Performance', 'Timeline Status'].map((metric) => (
                      <Button
                        key={metric}
                        onClick={() => {}}
                        className="border-2 border-grey-200 bg-grey-50 px-3 py-2 hover:border-primary hover:bg-primary/5"
                      >
                        {metric}
                      </Button>
                    ))}
                  </Grid>
                </Stack>
                <Stack direction="horizontal" gap={4} className="items-center justify-between pt-4">
                  <Body size="sm" className=" text-grey-500">
                    Select options above to generate your custom report
                  </Body>
                  <Button
                    onClick={() => {}}
                    className="flex items-center gap-2 border-2 border-primary bg-primary px-4 py-2 text-white"
                  >
                    <Download className="size-4" />
                    Generate Report
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Section>
    </AtlvsAppLayout>
  );
}
