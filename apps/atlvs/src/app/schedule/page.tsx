'use client';

import { useRouter } from 'next/navigation';
import { CheckSquare, AlertTriangle, FileText, Clock, TrendingUp } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import { useTaskStats, useContingencyStats, useTasks, useContingencies } from '../../hooks/useTasks';
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

export default function SchedulePage() {
  const router = useRouter();
  const { data: taskStats } = useTaskStats();
  const { data: contingencyStats } = useContingencyStats();
  const { data: tasks } = useTasks();
  const { data: contingencies } = useContingencies();

  // Get upcoming tasks (next 7 days)
  const upcomingTasks = tasks?.filter(t => {
    if (!t.due_date || t.status === 'completed' || t.status === 'cancelled') return false;
    const dueDate = new Date(t.due_date);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return dueDate >= now && dueDate <= weekFromNow;
  }).slice(0, 5) || [];

  // Get active contingencies
  const activeContingencies = contingencies?.filter(c => c.status === 'active' || c.status === 'triggered').slice(0, 5) || [];

  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    completed: 'success',
    in_progress: 'warning',
    pending: 'default',
    blocked: 'error',
    triggered: 'error',
    active: 'info',
    resolved: 'success',
  };

  const priorityColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'default',
  };

  return (
    <AtlvsAppLayout>
      <Section className="min-h-screen bg-grey-100 py-8">
        <Container>
          <Stack gap={6}>
            {/* Header */}
            <Stack gap={1}>
              <H2>Schedule Management</H2>
              <Body className="text-grey-600">Manage tasks, contingencies, and production schedules</Body>
            </Stack>

            {/* Key Metrics */}
            <Grid cols={4} gap={4}>
              <StatCard
                label="Total Tasks"
                value={taskStats?.total || 0}
                icon={<CheckSquare className="size-5" />}
              />
              <StatCard
                label="In Progress"
                value={taskStats?.inProgress || 0}
                icon={<Clock className="size-5" />}
              />
              <StatCard
                label="Critical Tasks"
                value={taskStats?.critical || 0}
                icon={<AlertTriangle className="size-5" />}
                trend={taskStats?.critical && taskStats.critical > 0 ? 'down' : undefined}
              />
              <StatCard
                label="Active Contingencies"
                value={contingencyStats?.active || 0}
                icon={<AlertTriangle className="size-5" />}
              />
            </Grid>

            {/* Quick Actions */}
            <Grid cols={4} gap={4}>
              <Card 
                className="cursor-pointer border-2 border-grey-200 p-6 transition-all hover:border-primary hover:shadow-md"
                onClick={() => router.push('/schedule/tasks')}
              >
                <Stack gap={3} className="items-center text-center">
                  <Box className="flex size-12 items-center justify-center rounded-card bg-grey-100">
                    <CheckSquare className="size-6 text-primary" />
                  </Box>
                  <Stack gap={1}>
                    <H3>Tasks</H3>
                    <Body className="text-body-sm text-grey-500">{taskStats?.total || 0} total tasks</Body>
                  </Stack>
                </Stack>
              </Card>
              <Card 
                className="cursor-pointer border-2 border-grey-200 p-6 transition-all hover:border-primary hover:shadow-md"
                onClick={() => router.push('/schedule/contingencies')}
              >
                <Stack gap={3} className="items-center text-center">
                  <Box className="flex size-12 items-center justify-center rounded-card bg-grey-100">
                    <AlertTriangle className="size-6 text-warning" />
                  </Box>
                  <Stack gap={1}>
                    <H3>Contingencies</H3>
                    <Body className="text-body-sm text-grey-500">{contingencyStats?.total || 0} plans</Body>
                  </Stack>
                </Stack>
              </Card>
              <Card 
                className="cursor-pointer border-2 border-grey-200 p-6 transition-all hover:border-primary hover:shadow-md"
                onClick={() => router.push('/schedule/templates')}
              >
                <Stack gap={3} className="items-center text-center">
                  <Box className="flex size-12 items-center justify-center rounded-card bg-grey-100">
                    <FileText className="size-6 text-secondary" />
                  </Box>
                  <Stack gap={1}>
                    <H3>Templates</H3>
                    <Body className="text-body-sm text-grey-500">Reusable task templates</Body>
                  </Stack>
                </Stack>
              </Card>
              <Card 
                className="cursor-pointer border-2 border-grey-200 p-6 transition-all hover:border-primary hover:shadow-md"
                onClick={() => router.push('/schedule/tasks?status=blocked')}
              >
                <Stack gap={3} className="items-center text-center">
                  <Box className="flex size-12 items-center justify-center rounded-card bg-grey-100">
                    <TrendingUp className="size-6 text-error" />
                  </Box>
                  <Stack gap={1}>
                    <H3>Blocked</H3>
                    <Body className="text-body-sm text-grey-500">{taskStats?.blocked || 0} blocked tasks</Body>
                  </Stack>
                </Stack>
              </Card>
            </Grid>

            <Grid cols={2} gap={6}>
              {/* Upcoming Tasks */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={4} className="items-center justify-between">
                    <H3>Upcoming Tasks</H3>
                    <Button
                      onClick={() => router.push('/schedule/tasks')}
                      className="border-2 border-grey-300 bg-white px-4 py-2"
                    >
                      View All
                    </Button>
                  </Stack>
                  {upcomingTasks.length > 0 ? (
                    <Stack gap={3}>
                      {upcomingTasks.map(task => (
                        <Stack 
                          key={task.id} 
                          direction="horizontal" 
                          gap={4} 
                          className="cursor-pointer items-center justify-between rounded-card border-2 border-grey-200 p-3 hover:bg-grey-50"
                          onClick={() => router.push(`/schedule/tasks/${task.id}`)}
                        >
                          <Stack gap={1}>
                            <Body className="font-weight-semibold">{task.title}</Body>
                            <Body className="text-body-sm text-grey-500">
                              Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                            </Body>
                          </Stack>
                          <Stack direction="horizontal" gap={2}>
                            <Badge variant={priorityColors[task.priority] || 'ghost'}>
                              {task.priority.toUpperCase()}
                            </Badge>
                            <Badge variant={statusColors[task.status] || 'ghost'}>
                              {task.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  ) : (
                    <Box className="rounded-card border-2 border-dashed border-grey-300 p-8 text-center">
                      <Body className="text-grey-500">No upcoming tasks in the next 7 days.</Body>
                    </Box>
                  )}
                </Stack>
              </Card>

              {/* Active Contingencies */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={4} className="items-center justify-between">
                    <H3>Active Contingencies</H3>
                    <Button
                      onClick={() => router.push('/schedule/contingencies')}
                      className="border-2 border-grey-300 bg-white px-4 py-2"
                    >
                      View All
                    </Button>
                  </Stack>
                  {activeContingencies.length > 0 ? (
                    <Stack gap={3}>
                      {activeContingencies.map(contingency => (
                        <Stack 
                          key={contingency.id} 
                          direction="horizontal" 
                          gap={4} 
                          className="cursor-pointer items-center justify-between rounded-card border-2 border-grey-200 p-3 hover:bg-grey-50"
                          onClick={() => router.push(`/schedule/contingencies/${contingency.id}`)}
                        >
                          <Stack gap={1}>
                            <Body className="font-weight-semibold">{contingency.title}</Body>
                            <Body className="text-body-sm text-grey-500">
                              {contingency.category.charAt(0).toUpperCase() + contingency.category.slice(1)}
                            </Body>
                          </Stack>
                          <Stack direction="horizontal" gap={2}>
                            <Badge variant={priorityColors[contingency.severity] || 'ghost'}>
                              {contingency.severity.toUpperCase()}
                            </Badge>
                            <Badge variant={statusColors[contingency.status] || 'ghost'}>
                              {contingency.status.toUpperCase()}
                            </Badge>
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  ) : (
                    <Box className="rounded-card border-2 border-dashed border-grey-300 p-8 text-center">
                      <Body className="text-grey-500">No active contingencies.</Body>
                    </Box>
                  )}
                </Stack>
              </Card>
            </Grid>

            {/* Task Status Overview */}
            <Card className="border-2 border-grey-200 p-6">
              <Stack gap={4}>
                <H3>Task Status Overview</H3>
                <Grid cols={5} gap={4}>
                  <Card className="border-2 border-grey-200 p-4 text-center">
                    <Stack gap={2}>
                      <Body className="text-body-lg font-weight-bold">{taskStats?.pending || 0}</Body>
                      <Body className="text-body-sm text-grey-500">Pending</Body>
                    </Stack>
                  </Card>
                  <Card className="border-2 border-warning p-4 text-center">
                    <Stack gap={2}>
                      <Body className="text-body-lg font-weight-bold text-warning">{taskStats?.inProgress || 0}</Body>
                      <Body className="text-body-sm text-grey-500">In Progress</Body>
                    </Stack>
                  </Card>
                  <Card className="border-2 border-success p-4 text-center">
                    <Stack gap={2}>
                      <Body className="text-body-lg font-weight-bold text-success">{taskStats?.completed || 0}</Body>
                      <Body className="text-body-sm text-grey-500">Completed</Body>
                    </Stack>
                  </Card>
                  <Card className="border-2 border-error p-4 text-center">
                    <Stack gap={2}>
                      <Body className="text-body-lg font-weight-bold text-error">{taskStats?.blocked || 0}</Body>
                      <Body className="text-body-sm text-grey-500">Blocked</Body>
                    </Stack>
                  </Card>
                  <Card className="border-2 border-error p-4 text-center">
                    <Stack gap={2}>
                      <Body className="text-body-lg font-weight-bold text-error">{taskStats?.critical || 0}</Body>
                      <Body className="text-body-sm text-grey-500">Critical</Body>
                    </Stack>
                  </Card>
                </Grid>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Section>
    </AtlvsAppLayout>
  );
}
