'use client';

import {
  EnterprisePageHeader,
  MainContent,
  Container,
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
  useMyTraining,
  type TrainingModule,
} from '../../../hooks/useMyTraining';
import {
  GraduationCap,
  CheckCircle,
  Clock,
  Play,
  Award,
} from 'lucide-react';
// Layout provided by route group



export default function MyTrainingPage() {
  const { data: training = [], isLoading, error } = useMyTraining();

  if (isLoading) {
    return (
      <>
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <Stack gap={4} className="items-center">
              <div className="h-8 w-8 animate-spin rounded-avatar border-4 border-primary border-t-transparent" />
              <Body>Loading training modules...</Body>
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
                <Body className="text-destructive font-display">Failed to load training modules</Body>
                <Body className="text-destructive">{error instanceof Error ? error.message : 'An error occurred'}</Body>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
              </Stack>
            </Card>
          </Container>
        </MainContent>
      </>
    );
  }

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
    <>
      <EnterprisePageHeader
        title="My Training"
        subtitle="Complete required training modules and track your progress"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={8}>
            <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
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
                        <Body size="sm" className=" text-on-dark-muted">Progress</Body>
                        <Body size="sm" className=" text-white">{module.progress}%</Body>
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
        </Container>
      </MainContent>
    </>
  );
}
