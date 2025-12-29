"use client";

/**
 * Production Schedule Page
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, Clock, CheckCircle, Plus, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Body,
  Button,
  Card,
  Grid,
  StatCard,
  DetailPage,
  Section,
} from "@ghxstship/ui";

interface ScheduleItem {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "rehearsal" | "setup" | "show" | "meeting";
  status: "scheduled" | "in_progress" | "completed";
}

const DEMO_SCHEDULE: ScheduleItem[] = [
  { id: "1", title: "Tech Rehearsal", date: "2024-12-18", time: "10:00", type: "rehearsal", status: "scheduled" },
  { id: "2", title: "Load-in", date: "2024-12-19", time: "08:00", type: "setup", status: "scheduled" },
  { id: "3", title: "Opening Night", date: "2024-12-20", time: "19:00", type: "show", status: "scheduled" },
];

const TYPE_CONFIG = {
  rehearsal: { label: "Rehearsal", variant: "info" as const },
  setup: { label: "Setup", variant: "warning" as const },
  show: { label: "Show", variant: "success" as const },
  meeting: { label: "Meeting", variant: "outline" as const },
};

const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", variant: "outline" as const },
  in_progress: { label: "In Progress", variant: "warning" as const },
  completed: { label: "Completed", variant: "success" as const },
};

export default function ProductionSchedulePage() {
  const params = useParams();
  const productionId = params.productionId as string;
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: schedule = [], isLoading, error, refetch } = useQuery({
    queryKey: ["production-schedule", productionId],
    queryFn: async () => {
      const response = await fetch(`/api/productions/${productionId}/schedule`);
      if (!response.ok) return DEMO_SCHEDULE;
      const data = await response.json();
      return data.schedule?.length ? data.schedule : DEMO_SCHEDULE;
    },
  });

  const filteredSchedule = typeFilter === "all" ? schedule : schedule.filter((item: ScheduleItem) => item.type === typeFilter);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const tabs = [
    {
      id: "list",
      label: "List View",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
            <StatCard label="Total Events" value={schedule.length.toString()} icon={<Calendar className="size-5" />} />
            <StatCard label="Upcoming" value={schedule.filter((s: ScheduleItem) => s.status === "scheduled").length.toString()} icon={<Clock className="size-5" />} />
            <StatCard label="Completed" value={schedule.filter((s: ScheduleItem) => s.status === "completed").length.toString()} icon={<CheckCircle className="size-5" />} />
            <StatCard label="Shows" value={schedule.filter((s: ScheduleItem) => s.type === "show").length.toString()} icon={<Calendar className="size-5" />} />
          </Grid>

          <div className="flex gap-2 mb-6">
            {["all", "rehearsal", "setup", "show", "meeting"].map((type) => (
              <Button key={type} variant={typeFilter === type ? "solid" : "outline"} size="sm" onClick={() => setTypeFilter(type)}>
                {type === "all" ? "All" : TYPE_CONFIG[type as keyof typeof TYPE_CONFIG].label}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredSchedule.map((item: ScheduleItem) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-grey-800 rounded-card">
                      <Calendar className="size-6 text-primary" />
                    </div>
                    <div>
                      <Body className="font-weight-bold">{item.title}</Body>
                      <div className="flex items-center gap-4 mt-1 text-grey-400">
                        <div className="flex items-center gap-1"><Calendar className="size-4" /><Body size="sm">{formatDate(item.date)}</Body></div>
                        <div className="flex items-center gap-1"><Clock className="size-4" /><Body size="sm">{item.time}</Body></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={TYPE_CONFIG[item.type].variant}>{TYPE_CONFIG[item.type].label}</Badge>
                    <Badge variant={STATUS_CONFIG[item.status].variant}>{STATUS_CONFIG[item.status].label}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ),
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: <Calendar className="size-4" />,
      content: (
        <Section>
          <Card className="p-8 text-center">
            <Calendar className="size-12 text-grey-600 mx-auto mb-4" />
            <Body className="font-weight-medium mb-2">Calendar View</Body>
            <Body className="text-grey-400">Calendar integration coming soon</Body>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Production", title: "Schedule", description: "Manage production schedule and events" }}
      backButton={{ label: "Overview", href: `/p/${productionId}/overview` }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
      actions={<Button variant="solid" icon={<Plus className="size-4" />} iconPosition="left">Add Event</Button>}
    />
  );
}
