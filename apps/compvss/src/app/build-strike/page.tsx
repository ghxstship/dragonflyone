'use client';

import { useRouter } from 'next/navigation';
// Layout provided by route group
import {
  Container,
  Body,
  Button,
  Card,
  Grid,
  Badge,
  Stack,
  StatCard,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';

import {
  useBuildStrikeTasks,
  useUpdateBuildStrikeTaskStatus,
  type BuildStrikeTask as Task,
} from '../../hooks/useBuildStrike';

export default function BuildStrikePage() {
  const router = useRouter();
  const { data: tasks = [], isLoading, error } = useBuildStrikeTasks();
  const updateStatusMutation = useUpdateBuildStrikeTaskStatus();

  const displayTasks = tasks;

  const updateTaskStatus = async (id: string, status: Task['status']) => {
    await updateStatusMutation.mutateAsync({ id, status });
  };

  if (isLoading) {
    return (
      <>
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <Stack gap={4} className="items-center">
              <div className="h-8 w-8 animate-spin rounded-avatar border-4 border-primary border-t-transparent" />
              <Body>Loading build & strike tasks...</Body>
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <MainContent padding="lg">
          <Container>
            <Card className="p-6 border-destructive bg-destructive/10">
              <Stack gap={4} className="items-center text-center">
                <Body className="text-destructive font-display">Failed to load tasks</Body>
                <Body className="text-destructive">{error instanceof Error ? error.message : 'An error occurred'}</Body>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
              </Stack>
            </Card>
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title="Build & Strike"
        subtitle="Build Progress: 45%"


        primaryAction={{ label: 'Add Task', onClick: () => router.push('/build-strike/new') }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            {/* Stats Grid */}
            <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                value={tasks.filter(t => t.status === 'complete').length.toString()}
                label="Complete"
              />
              <StatCard
                value={tasks.filter(t => t.status === 'in-progress').length.toString()}
                label="In Progress"
              />
              <StatCard
                value={tasks.filter(t => t.status === 'pending').length.toString()}
                label="Pending"
              />
            </Grid>

            {/* Task List */}
            <Stack gap={4}>
              {displayTasks.map(task => (
                <Card key={task.id} className="p-6">
                  <Grid cols={4} gap={4} className="items-center">
                    <Stack gap={1} className="col-span-2">
                      <Body className="text-body-md font-display">{task.task}</Body>
                      <Body size="sm" className="">{task.area} • {task.assignedTo}</Body>
                    </Stack>
                    <Badge variant={task.priority === 'high' ? 'solid' : 'outline'}>
                      {task.priority.toUpperCase()}
                    </Badge>
                    <Stack>
                      {task.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateTaskStatus(task.id, 'in-progress')}
                        >
                          Start
                        </Button>
                      )}
                      {task.status === 'in-progress' && (
                        <Button
                          variant="solid"
                          size="sm"
                          onClick={() => updateTaskStatus(task.id, 'complete')}
                        >
                          Complete
                        </Button>
                      )}
                      {task.status === 'complete' && (
                        <Badge variant="solid">✓ DONE</Badge>
                      )}
                    </Stack>
                    <Stack direction="horizontal" className="justify-end">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/build-strike/${task.id}/edit`)}>Edit</Button>
                    </Stack>
                  </Grid>
                </Card>
              ))}
            </Stack>

            {/* Actions */}
            <Stack gap={4} direction="horizontal">
              <Button variant="solid" onClick={() => router.push('/build-strike/new')}>Add Task</Button>
              <Button variant="outline" onClick={() => router.push('/safety/checklist')}>Safety Check</Button>
              <Button variant="outline" onClick={() => router.push('/build-strike/photos')}>Photo Log</Button>
            </Stack>
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
