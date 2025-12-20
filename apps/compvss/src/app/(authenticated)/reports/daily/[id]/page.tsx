'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Pencil, Send, CheckCircle, Printer} from 'lucide-react';
import { CompvssAppLayout } from '../../../../../components/app-layout';
import { useDailyReport, useSubmitDailyReport, useApproveDailyReport } from '../../../../../hooks/useReports';
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

export default function DailyReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;
  
  const { data: report, isLoading, refetch } = useDailyReport(reportId);
  const submitMutation = useSubmitDailyReport();
  const approveMutation = useApproveDailyReport();

  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    approved: 'success',
    submitted: 'warning',
    reviewed: 'info',
    draft: 'ghost',
  };

  const handleSubmit = async () => {
    await submitMutation.mutateAsync(reportId);
    refetch();
  };

  const handleApprove = async () => {
    await approveMutation.mutateAsync({
      id: reportId,
      reviewerId: user?.id || '', 
    });
    refetch();
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
                    <H2>Daily Report - {new Date(report.report_date).toLocaleDateString()}</H2>
                    <Badge variant={statusColors[report.status] || 'ghost'}>
                      {report.status.toUpperCase()}
                    </Badge>
                  </Stack>
                  <Body className="text-grey-600">
                    {report.show?.title || 'No show'} | Submitted by {report.submitter ? `${report.submitter.first_name} ${report.submitter.last_name}` : 'Unknown'}
                  </Body>
                </Stack>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                {report.status === 'draft' && (
                  <>
                    <Button
                      onClick={() => router.push(`/reports/daily/${reportId}/edit`)}
                      className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                    >
                      <Pencil className="size-4" />
                      Edit
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="flex items-center gap-2 border-2 border-primary bg-primary px-4 py-2 text-white"
                    >
                      <Send className="size-4" />
                      Submit
                    </Button>
                  </>
                )}
                {report.status === 'submitted' && (
                  <Button
                    onClick={handleApprove}
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

            {/* Stats */}
            <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Attendance"
                value={report.attendance?.toLocaleString() || '—'}
                icon={<Box className="size-5" />}
              />
              <StatCard
                label="Revenue"
                value={report.revenue ? `$${report.revenue.toLocaleString()}` : '—'}
                icon={<Box className="size-5" />}
              />
              <StatCard
                label="Weather"
                value={report.weather_conditions || '—'}
                icon={<Box className="size-5" />}
              />
              <StatCard
                label="Status"
                value={report.status.toUpperCase()}
                icon={<Box className="size-5" />}
              />
            </Grid>

            <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
              {/* Main Content */}
              <Stack gap={4}>
                {/* Highlights */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={3}>
                    <H3>Highlights</H3>
                    <Body className="text-grey-700">
                      {report.highlights || 'No highlights recorded.'}
                    </Body>
                  </Stack>
                </Card>

                {/* Challenges */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={3}>
                    <H3>Challenges</H3>
                    <Body className="text-grey-700">
                      {report.challenges || 'No challenges recorded.'}
                    </Body>
                  </Stack>
                </Card>

                {/* Incidents */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={3}>
                    <H3>Incidents Summary</H3>
                    <Body className="text-grey-700">
                      {report.incidents_summary || 'No incidents reported.'}
                    </Body>
                  </Stack>
                </Card>
              </Stack>

              {/* Sidebar */}
              <Stack gap={4}>
                {/* Report Details */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Report Details</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Report Date</Body>
                        <Body>{new Date(report.report_date).toLocaleDateString()}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Show</Body>
                        <Body>{report.show?.title || 'No show assigned'}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Submitted By</Body>
                        <Body>{report.submitter ? `${report.submitter.first_name} ${report.submitter.last_name}` : 'Unknown'}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Submitted At</Body>
                        <Body>{report.submitted_at ? new Date(report.submitted_at).toLocaleString() : 'Not submitted'}</Body>
                      </Stack>
                      {report.reviewer && (
                        <>
                          <Stack gap={1}>
                            <Body size="sm" className=" text-grey-500">Reviewed By</Body>
                            <Body>{report.reviewer.first_name} {report.reviewer.last_name}</Body>
                          </Stack>
                          <Stack gap={1}>
                            <Body size="sm" className=" text-grey-500">Reviewed At</Body>
                            <Body>{report.reviewed_at ? new Date(report.reviewed_at).toLocaleString() : '—'}</Body>
                          </Stack>
                        </>
                      )}
                    </Stack>
                  </Stack>
                </Card>

                {/* Department Notes */}
                {report.department_notes && Object.keys(report.department_notes).length > 0 && (
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Department Notes</H3>
                      <Stack gap={3}>
                        {Object.entries(report.department_notes).map(([dept, note]) => (
                          <Stack key={dept} gap={1}>
                            <Body className="font-weight-semibold">{dept}</Body>
                            <Body size="sm" className=" text-grey-600">{note}</Body>
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>
                  </Card>
                )}

                {/* Action Items */}
                {report.action_items && report.action_items.length > 0 && (
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Action Items</H3>
                      <Stack gap={2}>
                        {report.action_items.map((item, index) => (
                          <Stack key={index} direction="horizontal" gap={2} className="items-start">
                            <Box className="mt-1 size-2 shrink-0 rounded-avatar bg-primary" />
                            <Body size="sm" className="">{item}</Body>
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>
                  </Card>
                )}

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
