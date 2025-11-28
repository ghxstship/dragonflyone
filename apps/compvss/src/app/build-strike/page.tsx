'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../components/navigation';
import {
  Container,
  Section,
  Body,
  Button,
  Card,
  Grid,
  Badge,
  Stack,
  StatCard,
  PageLayout,
  SectionHeader,
} from '@ghxstship/ui';

interface Task {
  id: string;
  task: string;
  area: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'complete';
  priority: 'low' | 'medium' | 'high';
}

const mockTasks: Task[] = [
  { id: '1', task: 'Rig main truss', area: 'Stage', assignedTo: 'Rigging Team', status: 'complete', priority: 'high' },
  { id: '2', task: 'Install LED wall', area: 'Upstage', assignedTo: 'Video Team', status: 'in-progress', priority: 'high' },
  { id: '3', task: 'Run power distribution', area: 'FOH', assignedTo: 'Electric', status: 'in-progress', priority: 'high' },
  { id: '4', task: 'Set up console', area: 'FOH', assignedTo: 'Sound Team', status: 'pending', priority: 'medium' },
  { id: '5', task: 'Install monitors', area: 'Stage', assignedTo: 'Sound Team', status: 'pending', priority: 'medium' },
  { id: '6', task: 'Drape stage', area: 'Stage', assignedTo: 'Stage Team', status: 'pending', priority: 'low' },
];

export default function BuildStrikePage() {
  const router = useRouter();
  const [tasks, setTasks] = useState(mockTasks);

  const displayTasks = tasks;

  const updateTaskStatus = (id: string, status: Task['status']) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            {/* Page Header */}
            <SectionHeader
              kicker="COMPVSS"
              title="Build & Strike"
              description="Build Progress: 45%"
              colorScheme="on-light"
              gap="lg"
            />

            {/* Stats Grid */}
            <Grid cols={3} gap={6}>
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
                      <Body className="text-body-sm">{task.area} • {task.assignedTo}</Body>
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
      </Section>
    </PageLayout>
  );
}
