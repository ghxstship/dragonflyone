'use client';

import { useState, useEffect, useCallback } from 'react';
import { CreatorNavigationAuthenticated } from '../../components/navigation';
import {
  Container,
  Section,
  H1,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Modal,
  LoadingSpinner,
  StatCard,
} from '@ghxstship/ui';

interface StrategicGoal {
  id: string;
  name: string;
  description: string;
  category: string;
  target_date: string;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  progress: number;
  owner: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
  budget: number;
  aligned_goals: string[];
  alignment_score: number;
}

interface AlignmentMetric {
  goal_id: string;
  goal_name: string;
  aligned_projects: number;
  total_budget_aligned: number;
  average_progress: number;
}

export default function StrategicAlignmentPage() {
  const [goals, setGoals] = useState<StrategicGoal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [metrics, setMetrics] = useState<AlignmentMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAlignModal, setShowAlignModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [goalsRes, projectsRes, metricsRes] = await Promise.all([
        fetch('/api/strategic-goals'),
        fetch('/api/projects?include_alignment=true'),
        fetch('/api/alignment/metrics'),
      ]);

      if (goalsRes.ok) {
        const data = await goalsRes.json();
        setGoals(data.goals || []);
      }

      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data.projects || []);
      }

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data.metrics || []);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAlignProject = async (projectId: string, goalIds: string[]) => {
    try {
      const response = await fetch('/api/alignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, goal_ids: goalIds }),
      });

      if (response.ok) {
        setSuccess('Project alignment updated');
        setShowAlignModal(false);
        fetchData();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update alignment');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      on_track: 'bg-success-500 text-white',
      at_risk: 'bg-warning-500 text-white',
      behind: 'bg-error-500 text-white',
      completed: 'bg-info-500 text-white',
    };
    return <Badge className={variants[status] || ''}>{status.replace('_', ' ').toUpperCase()}</Badge>;
  };

  const getAlignmentScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-success-500 text-white">{score}%</Badge>;
    if (score >= 50) return <Badge className="bg-warning-500 text-white">{score}%</Badge>;
    return <Badge className="bg-error-500 text-white">{score}%</Badge>;
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-ink-950 text-ink-50">
        <CreatorNavigationAuthenticated />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading alignment data..." />
        </Container>
      </Section>
    );
  }

  const overallAlignment = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + (p.alignment_score || 0), 0) / projects.length)
    : 0;

  const alignedProjects = projects.filter(p => (p.aligned_goals?.length || 0) > 0).length;
  const unalignedProjects = projects.length - alignedProjects;
  const goalsOnTrack = goals.filter(g => g.status === 'on_track' || g.status === 'completed').length;

  return (
    <Section className="min-h-screen bg-ink-950 text-ink-50">
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between border-b border-ink-800 pb-8">
            <Stack gap={2}>
              <H1>Strategic Alignment</H1>
              <Body className="text-ink-400">
                Measure how projects align with strategic goals
              </Body>
            </Stack>
            <Button variant="solid" onClick={() => setShowAlignModal(true)}>
              Align Project
            </Button>
          </Stack>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Grid cols={4} gap={6} className="mb-8">
          <StatCard
            label="Overall Alignment"
            value={`${overallAlignment}%`}
            icon={<Body>🎯</Body>}
            trend={overallAlignment >= 70 ? 'up' : 'down'}
            trendValue={overallAlignment >= 70 ? 'Good' : 'Needs attention'}
          />
          <StatCard
            label="Aligned Projects"
            value={alignedProjects}
            icon={<Body>✅</Body>}
          />
          <StatCard
            label="Unaligned Projects"
            value={unalignedProjects}
            icon={<Body>⚠️</Body>}
            trend={unalignedProjects > 0 ? 'down' : 'neutral'}
            trendValue={unalignedProjects > 0 ? 'Action needed' : 'All aligned'}
          />
          <StatCard
            label="Goals On Track"
            value={`${goalsOnTrack}/${goals.length}`}
            icon={<Body>📊</Body>}
          />
        </Grid>

        <Grid cols={2} gap={8}>
          <Stack gap={6}>
            <H2>STRATEGIC GOALS</H2>
            {goals.length > 0 ? (
              <Stack gap={4}>
                {goals.map(goal => (
                  <Card key={goal.id} className="p-6">
                    <Stack direction="horizontal" className="justify-between items-start mb-4">
                      <Stack gap={1}>
                        <H3>{goal.name}</H3>
                        <Body className="text-ink-600 text-body-sm">{goal.description}</Body>
                      </Stack>
                      {getStatusBadge(goal.status)}
                    </Stack>
                    <Stack gap={2}>
                      <Stack direction="horizontal" className="justify-between">
                        <Label className="text-ink-500">Progress</Label>
                        <Body className="font-bold">{goal.progress}%</Body>
                      </Stack>
                      <Stack className="h-2 bg-ink-200 rounded-full overflow-hidden">
                        <Stack
                          className="h-full bg-black transition-all"
                          style={{ '--progress-width': `${goal.progress}%`, width: 'var(--progress-width)' } as React.CSSProperties}
                        />
                      </Stack>
                      <Stack direction="horizontal" className="justify-between mt-2">
                        <Body className="text-mono-xs text-ink-500">
                          Owner: {goal.owner}
                        </Body>
                        <Body className="text-mono-xs text-ink-500">
                          Target: {new Date(goal.target_date).toLocaleDateString()}
                        </Body>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Card className="p-8 text-center">
                <Body className="text-ink-600">No strategic goals defined</Body>
              </Card>
            )}
          </Stack>

          <Stack gap={6}>
            <H2>PROJECT ALIGNMENT</H2>
            {projects.length > 0 ? (
              <Stack gap={4}>
                {projects.map(project => (
                  <Card key={project.id} className="p-6">
                    <Stack direction="horizontal" className="justify-between items-start mb-4">
                      <Stack gap={1}>
                        <H3>{project.name}</H3>
                        <Body className="text-ink-600 text-body-sm">
                          Budget: ${project.budget?.toLocaleString() || 0}
                        </Body>
                      </Stack>
                      {getAlignmentScoreBadge(project.alignment_score || 0)}
                    </Stack>
                    <Stack gap={2}>
                      <Label className="text-ink-500">Aligned Goals</Label>
                      {project.aligned_goals && project.aligned_goals.length > 0 ? (
                        <Stack direction="horizontal" gap={2} className="flex-wrap">
                          {project.aligned_goals.map(goalId => {
                            const goal = goals.find(g => g.id === goalId);
                            return goal ? (
                              <Badge key={goalId} variant="outline">
                                {goal.name}
                              </Badge>
                            ) : null;
                          })}
                        </Stack>
                      ) : (
                        <Body className="text-body-sm text-ink-400">No goals aligned</Body>
                      )}
                    </Stack>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        setSelectedProject(project);
                        setShowAlignModal(true);
                      }}
                    >
                      Edit Alignment
                    </Button>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Card className="p-8 text-center">
                <Body className="text-ink-600">No projects found</Body>
              </Card>
            )}
          </Stack>
        </Grid>

        {metrics.length > 0 && (
          <Section className="mt-12">
            <H2 className="mb-6">ALIGNMENT METRICS BY GOAL</H2>
            <Grid cols={3} gap={6}>
              {metrics.map(metric => (
                <Card key={metric.goal_id} className="p-6">
                  <H3 className="mb-4">{metric.goal_name}</H3>
                  <Stack gap={3}>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-ink-600">Aligned Projects</Body>
                      <Body className="font-bold">{metric.aligned_projects}</Body>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-ink-600">Budget Aligned</Body>
                      <Body className="font-bold">${metric.total_budget_aligned?.toLocaleString()}</Body>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-ink-600">Avg Progress</Body>
                      <Body className="font-bold">{metric.average_progress}%</Body>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Section>
        )}

        <Modal
          open={showAlignModal}
          onClose={() => {
            setShowAlignModal(false);
            setSelectedProject(null);
          }}
          title={selectedProject ? `Align: ${selectedProject.name}` : 'Align Project to Goals'}
        >
          <Stack gap={4}>
            {!selectedProject && (
              <Field label="Select Project">
                <Select
                  value=""
                  onChange={(e) => {
                    const project = projects.find(p => p.id === e.target.value);
                    setSelectedProject(project || null);
                  }}
                >
                  <option value="">Choose a project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
              </Field>
            )}

            {selectedProject && (
              <Stack gap={4}>
                <Body>Select strategic goals this project supports:</Body>
                <Stack gap={2}>
                  {goals.map(goal => (
                    <Card
                      key={goal.id}
                      className={`p-4 cursor-pointer border-2 transition-colors ${
                        selectedProject.aligned_goals?.includes(goal.id)
                          ? 'border-black bg-ink-50'
                          : 'border-ink-200 hover:border-ink-400'
                      }`}
                      onClick={() => {
                        const currentGoals = selectedProject.aligned_goals || [];
                        const newGoals = currentGoals.includes(goal.id)
                          ? currentGoals.filter(g => g !== goal.id)
                          : [...currentGoals, goal.id];
                        setSelectedProject({ ...selectedProject, aligned_goals: newGoals });
                      }}
                    >
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Stack gap={1}>
                          <Body className="font-bold">{goal.name}</Body>
                          <Body className="text-body-sm text-ink-600">{goal.category}</Body>
                        </Stack>
                        {selectedProject.aligned_goals?.includes(goal.id) && (
                          <Badge className="bg-black text-white">Selected</Badge>
                        )}
                      </Stack>
                    </Card>
                  ))}
                </Stack>

                <Stack direction="horizontal" gap={4}>
                  <Button
                    variant="solid"
                    onClick={() => handleAlignProject(selectedProject.id, selectedProject.aligned_goals || [])}
                  >
                    Save Alignment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAlignModal(false);
                      setSelectedProject(null);
                    }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            )}
          </Stack>
        </Modal>
        </Stack>
      </Container>
    </Section>
  );
}
