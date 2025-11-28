'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../components/navigation';
import { H3, Body, Button, Card, Badge, Grid, Stack, Container, LoadingSpinner, Section, PageLayout, SectionHeader, StatCard } from '@ghxstship/ui';
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
      <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
        <Section className="min-h-screen py-16">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <LoadingSpinner size="lg" text="Loading projects..." />
          </Container>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <Stack direction="horizontal" className="items-start justify-between">
              <SectionHeader
                kicker="COMPVSS"
                title="Production Projects"
                description="Manage events and production workflows"
                colorScheme="on-light"
                gap="lg"
              />
              {canCreateProject && (
                <Button variant="solid" onClick={() => router.push('/projects/new')}>
                  New Project
                </Button>
              )}
            </Stack>

            <Grid cols={3} gap={6}>
              <StatCard value={filteredProjects.length.toString()} label="Total Projects" />
              <StatCard value={`$${(totalBudget / 1000000).toFixed(1)}M`} label="Total Budget" />
              <StatCard value={filteredProjects.filter((p: any) => p.status === 'active').length.toString()} label="Active Projects" />
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
                  <Stack gap={4} direction="horizontal" className="items-start justify-between">
                    <Stack gap={2} className="flex-1">
                      <Stack gap={4} direction="horizontal" className="items-center">
                        <H3 className="font-display uppercase">{project.name}</H3>
                        <Badge>{project.code}</Badge>
                        <Badge>{project.phase}</Badge>
                      </Stack>
                      <Body>Budget: ${project.budget?.toLocaleString()}</Body>
                      {project.crew_count !== undefined && (
                        <Body>Crew: {project.crew_count} assigned</Body>
                      )}
                      {project.start_date && (
                        <Body className="text-body-sm">
                          Start: {new Date(project.start_date).toLocaleDateString()}
                        </Body>
                      )}
                      {project.event_date && (
                        <Body className="text-body-sm">
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
      </Section>
    </PageLayout>
  );
}
