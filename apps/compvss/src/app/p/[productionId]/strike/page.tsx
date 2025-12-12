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
  Hammer,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { CompvssAppLayout } from '../../../../components/app-layout';
import { log } from '@ghxstship/config';

interface StrikeTask {
  id: string;
  area: string;
  task: string;
  crew: string;
  status: 'pending' | 'in-progress' | 'completed';
}

const STRIKE_TASKS: StrikeTask[] = [
  { id: '1', area: 'Main Stage', task: 'Remove all set pieces', crew: 'Set Crew', status: 'completed' },
  { id: '2', area: 'Main Stage', task: 'Strike soft goods', crew: 'Fly Crew', status: 'completed' },
  { id: '3', area: 'Backstage', task: 'Clear dressing rooms', crew: 'Wardrobe', status: 'in-progress' },
  { id: '4', area: 'FOH', task: 'Remove FOH equipment', crew: 'Audio/Video', status: 'in-progress' },
  { id: '5', area: 'Lobby', task: 'Strike merchandise displays', crew: 'Merch Team', status: 'pending' },
  { id: '6', area: 'Exterior', task: 'Remove signage', crew: 'Marketing', status: 'pending' },
  { id: '7', area: 'Loading Dock', task: 'Load trucks', crew: 'Loaders', status: 'pending' },
  { id: '8', area: 'All Areas', task: 'Final walkthrough', crew: 'PM', status: 'pending' },
];

export default function ProductionStrikePage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const [tasks, setTasks] = useState<StrikeTask[]>(STRIKE_TASKS);

  const fetchTasks = useCallback(async () => {
    if (!productionId) return;
    try {
      const response = await fetch(`/api/productions/${productionId}/strike`);
      if (response.ok) {
        const data = await response.json();
        if (data.tasks && data.tasks.length > 0) {
          setTasks(data.tasks);
        }
      }
    } catch (error) {
      log.error('Failed to fetch strike tasks:', error instanceof Error ? error : undefined);
    }
  }, [productionId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;
      const newStatus = task.status === 'completed' ? 'pending' : 
                        task.status === 'in-progress' ? 'completed' : 'in-progress';
      return { ...task, status: newStatus };
    }));
  };

  const areas = Array.from(new Set(tasks.map(t => t.area)));

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <SectionHeader kicker="Production" title="Strike Checklist" description="Track strike progress and completion" colorScheme="on-dark" />

        <Grid cols={4} gap={4}>
          <StatCard label="Total Tasks" value={tasks.length.toString()} icon={<Package size={20} />} inverted />
          <StatCard label="Completed" value={completedCount.toString()} icon={<CheckCircle size={20} />} trend="up" inverted />
          <StatCard label="In Progress" value={tasks.filter(t => t.status === 'in-progress').length.toString()} icon={<Clock size={20} />} inverted />
          <StatCard label="Progress" value={`${progress}%`} icon={<ProgressBar value={progress} />} inverted />
        </Grid>

        {areas.map(area => {
          const areaTasks = tasks.filter(t => t.area === area);
          const areaCompleted = areaTasks.filter(t => t.status === 'completed').length;
          
          return (
            <Card key={area} variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <Stack direction="horizontal" className="items-center justify-between">
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <Hammer size={20} />
                      <H3 className="text-white">{area}</H3>
                    </Stack>
                    <Badge variant={areaCompleted === areaTasks.length ? 'success' : 'warning'}>
                      {areaCompleted}/{areaTasks.length}
                    </Badge>
                  </Stack>
                  <Stack gap={2}>
                    {areaTasks.map(task => (
                      <Stack
                        key={task.id}
                        direction="horizontal"
                        className="cursor-pointer items-center justify-between rounded border-2 border-ink-700 p-3"
                        onClick={() => toggleTask(task.id)}
                      >
                        <Stack direction="horizontal" gap={3} className="items-center">
                          <Checkbox checked={task.status === 'completed'} onChange={() => toggleTask(task.id)} />
                          <Stack gap={0}>
                            <Body className={task.status === 'completed' ? 'text-on-dark-muted line-through' : 'text-white'}>{task.task}</Body>
                            <Body size="sm" className=" text-on-dark-muted">{task.crew}</Body>
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
          <Button variant="outline"><AlertTriangle size={16} className="mr-2" />Report Issue</Button>
          <Button variant="solid" disabled={progress < 100}><CheckCircle size={16} className="mr-2" />Complete Strike</Button>
        </Stack>
      </Stack>
    </CompvssAppLayout>
  );
}
