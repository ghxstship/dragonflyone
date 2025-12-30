"use client";

/**
 * Production Schedule Page
 * Production timeline and tasks
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, Plus, Clock, CheckCircle, AlertCircle, List, LayoutGrid } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge, Body, Button, Card, Grid, StatCard, DetailPage, Section, SectionHeader} from "@ghxstship/ui";

interface Task {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed";
  due_date: string;
  assignee: string;
  priority: "low" | "medium" | "high";
}

const DEMO_TASKS: Task[] = [
  { id: "1", title: "Venue walkthrough", status: "completed", due_date: "2024-12-10", assignee: "John Smith", priority: "high" },
  { id: "2", title: "Stage design approval", status: "completed", due_date: "2024-12-12", assignee: "Sarah Williams", priority: "high" },
  { id: "3", title: "Vendor contracts signed", status: "in_progress", due_date: "2024-12-15", assignee: "Mike Johnson", priority: "medium" },
  { id: "4", title: "Equipment delivery", status: "pending", due_date: "2024-12-18", assignee: "Emily Davis", priority: "high" },
  { id: "5", title: "Sound check", status: "pending", due_date: "2024-12-20", assignee: "John Smith", priority: "medium" },
  { id: "6", title: "Dress rehearsal", status: "pending", due_date: "2024-12-21", assignee: "Sarah Williams", priority: "high" },
];

const STATUS_CONFIG = {
  pending: { label: "Pending", variant: "warning" as const, icon: <Clock className="size-4" /> },
  in_progress: { label: "In Progress", variant: "info" as const, icon: <AlertCircle className="size-4" /> },
  completed: { label: "Completed", variant: "success" as const, icon: <CheckCircle className="size-4" /> },
};

const PRIORITY_CONFIG = {
  low: { label: "Low", variant: "outline" as const },
  medium: { label: "Medium", variant: "warning" as const },
  high: { label: "High", variant: "error" as const },
};

export default function ProductionSchedulePage() {
  const params = useParams();
  const productionId = params.productionId as string;
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: tasks = [], isLoading, error, refetch } = useQuery({
    queryKey: ["production-tasks", productionId],
    queryFn: async () => {
      const response = await fetch(`/api/productions/${productionId}/tasks`);
      if (!response.ok) return DEMO_TASKS;
      const data = await response.json();
      return data.tasks?.length ? data.tasks : DEMO_TASKS;
    },
  });

  const filteredTasks = statusFilter === "all" ? tasks : tasks.filter((t: Task) => t.status === statusFilter);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t: Task) => t.status === "completed").length,
    inProgress: tasks.filter((t: Task) => t.status === "in_progress").length,
    pending: tasks.filter((t: Task) => t.status === "pending").length,
  };

  const tabs = [
    {
      id: "list",
      label: "List View",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
            <StatCard label="Total Tasks" value={stats.total.toString()} icon={<Calendar className="size-5" />} />
            <StatCard label="Completed" value={stats.completed.toString()} icon={<CheckCircle className="size-5" />} />
            <StatCard label="In Progress" value={stats.inProgress.toString()} icon={<AlertCircle className="size-5" />} />
            <StatCard label="Pending" value={stats.pending.toString()} icon={<Clock className="size-5" />} />
          </Grid>

          <div className="flex gap-2 mb-6">
            {["all", "pending", "in_progress", "completed"].map((status) => (
              <Button key={status} variant={statusFilter === status ? "solid" : "outline"} size="sm" onClick={() => setStatusFilter(status)}>
                {status === "all" ? "All" : STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].label}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredTasks.map((task: Task) => {
              const statusConfig = STATUS_CONFIG[task.status];
              const priorityConfig = PRIORITY_CONFIG[task.priority];
              return (
                <Card key={task.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-card ${task.status === "completed" ? "bg-success/20" : "bg-grey-800"}`}>
                        {statusConfig.icon}
                      </div>
                      <div>
                        <Body className="font-weight-medium">{task.title}</Body>
                        <Body size="sm" className="text-on-dark-muted">{task.assignee} • Due {formatDate(task.due_date)}</Body>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={priorityConfig.variant}>{priorityConfig.label}</Badge>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>
      ),
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: <LayoutGrid className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Calendar View" description="View tasks on a calendar" />
          <Card className="p-8 text-center mt-4">
            <Calendar className="size-12 text-on-dark-disabled mx-auto mb-4" />
            <Body className="font-weight-medium font-weight-medium mb-2">Calendar View</Body>
            <Body className="text-on-dark-muted">Calendar visualization coming soon</Body>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Production",
        title: "Schedule",
        description: "Manage production timeline and tasks",
      }}
      backButton={{ label: "Overview", href: `/p/${productionId}/overview` }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
      actions={<Button variant="solid" icon={<Plus className="size-4" />} iconPosition="left">Add Task</Button>}
    />
  );
}
