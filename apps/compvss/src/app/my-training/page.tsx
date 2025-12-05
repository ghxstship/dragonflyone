'use client';

import { useState } from 'react';
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
  ProgressBar,
} from '@ghxstship/ui';
import {
  GraduationCap,
  CheckCircle,
  Clock,
  Play,
  Award,
} from 'lucide-react';
import { CompvssAppLayout } from '../../components/app-layout';

interface TrainingModule {
  id: string;
  name: string;
  category: string;
  duration: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  dueDate?: string;
  completedDate?: string;
  required: boolean;
}

const mockTraining: TrainingModule[] = [
  {
    id: '1',
    name: 'Workplace Safety Fundamentals',
    category: 'Safety',
    duration: '2 hours',
    progress: 100,
    status: 'completed',
    completedDate: '2024-11-15',
    required: true,
  },
  {
    id: '2',
    name: 'Fire Safety and Emergency Procedures',
    category: 'Safety',
    duration: '1 hour',
    progress: 60,
    status: 'in_progress',
    dueDate: '2024-12-31',
    required: true,
  },
  {
    id: '3',
    name: 'Rigging Safety Awareness',
    category: 'Technical',
    duration: '3 hours',
    progress: 0,
    status: 'not_started',
    dueDate: '2025-01-15',
    required: true,
  },
  {
    id: '4',
    name: 'Customer Service Excellence',
    category: 'Soft Skills',
    duration: '1.5 hours',
    progress: 100,
    status: 'completed',
    completedDate: '2024-10-20',
    required: false,
  },
  {
    id: '5',
    name: 'Equipment Handling Best Practices',
    category: 'Technical',
    duration: '2 hours',
    progress: 25,
    status: 'in_progress',
    dueDate: '2025-01-01',
    required: false,
  },
];

export default function MyTrainingPage() {
  const [training] = useState(mockTraining);

  const completedCount = training.filter(t => t.status === 'completed').length;
  const inProgressCount = training.filter(t => t.status === 'in_progress').length;
  const notStartedCount = training.filter(t => t.status === 'not_started').length;
  const requiredPending = training.filter(t => t.required && t.status !== 'completed').length;

  const getStatusBadge = (status: TrainingModule['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'not_started':
        return <Badge variant="info">Not Started</Badge>;
    }
  };

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Crew Portal"
          title="My Training"
          description="Complete required training modules and track your progress"
          colorScheme="on-dark"
        />

        <Grid cols={4} gap={4}>
          <StatCard
            label="Completed"
            value={completedCount.toString()}
            icon={<CheckCircle size={20} />}
            inverted
          />
          <StatCard
            label="In Progress"
            value={inProgressCount.toString()}
            icon={<Clock size={20} />}
            inverted
          />
          <StatCard
            label="Not Started"
            value={notStartedCount.toString()}
            icon={<GraduationCap size={20} />}
            inverted
          />
          <StatCard
            label="Required Pending"
            value={requiredPending.toString()}
            icon={<Award size={20} />}
            inverted
          />
        </Grid>

        <Stack gap={4}>
          {training.map(module => (
            <Card key={module.id} inverted>
              <CardBody>
                <Stack gap={4}>
                  <Stack direction="horizontal" className="items-start justify-between">
                    <Stack gap={2}>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <H3 className="text-white">{module.name}</H3>
                        {module.required && <Badge variant="error">Required</Badge>}
                        {getStatusBadge(module.status)}
                      </Stack>
                      <Stack direction="horizontal" gap={4}>
                        <Body className="text-on-dark-muted">{module.category}</Body>
                        <Body className="text-on-dark-muted">{module.duration}</Body>
                        {module.dueDate && (
                          <Body className="text-on-dark-muted">
                            Due: {new Date(module.dueDate).toLocaleDateString()}
                          </Body>
                        )}
                        {module.completedDate && (
                          <Body className="text-on-dark-muted">
                            Completed: {new Date(module.completedDate).toLocaleDateString()}
                          </Body>
                        )}
                      </Stack>
                    </Stack>

                    {module.status !== 'completed' && (
                      <Button variant={module.status === 'in_progress' ? 'solid' : 'outline'}>
                        <Play size={16} className="mr-2" />
                        {module.status === 'in_progress' ? 'Continue' : 'Start'}
                      </Button>
                    )}
                  </Stack>

                  {module.status !== 'not_started' && (
                    <Stack gap={2}>
                      <Stack direction="horizontal" className="items-center justify-between">
                        <Body className="text-body-sm text-on-dark-muted">Progress</Body>
                        <Body className="text-body-sm text-white">{module.progress}%</Body>
                      </Stack>
                      <ProgressBar value={module.progress} max={100} />
                    </Stack>
                  )}
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Stack>
      </Stack>
    </CompvssAppLayout>
  );
}
