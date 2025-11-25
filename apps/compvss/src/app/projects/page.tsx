'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Display, H2, H3, Body, Button, Card, Badge, Grid, Stack, Container, LoadingSpinner } from '@ghxstship/ui';
import { useProjects } from '../../hooks/useProjects';

export default function ProjectsPage() {
  const router = useRouter();
  const [filterPhase, setFilterPhase] = useState('all');
  const [userRole] = useState('COMPVSS_ADMIN');
  
  const { data: projects, isLoading } = useProjects({
    status: filterPhase !== 'all' ? filterPhase as any : undefined
  });

  const filteredProjects = projects || [];
  const canCreateProject = userRole === 'COMPVSS_ADMIN';
  const totalBudget = (projects || []).reduce((sum: number, p: any) => sum + (p.budget || 0), 0);

  if (isLoading) {
    return (
      <Container className="flex min-h-screen items-center justify-center bg-white">
        <LoadingSpinner size="lg" text="Loading projects..." />
      </Container>
    );
  }

  return (
    <Container className="min-h-screen bg-white py-8">
      <Stack gap={8}>
        <Stack gap={4} className="border-b-2 border-black pb-8">
          <Stack gap={4} direction="horizontal" className="justify-between items-start">
            <Stack gap={2}>
              <Display>PRODUCTION PROJECTS</Display>
              <Body>Manage events and production workflows</Body>
            </Stack>
            {canCreateProject && (
              <Button variant="solid" onClick={() => router.push('/projects/new')}>
                New Project
              </Button>
            )}
          </Stack>
        </Stack>

        <Grid cols={3} className="mb-8">
          <Card className="p-6 text-center">
            <H2>{filteredProjects.length}</H2>
            <Body>Total Projects</Body>
          </Card>
          <Card className="p-6 text-center">
            <H2>${(totalBudget / 1000000).toFixed(1)}M</H2>
            <Body>Total Budget</Body>
          </Card>
          <Card className="p-6 text-center">
            <H2>{filteredProjects.filter((p: any) => p.status === 'active').length}</H2>
            <Body>Active Projects</Body>
          </Card>
        </Grid>

        <Stack gap={4} direction="horizontal">
          <Button 
            variant={filterPhase === 'all' ? 'solid' : 'outline'}
            onClick={() => setFilterPhase('all')}
          >
            All
          </Button>
          <Button 
            variant={filterPhase === 'planning' ? 'solid' : 'outline'}
            onClick={() => setFilterPhase('planning')}
          >
            Planning
          </Button>
          <Button 
            variant={filterPhase === 'active' ? 'solid' : 'outline'}
            onClick={() => setFilterPhase('active')}
          >
            Active
          </Button>
          <Button 
            variant={filterPhase === 'completed' ? 'solid' : 'outline'}
            onClick={() => setFilterPhase('completed')}
          >
            Completed
          </Button>
        </Stack>

        <Stack gap={4}>
          {filteredProjects.map(project => (
            <Card key={project.id} className="p-6">
              <Stack gap={4} direction="horizontal" className="justify-between items-start">
                <Stack gap={2} className="flex-1">
                  <Stack gap={4} direction="horizontal" className="items-center">
                    <H3 className="text-xl font-bold uppercase">{project.name}</H3>
                    <Badge>{project.code}</Badge>
                    <Badge>{project.phase}</Badge>
                  </Stack>
                  <Body>Budget: ${project.budget?.toLocaleString()}</Body>
                  {project.crew_count !== undefined && (
                    <Body>Crew: {project.crew_count} assigned</Body>
                  )}
                  {project.start_date && (
                    <Body className="text-sm">
                      Start: {new Date(project.start_date).toLocaleDateString()}
                    </Body>
                  )}
                  {project.event_date && (
                    <Body className="text-sm">
                      Event: {new Date(project.event_date).toLocaleDateString()}
                    </Body>
                  )}
                </Stack>
                <Stack gap={2} direction="horizontal">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    View Details
                  </Button>
                  {canCreateProject && (
                    <Button 
                      variant="solid" 
                      size="sm"
                      onClick={() => router.push(`/crew/assign?projectId=${project.id}`)}
                    >
                      Assign Crew
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Card>
          ))}
          {filteredProjects.length === 0 && <Body>No projects found</Body>}
        </Stack>
      </Stack>
    </Container>
  );
}
