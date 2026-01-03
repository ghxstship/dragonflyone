"use client";

/**
 * Production Advancing Page
 * Advance management for production
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useParams } from "next/navigation";
import { ClipboardCheck, Plus, CheckCircle, Clock, AlertCircle, List, Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge, Body, Button, Card, Grid, ProgressBar, StatCard, DetailPage, Section, SectionHeader, Box, Stack } from "@ghxstship/ui";

interface AdvanceItem {
  id: string;
  category: string;
  item: string;
  status: "pending" | "in_progress" | "completed";
  assignee: string;
  due_date: string;
}

const DEMO_ADVANCES: AdvanceItem[] = [
  { id: "1", category: "Venue", item: "Confirm load-in times", status: "completed", assignee: "John Smith", due_date: "2024-12-15" },
  { id: "2", category: "Venue", item: "Verify parking arrangements", status: "completed", assignee: "Sarah Williams", due_date: "2024-12-15" },
  { id: "3", category: "Technical", item: "Confirm power requirements", status: "in_progress", assignee: "Mike Johnson", due_date: "2024-12-16" },
  { id: "4", category: "Technical", item: "Audio system specs", status: "in_progress", assignee: "Alex Chen", due_date: "2024-12-16" },
  { id: "5", category: "Hospitality", item: "Catering menu approval", status: "pending", assignee: "Emily Davis", due_date: "2024-12-17" },
  { id: "6", category: "Hospitality", item: "Green room setup", status: "pending", assignee: "Lisa Brown", due_date: "2024-12-18" },
];

const CATEGORIES = ["All", "Venue", "Technical", "Hospitality"];
const STATUS_CONFIG = {
  pending: { label: "Pending", variant: "warning" as const, icon: <Clock className="size-4" /> },
  in_progress: { label: "In Progress", variant: "info" as const, icon: <AlertCircle className="size-4" /> },
  completed: { label: "Completed", variant: "success" as const, icon: <CheckCircle className="size-4" /> },
};

export default function ProductionAdvancingPage() {
  const params = useParams();
  const productionId = params.productionId as string;
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: advances = [], isLoading, error, refetch } = useQuery({
    queryKey: ["production-advancing", productionId],
    queryFn: async () => {
      const response = await fetch(`/api/productions/${productionId}/advancing`);
      if (!response.ok) return DEMO_ADVANCES;
      const data = await response.json();
      return data.advances?.length ? data.advances : DEMO_ADVANCES;
    },
  });

  const filteredAdvances = selectedCategory === "All" ? advances : advances.filter((a: AdvanceItem) => a.category === selectedCategory);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const stats = {
    total: advances.length,
    completed: advances.filter((a: AdvanceItem) => a.status === "completed").length,
    inProgress: advances.filter((a: AdvanceItem) => a.status === "in_progress").length,
    pending: advances.filter((a: AdvanceItem) => a.status === "pending").length,
  };
  const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const tabs = [
    {
      id: "checklist",
      label: "Checklist",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
            <StatCard label="Total Items" value={stats.total.toString()} icon={<ClipboardCheck className="size-5" />} />
            <StatCard label="Completed" value={stats.completed.toString()} icon={<CheckCircle className="size-5" />} />
            <StatCard label="In Progress" value={stats.inProgress.toString()} icon={<AlertCircle className="size-5" />} />
            <StatCard label="Pending" value={stats.pending.toString()} icon={<Clock className="size-5" />} />
          </Grid>

          <Card className="p-6 mb-6">
            <Box className="flex justify-between mb-2">
              <Body className="font-weight-medium">Overall Progress</Body>
              <Body className="font-weight-bold">{Math.round(progress)}%</Body>
            </Box>
            <ProgressBar value={progress} size="lg" />
          </Card>

          <Box className="flex gap-2 mb-6">
            {CATEGORIES.map((cat) => (
              <Button key={cat} variant={selectedCategory === cat ? "solid" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>
                {cat}
              </Button>
            ))}
          </Box>

          <Stack gap={2}>
            {filteredAdvances.map((advance: AdvanceItem) => {
              const statusConfig = STATUS_CONFIG[advance.status];
              return (
                <Card key={advance.id} className="p-4">
                  <Box className="flex items-center justify-between">
                    <Box className="flex items-center gap-4">
                      <Box className={`p-2 rounded-card ${advance.status === "completed" ? "bg-success/20" : "bg-surface-elevated"}`}>
                        {statusConfig.icon}
                      </Box>
                      <Box>
                        <Body className="font-weight-medium">{advance.item}</Body>
                        <Body size="sm" className="text-text-muted">{advance.assignee} • Due {formatDate(advance.due_date)}</Body>
                      </Box>
                    </Box>
                    <Box className="flex items-center gap-2">
                      <Badge variant="outline">{advance.category}</Badge>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Stack>
        </Section>
      ),
    },
    {
      id: "send",
      label: "Send Advance",
      icon: <Send className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Send Advance Request" description="Send advance questionnaire to venue or vendors" />
          <Card className="p-6 mt-4 max-w-md">
            <Body className="text-text-muted mb-4">Select a template and recipients to send an advance request.</Body>
            <Button variant="solid" icon={<Send className="size-4" />} iconPosition="left">Create Advance Request</Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Production",
        title: "Advancing",
        description: "Manage advance checklist and requirements",
      }}
      backButton={{ label: "Overview", href: `/p/${productionId}/overview` }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
      actions={<Button variant="solid" icon={<Plus className="size-4" />} iconPosition="left">Add Item</Button>}
    />
  );
}
