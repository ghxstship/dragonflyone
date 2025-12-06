'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  StatCard,
  Button,
  Badge,
  Grid,
  Body,
  H3,
  Checkbox,
  ProgressBar,
} from '@ghxstship/ui';
import {
  Truck,
  Package,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { CompvssAppLayout } from '../../../../components/app-layout';

interface LoadInTask {
  id: string;
  department: string;
  task: string;
  assignee: string;
  scheduledTime: string;
  status: 'pending' | 'in-progress' | 'completed';
  notes?: string;
}

const LOAD_IN_TASKS: LoadInTask[] = [
  { id: '1', department: 'Staging', task: 'Stage deck installation', assignee: 'Stage Crew A', scheduledTime: '06:00', status: 'completed' },
  { id: '2', department: 'Staging', task: 'Truss rigging', assignee: 'Rigging Team', scheduledTime: '08:00', status: 'completed' },
  { id: '3', department: 'Audio', task: 'PA system setup', assignee: 'Audio Team', scheduledTime: '10:00', status: 'in-progress' },
  { id: '4', department: 'Audio', task: 'Monitor setup', assignee: 'Audio Team', scheduledTime: '12:00', status: 'pending' },
  { id: '5', department: 'Lighting', task: 'Fixture hang', assignee: 'Lighting Crew', scheduledTime: '10:00', status: 'in-progress' },
  { id: '6', department: 'Lighting', task: 'Focus and program', assignee: 'LD', scheduledTime: '14:00', status: 'pending' },
  { id: '7', department: 'Video', task: 'LED wall assembly', assignee: 'Video Team', scheduledTime: '11:00', status: 'pending' },
  { id: '8', department: 'Backline', task: 'Instrument setup', assignee: 'Backline Tech', scheduledTime: '15:00', status: 'pending' },
];

export default function ProductionLoadInPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const [tasks, setTasks] = useState<LoadInTask[]>(LOAD_IN_TASKS);

  const fetchTasks = useCallback(async () => {
    if (!productionId) return;
    try {
      const response = await fetch(`/api/productions/${productionId}/load-in`);
      if (response.ok) {
        const data = await response.json();
        if (data.tasks && data.tasks.length > 0) {
          setTasks(data.tasks);
        }
      }
    } catch (error) {
      console.error('Failed to fetch load-in tasks:', error);
    }
  }, [productionId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;
      const newStatus = task.status === 'completed' ? 'pending' : 
                        task.status === 'in-progress' ? 'completed' : 'in-progress';
      return { ...task, status: newStatus };
    }));
  };

  const departments = Array.from(new Set(tasks.map(t => t.department)));

  const getStatusBadge = (status: LoadInTask['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Complete</Badge>;
      case 'in-progress':
        return <Badge variant="warning">In Progress</Badge>;
      default:
        return <Badge variant="solid">Pending</Badge>;
    }
  };

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Production"
          title="Load-In Schedule"
          description="Track load-in progress by department and task"
          colorScheme="on-dark"
        />

        <Grid cols={4} gap={4}>
          <StatCard
            label="Total Tasks"
            value={tasks.length.toString()}
            icon={<Package size={20} />}
            inverted
          />
          <StatCard
            label="Completed"
            value={completedCount.toString()}
            icon={<CheckCircle size={20} />}
            trend="up"
            inverted
          />
          <StatCard
            label="In Progress"
            value={inProgressCount.toString()}
            icon={<Clock size={20} />}
            inverted
          />
          <StatCard
            label="Progress"
            value={`${progress}%`}
            icon={<ProgressBar value={progress} />}
            inverted
          />
        </Grid>

        {departments.map(dept => {
          const deptTasks = tasks.filter(t => t.department === dept);
          const deptCompleted = deptTasks.filter(t => t.status === 'completed').length;
          
          return (
            <Card key={dept} variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <Stack direction="horizontal" className="items-center justify-between">
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <Truck size={20} />
                      <H3 className="text-white">{dept}</H3>
                    </Stack>
                    <Badge variant={deptCompleted === deptTasks.length ? 'success' : 'warning'}>
                      {deptCompleted}/{deptTasks.length} Complete
                    </Badge>
                  </Stack>
                  <Stack gap={2}>
                    {deptTasks.map(task => (
                      <Stack
                        key={task.id}
                        direction="horizontal"
                        className="cursor-pointer items-center justify-between rounded border-2 border-ink-700 p-3 transition-colors hover:bg-ink-800"
                        onClick={() => toggleTaskStatus(task.id)}
                      >
                        <Stack direction="horizontal" gap={3} className="items-center">
                          <Checkbox
                            checked={task.status === 'completed'}
                            onChange={() => toggleTaskStatus(task.id)}
                          />
                          <Stack gap={0}>
                            <Body className={task.status === 'completed' ? 'text-on-dark-muted line-through' : 'text-white'}>
                              {task.task}
                            </Body>
                            <Body className="text-body-sm text-on-dark-muted">
                              {task.assignee} - {task.scheduledTime}
                            </Body>
                          </Stack>
                        </Stack>
                        {getStatusBadge(task.status)}
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          );
        })}

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack direction="horizontal" className="items-center justify-between">
              <Stack gap={1}>
                <H3 className="text-white">Load-In Status</H3>
                <Body className="text-on-dark-muted">
                  {progress === 100 
                    ? 'All load-in tasks completed!'
                    : `${tasks.length - completedCount} tasks remaining`
                  }
                </Body>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Button variant="outline">
                  <AlertTriangle size={16} className="mr-2" />
                  Report Issue
                </Button>
                <Button variant="solid">
                  <Users size={16} className="mr-2" />
                  Crew Check-In
                </Button>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </CompvssAppLayout>
  );
}
