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
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { CompvssAppLayout } from '../../../../components/app-layout';

interface LoadOutTask {
  id: string;
  department: string;
  task: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed';
}

const LOAD_OUT_TASKS: LoadOutTask[] = [
  { id: '1', department: 'Backline', task: 'Strike instruments', assignee: 'Backline Tech', status: 'completed' },
  { id: '2', department: 'Audio', task: 'Strike monitors', assignee: 'Audio Team', status: 'completed' },
  { id: '3', department: 'Audio', task: 'Strike PA system', assignee: 'Audio Team', status: 'in-progress' },
  { id: '4', department: 'Lighting', task: 'Strike fixtures', assignee: 'Lighting Crew', status: 'in-progress' },
  { id: '5', department: 'Video', task: 'Strike LED wall', assignee: 'Video Team', status: 'pending' },
  { id: '6', department: 'Staging', task: 'Strike truss', assignee: 'Rigging Team', status: 'pending' },
  { id: '7', department: 'Staging', task: 'Strike deck', assignee: 'Stage Crew', status: 'pending' },
  { id: '8', department: 'General', task: 'Final walkthrough', assignee: 'PM', status: 'pending' },
];

export default function ProductionLoadOutPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const [tasks, setTasks] = useState<LoadOutTask[]>(LOAD_OUT_TASKS);

  const fetchTasks = useCallback(async () => {
    if (!productionId) return;
    try {
      const response = await fetch(`/api/productions/${productionId}/load-out`);
      if (response.ok) {
        const data = await response.json();
        if (data.tasks && data.tasks.length > 0) {
          setTasks(data.tasks);
        }
      }
    } catch (error) {
      console.error('Failed to fetch load-out tasks:', error);
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

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Production"
          title="Load-Out Schedule"
          description="Track load-out and strike progress"
          colorScheme="on-dark"
        />

        <Grid cols={4} gap={4}>
          <StatCard label="Total Tasks" value={tasks.length.toString()} icon={<Package size={20} />} inverted />
          <StatCard label="Completed" value={completedCount.toString()} icon={<CheckCircle size={20} />} trend="up" inverted />
          <StatCard label="In Progress" value={inProgressCount.toString()} icon={<Clock size={20} />} inverted />
          <StatCard label="Progress" value={`${progress}%`} icon={<ProgressBar value={progress} />} inverted />
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
                      {deptCompleted}/{deptTasks.length}
                    </Badge>
                  </Stack>
                  <Stack gap={2}>
                    {deptTasks.map(task => (
                      <Stack
                        key={task.id}
                        direction="horizontal"
                        className="cursor-pointer items-center justify-between rounded border-2 border-ink-700 p-3"
                        onClick={() => toggleTaskStatus(task.id)}
                      >
                        <Stack direction="horizontal" gap={3} className="items-center">
                          <Checkbox checked={task.status === 'completed'} onChange={() => toggleTaskStatus(task.id)} />
                          <Stack gap={0}>
                            <Body className={task.status === 'completed' ? 'text-on-dark-muted line-through' : 'text-white'}>{task.task}</Body>
                            <Body className="text-body-sm text-on-dark-muted">{task.assignee}</Body>
                          </Stack>
                        </Stack>
                        <Badge variant={task.status === 'completed' ? 'success' : task.status === 'in-progress' ? 'warning' : 'solid'}>
                          {task.status === 'completed' ? 'Done' : task.status === 'in-progress' ? 'Active' : 'Pending'}
                        </Badge>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          );
        })}

        <Stack direction="horizontal" gap={4} className="justify-end">
          <Button variant="outline"><AlertTriangle size={16} className="mr-2" />Report Damage</Button>
          <Button variant="solid"><CheckCircle size={16} className="mr-2" />Complete Load-Out</Button>
        </Stack>
      </Stack>
    </CompvssAppLayout>
  );
}
