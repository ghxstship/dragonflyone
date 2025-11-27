'use client';

import { useState } from 'react';
import { Grid, Stack, Card, CardHeader, CardBody, H4, Body, Label, Badge } from '@ghxstship/ui';

interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
}

interface TaskBoardProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export function TaskBoard({ tasks, onUpdateTask: _onUpdateTask }: TaskBoardProps) {
  const [selectedTask, _setSelectedTask] = useState<Task | null>(null);

  const columns = {
    todo: tasks.filter(t => t.status === 'todo'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    done: tasks.filter(t => t.status === 'done'),
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-black';
      case 'medium': return 'border-l-4 border-l-ink-600';
      case 'low': return 'border-l-4 border-l-ink-400';
      default: return '';
    }
  };

  return (
    <Grid cols={3} gap={6}>
      {Object.entries(columns).map(([status, columnTasks]) => (
        <Card key={status}>
          <CardHeader className="bg-black">
            <H4 className="text-white uppercase">
              {status.replace('-', ' ')} ({columnTasks.length})
            </H4>
          </CardHeader>
          <CardBody>
            <Stack gap={3}>
              {columnTasks.map(task => (
                <Stack
                  key={task.id}
                  className={`cursor-pointer border-2 border-ink-300 p-spacing-4 hover:border-black transition-colors ${getPriorityBorder(task.priority)}`}
                  onClick={() => _setSelectedTask(task)}
                  gap={2}
                >
                  <H4>{task.title}</H4>
                  <Body className="text-body-sm text-ink-600">
                    Assigned to: {task.assignee}
                  </Body>
                  <Badge variant="outline" size="sm" className="self-start">
                    {task.priority}
                  </Badge>
                </Stack>
              ))}
            </Stack>
          </CardBody>
        </Card>
      ))}
    </Grid>
  );
}
