'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Pencil, Send, CheckCircle, Printer, TrendingUp, TrendingDown, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { CompvssAppLayout } from '../../../../components/app-layout';
import { useWrapReport } from '../../../../hooks/useReports';
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

export default function WrapReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;
  
  const { data: report, isLoading } = useWrapReport(reportId);

  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    approved: 'success',
    submitted: 'warning',
    reviewed: 'info',
    draft: 'default',
  };

  if (isLoading) {
    return (
      <CompvssAppLayout>
        <Section className="min-h-screen bg-grey-100 py-8">
          <Container>
            <Body>Loading...</Body>
          </Container>
        </Section>
      </CompvssAppLayout>
    );
  }

  if (!report) {
    return (
      <CompvssAppLayout>
        <Section className="min-h-screen bg-grey-100 py-8">
          <Container>
            <Body>Report not found</Body>
          </Container>
        </Section>
      </CompvssAppLayout>
    );
  }

  const netProfit = (report.total_revenue || 0) - (report.total_expenses || 0);
  const profitMargin = report.total_revenue ? ((netProfit / report.total_revenue) * 100).toFixed(1) : 0;

  return (
    <CompvssAppLayout>
      <Section className="min-h-screen bg-grey-100 py-8">
        <Container>
          <Stack gap={6}>
            {/* Header */}
            <Stack direction="horizontal" gap={4} className="items-start justify-between">
              <Stack gap={4}>
                <Button
                  onClick={() => router.back()}
                  className="flex w-fit items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                >
                  <ArrowLeft className="size-4" />
                  Back to Reports
                </Button>
                <Stack gap={2}>
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <H2>{report.title}</H2>
                    <Badge variant={statusColors[report.status] || 'default'}>
                      {report.status.toUpperCase()}
                    </Badge>
                  </Stack>
                  <Body className="text-grey-600">
                    {report.production?.title || 'No production'} | Submitted by {report.submitter ? `${report.submitter.first_name} ${report.submitter.last_name}` : 'Unknown'}
                  </Body>
                </Stack>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                {report.status === 'draft' && (
                  <>
                    <Button
                      onClick={() => router.push(`/reports/wrap/${reportId}/edit`)}
                      className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                    >
                      <Pencil className="size-4" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => {}}
                      className="flex items-center gap-2 border-2 border-primary bg-primary px-4 py-2 text-white"
                    >
                      <Send className="size-4" />
                      Submit
                    </Button>
                  </>
                )}
                {report.status === 'submitted' && (
                  <Button
                    onClick={() => {}}
                    className="flex items-center gap-2 border-2 border-success bg-success px-4 py-2 text-white"
                  >
                    <CheckCircle className="size-4" />
                    Approve
                  </Button>
                )}
                <Button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                >
                  <Printer className="size-4" />
                  Print
                </Button>
              </Stack>
            </Stack>

            {/* Key Metrics */}
            <Grid cols={5} gap={4}>
              <StatCard
                label="Total Shows"
                value={report.total_shows}
                icon={<Box className="size-5" />}
              />
              <StatCard
                label="Total Attendance"
                value={report.total_attendance?.toLocaleString() || '0'}
                icon={<Users className="size-5" />}
              />
              <StatCard
                label="Total Revenue"
                value={`$${(report.total_revenue || 0).toLocaleString()}`}
                icon={<DollarSign className="size-5" />}
                trend="up"
              />
              <StatCard
                label="Total Expenses"
                value={`$${(report.total_expenses || 0).toLocaleString()}`}
                icon={<DollarSign className="size-5" />}
              />
              <StatCard
                label="Net Profit"
                value={`$${Math.abs(netProfit).toLocaleString()}`}
                icon={netProfit >= 0 ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />}
                trend={netProfit >= 0 ? 'up' : 'down'}
                trendValue={`${profitMargin}% margin`}
              />
            </Grid>

            <Grid cols={3} gap={6}>
              {/* Main Content */}
              <Box className="col-span-2">
                <Stack gap={4}>
                  {/* Performance Metrics */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Performance Metrics</H3>
                      <Grid cols={3} gap={4}>
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Avg Attendance</Body>
                          <Body className="font-weight-semibold">{report.avg_attendance?.toLocaleString() || '—'}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Peak Attendance</Body>
                          <Body className="font-weight-semibold">{report.peak_attendance?.toLocaleString() || '—'}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Capacity Utilization</Body>
                          <Body className="font-weight-semibold">{report.capacity_utilization ? `${report.capacity_utilization}%` : '—'}</Body>
                        </Stack>
                      </Grid>
                    </Stack>
                  </Card>

                  {/* Successes */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={3}>
                      <H3>Successes</H3>
                      {report.successes && report.successes.length > 0 ? (
                        <Stack gap={2}>
                          {report.successes.map((item, index) => (
                            <Stack key={index} direction="horizontal" gap={2} className="items-start">
                              <CheckCircle className="mt-0.5 size-4 shrink-0 text-success" />
                              <Body>{item}</Body>
                            </Stack>
                          ))}
                        </Stack>
                      ) : (
                        <Body className="text-grey-500">No successes recorded.</Body>
                      )}
                    </Stack>
                  </Card>

                  {/* Challenges */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={3}>
                      <H3>Challenges</H3>
                      {report.challenges && report.challenges.length > 0 ? (
                        <Stack gap={2}>
                          {report.challenges.map((item, index) => (
                            <Stack key={index} direction="horizontal" gap={2} className="items-start">
                              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                              <Body>{item}</Body>
                            </Stack>
                          ))}
                        </Stack>
                      ) : (
                        <Body className="text-grey-500">No challenges recorded.</Body>
                      )}
                    </Stack>
                  </Card>

                  {/* Recommendations */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={3}>
                      <H3>Recommendations</H3>
                      {report.recommendations && report.recommendations.length > 0 ? (
                        <Stack gap={2}>
                          {report.recommendations.map((item, index) => (
                            <Stack key={index} direction="horizontal" gap={2} className="items-start">
                              <Box className="mt-1.5 size-2 shrink-0 rounded-avatar bg-primary" />
                              <Body>{item}</Body>
                            </Stack>
                          ))}
                        </Stack>
                      ) : (
                        <Body className="text-grey-500">No recommendations recorded.</Body>
                      )}
                    </Stack>
                  </Card>
                </Stack>
              </Box>

              {/* Sidebar */}
              <Stack gap={4}>
                {/* Report Details */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Report Details</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-grey-500">Production</Body>
                        <Body>{report.production?.title || 'No production'}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-grey-500">Submitted By</Body>
                        <Body>{report.submitter ? `${report.submitter.first_name} ${report.submitter.last_name}` : 'Unknown'}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-grey-500">Submitted At</Body>
                        <Body>{report.submitted_at ? new Date(report.submitted_at).toLocaleString() : 'Not submitted'}</Body>
                      </Stack>
                      {report.reviewer && (
                        <>
                          <Stack gap={1}>
                            <Body className="text-body-sm text-grey-500">Reviewed By</Body>
                            <Body>{report.reviewer.first_name} {report.reviewer.last_name}</Body>
                          </Stack>
                          <Stack gap={1}>
                            <Body className="text-body-sm text-grey-500">Reviewed At</Body>
                            <Body>{report.reviewed_at ? new Date(report.reviewed_at).toLocaleString() : '—'}</Body>
                          </Stack>
                        </>
                      )}
                    </Stack>
                  </Stack>
                </Card>

                {/* Incidents */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Incidents</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-grey-500">Total Incidents</Body>
                        <Body className="font-weight-semibold">{report.total_incidents}</Body>
                      </Stack>
                      {report.incident_summary && (
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Summary</Body>
                          <Body className="text-body-sm">{report.incident_summary}</Body>
                        </Stack>
                      )}
                      {report.safety_notes && (
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Safety Notes</Body>
                          <Body className="text-body-sm">{report.safety_notes}</Body>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </Card>

                {/* Notes */}
                {report.notes && (
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={2}>
                      <H3>Additional Notes</H3>
                      <Body className="text-grey-600">{report.notes}</Body>
                    </Stack>
                  </Card>
                )}
              </Stack>
            </Grid>
          </Stack>
        </Container>
      </Section>
    </CompvssAppLayout>
  );
}
