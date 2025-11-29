"use client";

import { useState, useEffect, useCallback } from "react";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  H3,
  Body,
  StatCard,
  Badge,
  Card,
  ProgressBar,
  LoadingSpinner,
  EmptyState,
  Container,
  Grid,
  Stack,
  Section,
  PageLayout,
  SectionHeader,
  EnterprisePageHeader,
  MainContent,} from "@ghxstship/ui";
import { getBadgeVariant } from "@ghxstship/config";

interface ScheduleItem {
  id: string;
  title: string;
  type: string;
  start_time: string;
  end_time: string;
  status: string;
  priority: string;
  crew_roles_required?: string[];
  assignments?: Array<{
    id: string;
    crew_member?: { id: string; full_name: string; role: string };
    status: string;
  }>;
}

interface ScheduleSummary {
  total: number;
  by_type: Record<string, number>;
  by_status: {
    scheduled: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [summary, setSummary] = useState<ScheduleSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/schedule');
      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }
      const data = await response.json();
      setSchedule(data.schedule || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusVariant = getBadgeVariant;

  const getProgress = (item: ScheduleItem): number => {
    if (item.status === 'completed') return 100;
    if (item.status === 'in_progress') return 50;
    return 0;
  };

  if (loading) {
    return (
      <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
        <Section className="min-h-screen py-16">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <LoadingSpinner size="lg" text="Loading schedule..." />
          </Container>
        </Section>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
        <Section className="min-h-screen py-16">
          <Container>
            <EmptyState
              title="Error Loading Schedule"
              description={error}
              action={{ label: "Retry", onClick: fetchSchedule }}
            />
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
            <EnterprisePageHeader
        title="Production Schedule"
        subtitle="Manage production timeline and crew assignments"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Schedule' }]}
        views={[
          { id: 'default', label: 'Default', icon: 'grid' },
        ]}
        activeView="default"
        showFavorite
        showSettings
      />

            <Grid cols={4} gap={6}>
              <StatCard
                value={(summary?.total || 0).toString()}
                label="Total Items"
              />
              <StatCard
                value={(summary?.by_status?.in_progress || 0).toString()}
                label="In Progress"
              />
              <StatCard
                value={(summary?.by_status?.scheduled || 0).toString()}
                label="Scheduled"
              />
              <StatCard
                value={(summary?.by_status?.completed || 0).toString()}
                label="Completed"
              />
            </Grid>

            {schedule.length === 0 ? (
              <EmptyState
                title="No Schedule Items"
                description="Create your first schedule item to get started"
                action={{ label: "Add Item", onClick: () => {} }}
              />
            ) : (
              <Stack gap={6}>
                {schedule.map((item) => (
                  <Card key={item.id}>
                    <Stack gap={4}>
                      <Stack gap={2} direction="horizontal" className="items-start justify-between">
                        <Stack gap={2}>
                          <H3>{item.title}</H3>
                          <Body className="font-mono text-body-sm">
                            {formatTime(item.start_time)} - {formatTime(item.end_time)}
                          </Body>
                        </Stack>
                        <Stack gap={2} className="text-right">
                          <Badge variant={getStatusVariant(item.status)}>
                            {item.status?.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Body className="font-mono text-body-sm">
                            {item.assignments?.length || 0} crew
                          </Body>
                        </Stack>
                      </Stack>

                      <ProgressBar value={getProgress(item)} size="lg" />
                      <Body className="font-mono text-body-sm">
                        {getProgress(item)}% complete
                      </Body>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
