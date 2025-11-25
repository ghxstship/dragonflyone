'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Section,
  Display,
  Body,
  Button,
  Card,
  Grid,
  Badge,
  Stack,
  StatCard,
  LoadingSpinner,
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

  // Use mock data
  const displayTasks = mockTasks;

  const updateTaskStatus = (id: string, status: Task['status']) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-black';
      case 'medium': return 'border-l-4 border-l-grey-600';
      case 'low': return 'border-l-4 border-l-grey-400';
      default: return 'border-l-4 border-l-grey-400';
    }
  };

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Stack gap={8}>
          <Card className="border-b-2 border-black py-8 bg-transparent rounded-none">
            <Stack gap={2}>
              <Display>BUILD & STRIKE</Display>
              <Body>Build Progress: 45%</Body>
            </Stack>
          </Card>

          <Grid cols={3} gap={6}>
            <StatCard
              value={tasks.filter(t => t.status === 'complete').length}
              label="Complete"
            />
            <StatCard
              value={tasks.filter(t => t.status === 'in-progress').length}
              label="In Progress"
            />
            <StatCard
              value={tasks.filter(t => t.status === 'pending').length}
              label="Pending"
            />
          </Grid>

          <Stack gap={4}>
            {displayTasks.map(task => (
              <Card
                key={task.id}
                className={`p-6 ${getPriorityColor(task.priority)}`}
              >
                <Grid cols={4} gap={4}>
                  <Stack gap={1} className="col-span-2">
                    <Body className="font-bold text-lg">{task.task}</Body>
                    <Body className="text-sm text-grey-600">{task.area} • {task.assignedTo}</Body>
                  </Stack>
                  <Stack gap={0}>
                    <Badge>{task.priority.toUpperCase()}</Badge>
                  </Stack>
                  <Stack gap={0}>
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
                      <Body className="font-bold">✓ DONE</Body>
                    )}
                  </Stack>
                  <Stack gap={0} direction="horizontal" className="justify-end">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/build-strike/${task.id}/edit`)}>Edit</Button>
                  </Stack>
                </Grid>
              </Card>
            ))}
          </Stack>

          <Stack gap={4} direction="horizontal">
            <Button variant="solid" onClick={() => router.push('/build-strike/new')}>Add Task</Button>
            <Button variant="outline" onClick={() => router.push('/safety/checklist')}>Safety Check</Button>
            <Button variant="outline" onClick={() => router.push('/build-strike/photos')}>Photo Log</Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
