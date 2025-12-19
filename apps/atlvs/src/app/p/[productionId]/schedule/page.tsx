"use client";

import { useParams, useRouter } from "next/navigation";
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
  Box,
  H3,
  Spinner,
  EmptyState,
} from "@ghxstship/ui";
import {
  Calendar,
  CheckSquare,
  Clock,
  AlertTriangle,
  FileText,
  Plus,
  ListOrdered,
  RefreshCw,
} from "lucide-react";
import { useProduction } from "../../../../hooks/useProductions";
import { useTasks, useTaskStats } from "../../../../hooks/useTasks";
import { atlvsDemoProductions } from "../../../../data/atlvs";

/**
 * Production Schedule Page
 * Schedule management for a specific production
 */
export default function ProductionSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;

  // Fetch production from API
  const { data: apiProduction, isLoading: productionLoading, error: productionError, refetch: refetchProduction } = useProduction(productionId);
  const demoProduction = atlvsDemoProductions.find((p) => p.id === productionId);
  const productionName = apiProduction?.title || demoProduction?.name || "Production";

  // Fetch tasks from API
  const { data: apiTasks, isLoading: tasksLoading } = useTasks({ productionId });
  const { data: taskStats } = useTaskStats(productionId);

  if (productionLoading || tasksLoading) {
    return (
      <Stack className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
        <Body className="text-on-dark-muted">Loading schedule...</Body>
      </Stack>
    );
  }

  if (productionError && !demoProduction) {
    return (
      <EmptyState
        icon={<RefreshCw size={48} />}
        title="Failed to load production"
        description={productionError.message}
        action={{ label: "Retry", onClick: () => refetchProduction() }}
      />
    );
  }

  // Use API stats if available, otherwise fallback to demo values
  const scheduleStats = {
    totalTasks: taskStats?.total ?? 48,
    completed: taskStats?.completed ?? 32,
    inProgress: taskStats?.inProgress ?? 12,
    overdue: taskStats?.blocked ?? 4,
    upcoming: 8,
  };

  // Use API tasks if available, otherwise fallback to demo
  const upcomingTasks = apiTasks && apiTasks.length > 0 
    ? apiTasks.slice(0, 5).map(t => ({
        id: t.id,
        title: t.title,
        dueDate: t.due_date || "",
        priority: t.priority,
        status: t.status,
      }))
    : [
        { id: "1", title: "Stage setup walkthrough", dueDate: "2025-06-14", priority: "high", status: "pending" },
        { id: "2", title: "Audio equipment check", dueDate: "2025-06-14", priority: "critical", status: "in_progress" },
        { id: "3", title: "Lighting rig inspection", dueDate: "2025-06-15", priority: "high", status: "pending" },
        { id: "4", title: "Catering coordination", dueDate: "2025-06-15", priority: "medium", status: "pending" },
        { id: "5", title: "Security briefing", dueDate: "2025-06-15", priority: "high", status: "pending" },
      ];

  const priorityColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    critical: "error",
    high: "warning",
    medium: "info",
    low: "solid",
  };

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    completed: "success",
    in_progress: "warning",
    pending: "solid",
    blocked: "error",
  };

  return (
    <Stack gap={8}>
      {/* Header */}
      <Stack gap={4}>
        <SectionHeader
          kicker={productionName}
          title="Schedule"
          description="Manage tasks, timelines, and contingencies for this production"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button
            variant="solid"
            size="sm"
            onClick={() => router.push(`/p/${productionId}/schedule/tasks/new`)}
          >
            <Plus size={16} className="mr-2" />
            New Task
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/p/${productionId}/schedule/templates`)}
          >
            <FileText size={16} className="mr-2" />
            Templates
          </Button>
        </Stack>
      </Stack>

      {/* Key Metrics */}
      <Grid cols={1} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Tasks"
          value={scheduleStats.totalTasks.toString()}
          icon={<CheckSquare size={20} />}
          inverted
        />
        <StatCard
          label="In Progress"
          value={scheduleStats.inProgress.toString()}
          icon={<Clock size={20} />}
          trend="neutral"
          trendValue={`${scheduleStats.completed} completed`}
          inverted
        />
        <StatCard
          label="Overdue"
          value={scheduleStats.overdue.toString()}
          icon={<AlertTriangle size={20} />}
          trend={scheduleStats.overdue > 0 ? "down" : "up"}
          trendValue="Needs attention"
          inverted
        />
        <StatCard
          label="Upcoming"
          value={scheduleStats.upcoming.toString()}
          icon={<Calendar size={20} />}
          trend="neutral"
          trendValue="Next 7 days"
          inverted
        />
      </Grid>

      {/* Quick Navigation */}
      <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
        <Card
          variant="elevated"
          inverted
          className="cursor-pointer transition-all hover:border-primary"
          onClick={() => router.push(`/p/${productionId}/schedule/tasks`)}
        >
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <CheckSquare size={24} className="text-primary" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Tasks</Body>
                <Body size="sm" className=" text-on-dark-muted">{scheduleStats.totalTasks} total</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card
          variant="elevated"
          inverted
          className="cursor-pointer transition-all hover:border-primary"
          onClick={() => router.push(`/p/${productionId}/schedule/contingencies`)}
        >
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <AlertTriangle size={24} className="text-warning" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Contingencies</Body>
                <Body size="sm" className=" text-on-dark-muted">Backup plans</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card
          variant="elevated"
          inverted
          className="cursor-pointer transition-all hover:border-primary"
          onClick={() => router.push(`/p/${productionId}/schedule/templates`)}
        >
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <FileText size={24} className="text-secondary" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Templates</Body>
                <Body size="sm" className=" text-on-dark-muted">Reusable tasks</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card
          variant="elevated"
          inverted
          className="cursor-pointer transition-all hover:border-primary"
          onClick={() => router.push(`/p/${productionId}/shows/run-of-show`)}
        >
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <ListOrdered size={24} className="text-accent" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Run of Show</Body>
                <Body size="sm" className=" text-on-dark-muted">Event timeline</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      {/* Upcoming Tasks */}
      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <Stack direction="horizontal" className="items-center justify-between">
              <H3 className="text-white">Upcoming Tasks</H3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/p/${productionId}/schedule/tasks`)}
              >
                View All
              </Button>
            </Stack>
            <Stack gap={3}>
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex cursor-pointer items-center justify-between rounded border-2 border-ink-700 p-3 transition-all hover:border-ink-600 hover:bg-ink-800/50"
                  onClick={() => router.push(`/p/${productionId}/schedule/tasks/${task.id}`)}
                >
                  <Stack gap={1}>
                    <Body className="font-weight-medium text-white">{task.title}</Body>
                    <Body size="sm" className=" text-on-dark-muted">
                      Due: {new Date(task.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Body>
                  </Stack>
                  <Stack direction="horizontal" gap={2}>
                    <Badge variant={priorityColors[task.priority] || "solid"}>
                      {task.priority.toUpperCase()}
                    </Badge>
                    <Badge variant={statusColors[task.status] || "solid"}>
                      {task.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </Stack>
                </div>
              ))}
            </Stack>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
