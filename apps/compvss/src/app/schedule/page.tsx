"use client";

import { CompvssAppLayout } from "../../components/app-layout";
import {
  H3,
  Body,
  StatCard,
  Badge,
  Card,
  ProgressBar,
  Spinner,
  EmptyState,
  Container,
  Grid,
  Stack,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";
import { getBadgeVariant } from "@ghxstship/config";
import { useSchedulePageData, type ScheduleItem } from "@/hooks/useSchedule";

export default function SchedulePage() {
  const {
    items: schedule,
    summary,
    isLoading: loading,
    error,
  } = useSchedulePageData();

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
      <CompvssAppLayout>
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <Spinner variant="grey" size="lg" text="Loading schedule..." />
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  if (error) {
    return (
      <CompvssAppLayout>
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Error Loading Schedule"
              description={error instanceof Error ? error.message : String(error)}
              action={{ label: "Retry", onClick: () => window.location.reload() }}
            />
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Production Schedule"
        subtitle="Manage production timeline and crew assignments"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

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
      </MainContent>
    </CompvssAppLayout>
  );
}
