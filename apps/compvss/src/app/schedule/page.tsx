"use client";

import { useState, useEffect, useCallback } from "react";
import { Navigation } from "../../components/navigation";
import {
  H1,
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
} from "@ghxstship/ui";

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

  const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
    switch (status?.toLowerCase()) {
      case 'in_progress':
        return 'solid';
      case 'completed':
        return 'solid';
      case 'scheduled':
        return 'outline';
      default:
        return 'ghost';
    }
  };

  const getProgress = (item: ScheduleItem): number => {
    if (item.status === 'completed') return 100;
    if (item.status === 'in_progress') return 50;
    return 0;
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading schedule..." />
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="py-16">
          <EmptyState
            title="Error Loading Schedule"
            description={error}
            action={{ label: "Retry", onClick: fetchSchedule }}
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="relative min-h-screen bg-black text-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <H1>Production Schedule</H1>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.total || 0}
              label="Total Items"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.by_status?.in_progress || 0}
              label="In Progress"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.by_status?.scheduled || 0}
              label="Scheduled"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.by_status?.completed || 0}
              label="Completed"
              className="bg-black text-white border-grey-800"
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
                <Card key={item.id} className="border-2 border-grey-800 p-6 bg-black">
                  <Stack gap={4}>
                    <Stack gap={2} direction="horizontal" className="justify-between items-start">
                      <Stack gap={2}>
                        <H3 className="text-white">{item.title}</H3>
                        <Body className="font-mono text-sm text-grey-400">
                          {formatTime(item.start_time)} - {formatTime(item.end_time)}
                        </Body>
                      </Stack>
                      <Stack gap={2} className="text-right">
                        <Badge variant={getStatusVariant(item.status)}>
                          {item.status?.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Body className="font-mono text-sm text-grey-400">
                          {item.assignments?.length || 0} crew
                        </Body>
                      </Stack>
                    </Stack>

                    <ProgressBar value={getProgress(item)} variant="inverse" size="lg" />
                    <Body className="font-mono text-xs text-grey-500">
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
  );
}
