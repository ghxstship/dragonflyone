'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Pencil, Zap, CheckCircle, AlertTriangle, User, Clock } from 'lucide-react';
import { AtlvsAppLayout } from '../../../../components/app-layout';
import { useContingency, useTriggerContingency, useResolveContingency } from '../../../../hooks/useTasks';
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
  ConfirmDialog,
} from '@ghxstship/ui';

export default function ContingencyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contingencyId = params.id as string;
  
  const { data: contingency, isLoading, refetch } = useContingency(contingencyId);
  const triggerMutation = useTriggerContingency();
  const resolveMutation = useResolveContingency();
  
  const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);

  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    resolved: 'success',
    triggered: 'error',
    active: 'info',
    archived: 'default',
  };

  const severityColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'default',
  };

  const categoryLabels: Record<string, string> = {
    weather: 'Weather',
    technical: 'Technical',
    safety: 'Safety',
    medical: 'Medical',
    security: 'Security',
    staffing: 'Staffing',
    vendor: 'Vendor',
    other: 'Other',
  };

  const handleTrigger = async () => {
    await triggerMutation.mutateAsync(contingencyId);
    setTriggerDialogOpen(false);
    refetch();
  };

  const handleResolve = async () => {
    await resolveMutation.mutateAsync(contingencyId);
    setResolveDialogOpen(false);
    refetch();
  };

  if (isLoading) {
    return (
      <AtlvsAppLayout>
        <Section className="min-h-screen bg-grey-100 py-8">
          <Container>
            <Body>Loading...</Body>
          </Container>
        </Section>
      </AtlvsAppLayout>
    );
  }

  if (!contingency) {
    return (
      <AtlvsAppLayout>
        <Section className="min-h-screen bg-grey-100 py-8">
          <Container>
            <Body>Contingency not found</Body>
          </Container>
        </Section>
      </AtlvsAppLayout>
    );
  }

  return (
    <AtlvsAppLayout>
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
                  Back to Contingencies
                </Button>
                <Stack gap={2}>
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <H2>{contingency.title}</H2>
                    <Badge variant={statusColors[contingency.status] || 'default'}>
                      {contingency.status.toUpperCase()}
                    </Badge>
                    <Badge variant={severityColors[contingency.severity] || 'default'}>
                      {contingency.severity.toUpperCase()}
                    </Badge>
                  </Stack>
                  <Body className="text-grey-600">
                    {categoryLabels[contingency.category] || contingency.category}
                  </Body>
                </Stack>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                {contingency.status === 'active' && (
                  <Button
                    onClick={() => setTriggerDialogOpen(true)}
                    className="flex items-center gap-2 border-2 border-error bg-error px-4 py-2 text-white"
                  >
                    <Zap className="size-4" />
                    Trigger
                  </Button>
                )}
                {contingency.status === 'triggered' && (
                  <Button
                    onClick={() => setResolveDialogOpen(true)}
                    className="flex items-center gap-2 border-2 border-success bg-success px-4 py-2 text-white"
                  >
                    <CheckCircle className="size-4" />
                    Resolve
                  </Button>
                )}
                <Button
                  onClick={() => router.push(`/schedule/contingencies/${contingencyId}/edit`)}
                  className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
              </Stack>
            </Stack>

            {/* Triggered Alert */}
            {contingency.status === 'triggered' && (
              <Card className="border-2 border-error bg-error/10 p-4">
                <Stack direction="horizontal" gap={3} className="items-center">
                  <AlertTriangle className="size-6 text-error" />
                  <Stack gap={0}>
                    <Body className="font-weight-semibold text-error">Contingency Triggered</Body>
                    <Body className="text-body-sm text-error">
                      Triggered at: {contingency.triggered_at ? new Date(contingency.triggered_at).toLocaleString() : 'Unknown'}
                    </Body>
                  </Stack>
                </Stack>
              </Card>
            )}

            <Grid cols={3} gap={6}>
              {/* Main Content */}
              <Box className="col-span-2">
                <Stack gap={4}>
                  {/* Trigger Condition */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={3}>
                      <H3>Trigger Condition</H3>
                      <Body className="text-grey-700">{contingency.trigger_condition}</Body>
                    </Stack>
                  </Card>

                  {/* Response Plan */}
                  <Card className="border-2 border-warning p-6">
                    <Stack gap={3}>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <AlertTriangle className="size-5 text-warning" />
                        <H3>Response Plan</H3>
                      </Stack>
                      <Body className="text-grey-700">{contingency.response_plan}</Body>
                    </Stack>
                  </Card>

                  {/* Estimated Impact */}
                  {contingency.estimated_impact && (
                    <Card className="border-2 border-grey-200 p-6">
                      <Stack gap={3}>
                        <H3>Estimated Impact</H3>
                        <Body className="text-grey-700">{contingency.estimated_impact}</Body>
                      </Stack>
                    </Card>
                  )}

                  {/* Resources Required */}
                  {contingency.resources_required && contingency.resources_required.length > 0 && (
                    <Card className="border-2 border-grey-200 p-6">
                      <Stack gap={3}>
                        <H3>Resources Required</H3>
                        <Stack gap={2}>
                          {contingency.resources_required.map((resource, index) => (
                            <Stack key={index} direction="horizontal" gap={2} className="items-center">
                              <Box className="size-2 rounded-avatar bg-primary" />
                              <Body>{resource}</Body>
                            </Stack>
                          ))}
                        </Stack>
                      </Stack>
                    </Card>
                  )}
                </Stack>
              </Box>

              {/* Sidebar */}
              <Stack gap={4}>
                {/* Contingency Details */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Details</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-grey-500">Category</Body>
                        <Body>{categoryLabels[contingency.category] || contingency.category}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-grey-500">Severity</Body>
                        <Badge variant={severityColors[contingency.severity] || 'default'}>
                          {contingency.severity.toUpperCase()}
                        </Badge>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-grey-500">Status</Body>
                        <Badge variant={statusColors[contingency.status] || 'default'}>
                          {contingency.status.toUpperCase()}
                        </Badge>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>

                {/* Ownership */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Ownership</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-grey-500">Primary Owner</Body>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <User className="size-4 text-grey-400" />
                          <Body>{contingency.owner ? `${contingency.owner.first_name} ${contingency.owner.last_name}` : 'Unassigned'}</Body>
                        </Stack>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-grey-500">Backup Owner</Body>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <User className="size-4 text-grey-400" />
                          <Body>{contingency.backup_owner ? `${contingency.backup_owner.first_name} ${contingency.backup_owner.last_name}` : 'Unassigned'}</Body>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>

                {/* Timeline */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Timeline</H3>
                    <Stack gap={3}>
                      {contingency.triggered_at && (
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Triggered At</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Clock className="size-4 text-error" />
                            <Body>{new Date(contingency.triggered_at).toLocaleString()}</Body>
                          </Stack>
                        </Stack>
                      )}
                      {contingency.resolved_at && (
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Resolved At</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <CheckCircle className="size-4 text-success" />
                            <Body>{new Date(contingency.resolved_at).toLocaleString()}</Body>
                          </Stack>
                        </Stack>
                      )}
                      {!contingency.triggered_at && !contingency.resolved_at && (
                        <Body className="text-grey-500">No timeline events yet.</Body>
                      )}
                    </Stack>
                  </Stack>
                </Card>

                {/* Notification List */}
                {contingency.notification_list && contingency.notification_list.length > 0 && (
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Notification List</H3>
                      <Stack gap={2}>
                        {contingency.notification_list.map((contact, index) => (
                          <Body key={index} className="text-body-sm">{contact}</Body>
                        ))}
                      </Stack>
                    </Stack>
                  </Card>
                )}
              </Stack>
            </Grid>
          </Stack>
        </Container>
      </Section>

      <ConfirmDialog
        open={triggerDialogOpen}
        title="Trigger Contingency"
        message={`Are you sure you want to trigger "${contingency.title}"? This will notify all relevant parties and initiate the response plan.`}
        variant="danger"
        confirmLabel="Trigger"
        onConfirm={handleTrigger}
        onCancel={() => setTriggerDialogOpen(false)}
      />

      <ConfirmDialog
        open={resolveDialogOpen}
        title="Resolve Contingency"
        message={`Mark "${contingency.title}" as resolved?`}
        variant="default"
        confirmLabel="Resolve"
        onConfirm={handleResolve}
        onCancel={() => setResolveDialogOpen(false)}
      />
    </AtlvsAppLayout>
  );
}
