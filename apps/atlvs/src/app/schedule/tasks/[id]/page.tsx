'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Pencil, CheckCircle, Clock, User, Calendar, AlertTriangle } from 'lucide-react';
import { AtlvsAppLayout } from '../../../../components/app-layout';
import { useTask, useUpdateTask, useCompleteTask } from '../../../../hooks/useTasks';
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

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  
  const { data: task, isLoading, refetch } = useTask(taskId);
  const updateMutation = useUpdateTask();
  const completeMutation = useCompleteTask();
  
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    completed: 'success',
    in_progress: 'warning',
    pending: 'default',
    blocked: 'error',
    cancelled: 'error',
  };

  const priorityColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'default',
  };

  const handleComplete = async () => {
    await completeMutation.mutateAsync(taskId);
    setCompleteDialogOpen(false);
    refetch();
  };

  const handleStatusChange = async (newStatus: string) => {
    await updateMutation.mutateAsync({ id: taskId, status: newStatus as ScheduleTask['status'] });
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

  if (!task) {
    return (
      <AtlvsAppLayout>
        <Section className="min-h-screen bg-grey-100 py-8">
          <Container>
            <Body>Task not found</Body>
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
                  Back to Tasks
                </Button>
                <Stack gap={2}>
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <H2>{task.title}</H2>
                    <Badge variant={statusColors[task.status] || 'ghost'}>
                      {task.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant={priorityColors[task.priority] || 'ghost'}>
                      {task.priority.toUpperCase()}
                    </Badge>
                  </Stack>
                  <Body className="text-grey-600">
                    {task.task_type.replace('_', ' ').toUpperCase()} | {task.department || 'No department'}
                  </Body>
                </Stack>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                {task.status !== 'completed' && task.status !== 'cancelled' && (
                  <Button
                    onClick={() => setCompleteDialogOpen(true)}
                    className="flex items-center gap-2 border-2 border-success bg-success px-4 py-2 text-white"
                  >
                    <CheckCircle className="size-4" />
                    Complete
                  </Button>
                )}
                <Button
                  onClick={() => router.push(`/schedule/tasks/${taskId}/edit`)}
                  className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
              </Stack>
            </Stack>

            <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
              {/* Main Content */}
              <Box className="col-span-2">
                <Stack gap={4}>
                  {/* Description */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={3}>
                      <H3>Description</H3>
                      <Body className="text-grey-700">
                        {task.description || 'No description provided.'}
                      </Body>
                    </Stack>
                  </Card>

                  {/* Timeline */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Timeline</H3>
                      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Start Time</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Clock className="size-4 text-grey-400" />
                            <Body>{task.start_time ? new Date(task.start_time).toLocaleString() : 'Not set'}</Body>
                          </Stack>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">End Time</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Clock className="size-4 text-grey-400" />
                            <Body>{task.end_time ? new Date(task.end_time).toLocaleString() : 'Not set'}</Body>
                          </Stack>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Due Date</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Calendar className="size-4 text-grey-400" />
                            <Body>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</Body>
                          </Stack>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Completed At</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <CheckCircle className="size-4 text-grey-400" />
                            <Body>{task.completed_at ? new Date(task.completed_at).toLocaleString() : 'Not completed'}</Body>
                          </Stack>
                        </Stack>
                      </Grid>
                    </Stack>
                  </Card>

                  {/* Dependencies */}
                  {task.dependencies && task.dependencies.length > 0 && (
                    <Card className="border-2 border-grey-200 p-6">
                      <Stack gap={4}>
                        <H3>Dependencies</H3>
                        <Stack gap={2}>
                          {task.dependencies.map((dep, index) => (
                            <Stack key={index} direction="horizontal" gap={2} className="items-center">
                              <AlertTriangle className="size-4 text-warning" />
                              <Body>{dep}</Body>
                            </Stack>
                          ))}
                        </Stack>
                      </Stack>
                    </Card>
                  )}

                  {/* Notes */}
                  {task.notes && (
                    <Card className="border-2 border-grey-200 p-6">
                      <Stack gap={3}>
                        <H3>Notes</H3>
                        <Body className="text-grey-700">{task.notes}</Body>
                      </Stack>
                    </Card>
                  )}
                </Stack>
              </Box>

              {/* Sidebar */}
              <Stack gap={4}>
                {/* Task Details */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Task Details</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Type</Body>
                        <Body>{task.task_type.replace('_', ' ').toUpperCase()}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Priority</Body>
                        <Badge variant={priorityColors[task.priority] || 'ghost'}>
                          {task.priority.toUpperCase()}
                        </Badge>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Status</Body>
                        <Badge variant={statusColors[task.status] || 'ghost'}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Department</Body>
                        <Body>{task.department || 'Not assigned'}</Body>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>

                {/* Assignment */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Assignment</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Assigned To</Body>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <User className="size-4 text-grey-400" />
                          <Body>{task.assignee ? `${task.assignee.first_name} ${task.assignee.last_name}` : 'Unassigned'}</Body>
                        </Stack>
                      </Stack>
                      {task.show && (
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Related Show</Body>
                          <Body>{task.show.title}</Body>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </Card>

                {/* Status Actions */}
                {task.status !== 'completed' && task.status !== 'cancelled' && (
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Update Status</H3>
                      <Stack gap={2}>
                        {task.status !== 'in_progress' && (
                          <Button
                            onClick={() => handleStatusChange('in_progress')}
                            className="w-full border-2 border-warning bg-warning/10 px-4 py-2 text-warning"
                          >
                            Start Task
                          </Button>
                        )}
                        {task.status !== 'blocked' && (
                          <Button
                            onClick={() => handleStatusChange('blocked')}
                            className="w-full border-2 border-error bg-error/10 px-4 py-2 text-error"
                          >
                            Mark Blocked
                          </Button>
                        )}
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
        open={completeDialogOpen}
        title="Complete Task"
        message={`Mark "${task.title}" as completed?`}
        variant="default"
        confirmLabel="Complete"
        onConfirm={handleComplete}
        onCancel={() => setCompleteDialogOpen(false)}
      />
    </AtlvsAppLayout>
  );
}

interface ScheduleTask {
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'blocked';
}
