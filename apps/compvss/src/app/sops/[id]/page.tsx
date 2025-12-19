'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Pencil, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { CompvssAppLayout } from '../../../components/app-layout';
import { useSOP, useCreateSOPStep, useUpdateSOPStep, useDeleteSOPStep, useAcknowledgeSOP, type SOPStep } from '../../../hooks/useSOPs';
import { useAuth } from '@ghxstship/config';
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
  RecordFormModal,
  ConfirmDialog,
  type FormFieldConfig,
} from '@ghxstship/ui';

const stepFormFields: FormFieldConfig[] = [
  { name: 'step_number', label: 'Step Number', type: 'number', required: true },
  { name: 'title', label: 'Step Title', type: 'text', required: true, placeholder: 'e.g., Assess the situation', colSpan: 2 },
  { name: 'description', label: 'Description', type: 'textarea', required: true, colSpan: 2, placeholder: 'Detailed instructions...' },
  { name: 'notes', label: 'Additional Notes', type: 'textarea', colSpan: 2 },
  { name: 'warning', label: 'Warning/Caution', type: 'textarea', colSpan: 2, placeholder: 'Any safety warnings...' },
  { name: 'duration_minutes', label: 'Duration (minutes)', type: 'number' },
  { name: 'is_critical', label: 'Critical Step', type: 'checkbox' },
];

export default function SOPDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sopId = params.id as string;
  const { user } = useAuth();
  
  const { data: sop, isLoading, refetch } = useSOP(sopId);
  const createStepMutation = useCreateSOPStep();
  const updateStepMutation = useUpdateSOPStep();
  const deleteStepMutation = useDeleteSOPStep();
  const acknowledgeMutation = useAcknowledgeSOP();
  
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<SOPStep | null>(null);
  const [deleteStepId, setDeleteStepId] = useState<string | null>(null);

  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'ghost'> = {
    approved: 'success',
    review: 'warning',
    draft: 'ghost',
    archived: 'error',
  };

  const handleCreateStep = async (data: Record<string, unknown>) => {
    await createStepMutation.mutateAsync({
      sop_id: sopId,
      step_number: data.step_number as number,
      title: data.title as string,
      description: data.description as string,
      notes: data.notes as string | undefined,
      warning: data.warning as string | undefined,
      duration_minutes: data.duration_minutes as number | undefined,
      is_critical: data.is_critical as boolean,
    });
    setStepModalOpen(false);
    refetch();
  };

  const handleUpdateStep = async (data: Record<string, unknown>) => {
    if (editingStep) {
      await updateStepMutation.mutateAsync({
        id: editingStep.id,
        sopId,
        step_number: data.step_number as number,
        title: data.title as string,
        description: data.description as string,
        notes: data.notes as string | undefined,
        warning: data.warning as string | undefined,
        duration_minutes: data.duration_minutes as number | undefined,
        is_critical: data.is_critical as boolean,
      });
      setEditingStep(null);
      refetch();
    }
  };

  const handleDeleteStep = async () => {
    if (deleteStepId) {
      await deleteStepMutation.mutateAsync({ id: deleteStepId, sopId });
      setDeleteStepId(null);
      refetch();
    }
  };

  const handleAcknowledge = async () => {
    await acknowledgeMutation.mutateAsync({
      sopId,
      userId: user?.id || '', 
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

  if (!sop) {
    return (
      <CompvssAppLayout>
        <Section className="min-h-screen bg-grey-100 py-8">
          <Container>
            <Body>SOP not found</Body>
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
                  Back to SOPs
                </Button>
                <Stack gap={2}>
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <H2>{sop.title}</H2>
                    <Badge variant={statusColors[sop.status] || 'ghost'}>
                      {sop.status.toUpperCase()}
                    </Badge>
                  </Stack>
                  <Body className="text-grey-600">
                    Version {sop.version} | {sop.category?.name || 'Uncategorized'}
                  </Body>
                </Stack>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                {sop.requires_acknowledgment && (
                  <Button
                    onClick={handleAcknowledge}
                    className="flex items-center gap-2 border-2 border-success bg-success px-4 py-2 text-white"
                  >
                    <CheckCircle className="size-4" />
                    Acknowledge
                  </Button>
                )}
                <Button
                  onClick={() => router.push(`/sops/${sopId}/edit`)}
                  className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
              </Stack>
            </Stack>

            <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
              {/* Main Content - Steps */}
              <Box className="col-span-2">
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <Stack direction="horizontal" gap={4} className="items-center justify-between">
                      <H3>Procedure Steps</H3>
                      <Button
                        onClick={() => setStepModalOpen(true)}
                        className="flex items-center gap-2 border-2 border-primary bg-primary px-4 py-2 text-white"
                      >
                        <Plus className="size-4" />
                        Add Step
                      </Button>
                    </Stack>

                    {sop.steps && sop.steps.length > 0 ? (
                      <Stack gap={4}>
                        {sop.steps.map((step) => (
                          <Card
                            key={step.id}
                            className={`border-2 p-4 ${step.is_critical ? 'border-error bg-error/5' : 'border-grey-200'}`}
                          >
                            <Stack gap={3}>
                              <Stack direction="horizontal" gap={3} className="items-start justify-between">
                                <Stack direction="horizontal" gap={3} className="items-center">
                                  <Box className="flex size-8 items-center justify-center rounded-button border-2 border-grey-300 bg-grey-100 font-weight-bold">
                                    {step.step_number}
                                  </Box>
                                  <Stack gap={0}>
                                    <Body className="font-weight-semibold">{step.title}</Body>
                                    {step.is_critical && (
                                      <Badge variant="error">Critical Step</Badge>
                                    )}
                                  </Stack>
                                </Stack>
                                <Stack direction="horizontal" gap={1}>
                                  <Button
                                    onClick={() => setEditingStep(step)}
                                    className="border-2 border-grey-200 bg-white p-2"
                                  >
                                    <Pencil className="size-4" />
                                  </Button>
                                  <Button
                                    onClick={() => setDeleteStepId(step.id)}
                                    className="border-2 border-grey-200 bg-white p-2 text-error"
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </Stack>
                              </Stack>

                              <Body className="text-grey-700">{step.description}</Body>

                              {step.warning && (
                                <Box className="flex items-start gap-2 rounded-card border-2 border-warning bg-warning/10 p-3">
                                  <AlertTriangle className="size-5 shrink-0 text-warning" />
                                  <Body size="sm" className=" text-warning">{step.warning}</Body>
                                </Box>
                              )}

                              {step.notes && (
                                <Body size="sm" className=" text-grey-500">
                                  Note: {step.notes}
                                </Body>
                              )}

                              {step.duration_minutes && (
                                <Body size="sm" className=" text-grey-400">
                                  Estimated time: {step.duration_minutes} minutes
                                </Body>
                              )}
                            </Stack>
                          </Card>
                        ))}
                      </Stack>
                    ) : (
                      <Box className="rounded-card border-2 border-dashed border-grey-300 p-8 text-center">
                        <Body className="text-grey-500">No steps defined yet. Add the first step to get started.</Body>
                      </Box>
                    )}
                  </Stack>
                </Card>
              </Box>

              {/* Sidebar */}
              <Stack gap={4}>
                {/* SOP Details */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Details</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Category</Body>
                        <Body>{sop.category?.name || 'Uncategorized'}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Version</Body>
                        <Body>{sop.version}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Effective Date</Body>
                        <Body>{sop.effective_date ? new Date(sop.effective_date).toLocaleDateString() : 'Not set'}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Owner</Body>
                        <Body>{sop.owner ? `${sop.owner.first_name} ${sop.owner.last_name}` : 'Not assigned'}</Body>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>

                {/* Requirements */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Requirements</H3>
                    <Stack gap={3}>
                      <Stack direction="horizontal" gap={2} className="items-center justify-between">
                        <Body>Acknowledgment</Body>
                        <Badge variant={sop.requires_acknowledgment ? 'warning' : 'ghost'}>
                          {sop.requires_acknowledgment ? 'Required' : 'Not Required'}
                        </Badge>
                      </Stack>
                      <Stack direction="horizontal" gap={2} className="items-center justify-between">
                        <Body>Training</Body>
                        <Badge variant={sop.requires_training ? 'warning' : 'ghost'}>
                          {sop.requires_training ? 'Required' : 'Not Required'}
                        </Badge>
                      </Stack>
                      {sop.training_duration_minutes && (
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Training Duration</Body>
                          <Body>{sop.training_duration_minutes} minutes</Body>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </Card>

                {/* Description */}
                {sop.description && (
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={2}>
                      <H3>Description</H3>
                      <Body className="text-grey-600">{sop.description}</Body>
                    </Stack>
                  </Card>
                )}
              </Stack>
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* Create Step Modal */}
      <RecordFormModal
        open={stepModalOpen}
        onClose={() => setStepModalOpen(false)}
        mode="create"
        title="Add Step"
        fields={stepFormFields}
        onSubmit={handleCreateStep}
        size="lg"
        record={{ step_number: (sop.steps?.length || 0) + 1, is_critical: false }}
      />

      {/* Edit Step Modal */}
      <RecordFormModal
        open={!!editingStep}
        onClose={() => setEditingStep(null)}
        mode="edit"
        title="Edit Step"
        fields={stepFormFields}
        onSubmit={handleUpdateStep}
        size="lg"
        record={editingStep ? { ...editingStep } : {}}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteStepId}
        title="Delete Step"
        message="Are you sure you want to delete this step? This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDeleteStep}
        onCancel={() => setDeleteStepId(null)}
      />
    </CompvssAppLayout>
  );
}
