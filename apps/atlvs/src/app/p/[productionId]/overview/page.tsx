"use client";

/**
 * Production Overview Page
 * Production dashboard and summary
 * Uses DetailPage template for consistent layout
 */

import { useParams, useRouter } from "next/navigation";
import { Calendar, Users, FileText, DollarSign, Clock, CheckCircle, List, Activity} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge, Body, Button, Card, Grid, ProgressBar, StatCard, DetailPage, Section, SectionHeader} from "@ghxstship/ui";

interface Production {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  budget: number;
  spent: number;
  team_count: number;
  tasks_total: number;
  tasks_completed: number;
}

export default function ProductionOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params.productionId as string;

  const { data: production, isLoading, error, refetch } = useQuery({
    queryKey: ["production", productionId],
    queryFn: async () => {
      const response = await fetch(`/api/productions/${productionId}`);
      if (!response.ok) throw new Error("Failed to fetch production");
      return response.json() as Promise<Production>;
    },
  });

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

  const taskProgress = production ? (production.tasks_completed / production.tasks_total) * 100 : 0;
  const budgetProgress = production ? (production.spent / production.budget) * 100 : 0;

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
            <StatCard label="Team Members" value={production?.team_count?.toString() || "0"} icon={<Users className="size-5" />} />
            <StatCard label="Tasks" value={`${production?.tasks_completed || 0}/${production?.tasks_total || 0}`} icon={<CheckCircle className="size-5" />} />
            <StatCard label="Budget" value={formatCurrency(production?.budget || 0)} icon={<DollarSign className="size-5" />} />
            <StatCard label="Days Left" value={production ? Math.max(0, Math.ceil((new Date(production.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))).toString() : "0"} icon={<Clock className="size-5" />} />
          </Grid>

          <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
            <Card className="p-6">
              <SectionHeader title="Task Progress" />
              <div className="mt-4">
                <div className="flex justify-between mb-2">
                  <Body size="sm" className="text-grey-400">{production?.tasks_completed || 0} of {production?.tasks_total || 0} tasks completed</Body>
                  <Body size="sm" className="font-weight-medium">{Math.round(taskProgress)}%</Body>
                </div>
                <ProgressBar value={taskProgress} size="lg" />
              </div>
              <Button variant="outline" className="mt-4" onClick={() => router.push(`/p/${productionId}/schedule`)}>View Schedule</Button>
            </Card>

            <Card className="p-6">
              <SectionHeader title="Budget Status" />
              <div className="mt-4">
                <div className="flex justify-between mb-2">
                  <Body size="sm" className="text-grey-400">{formatCurrency(production?.spent || 0)} of {formatCurrency(production?.budget || 0)} spent</Body>
                  <Body size="sm" className="font-weight-medium">{Math.round(budgetProgress)}%</Body>
                </div>
                <ProgressBar value={budgetProgress} size="lg" variant={budgetProgress > 90 ? "error" : budgetProgress > 75 ? "warning" : "default"} />
              </div>
              <Button variant="outline" className="mt-4" onClick={() => router.push(`/finance/budgets`)}>View Budget</Button>
            </Card>
          </Grid>

          <Card className="p-6 mt-6">
            <SectionHeader title="Quick Actions" />
            <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mt-4">
              <Button variant="outline" onClick={() => router.push(`/p/${productionId}/schedule`)} icon={<Calendar className="size-4" />} iconPosition="left">Schedule</Button>
              <Button variant="outline" onClick={() => router.push(`/p/${productionId}/team`)} icon={<Users className="size-4" />} iconPosition="left">Team</Button>
              <Button variant="outline" onClick={() => router.push(`/p/${productionId}/documents`)} icon={<FileText className="size-4" />} iconPosition="left">Documents</Button>
              <Button variant="outline" onClick={() => router.push(`/p/${productionId}/vendors`)} icon={<DollarSign className="size-4" />} iconPosition="left">Vendors</Button>
            </Grid>
          </Card>
        </Section>
      ),
    },
    {
      id: "activity",
      label: "Activity",
      icon: <Activity className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Recent Activity" description="Latest updates on this production" />
          <div className="space-y-4 mt-4">
            {[
              { action: "Task completed", detail: "Stage setup finalized", time: "2 hours ago", icon: <CheckCircle className="size-4 text-success" /> },
              { action: "Document uploaded", detail: "Vendor contract signed", time: "4 hours ago", icon: <FileText className="size-4 text-info" /> },
              { action: "Team member added", detail: "John Smith joined as Stage Manager", time: "1 day ago", icon: <Users className="size-4 text-primary" /> },
              { action: "Budget updated", detail: "Lighting budget increased", time: "2 days ago", icon: <DollarSign className="size-4 text-warning" /> },
            ].map((activity, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-grey-800 rounded-card">{activity.icon}</div>
                  <div className="flex-1">
                    <Body className="font-weight-medium">{activity.action}</Body>
                    <Body size="sm" className="text-grey-400">{activity.detail}</Body>
                  </div>
                  <Body size="sm" className="text-grey-500">{activity.time}</Body>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Production",
        title: production?.name || "Loading...",
        description: production ? `${formatDate(production.start_date)} - ${formatDate(production.end_date)}` : "",
      }}
      backButton={{ label: "Productions", href: "/projects" }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
      actions={
        <div className="flex gap-2">
          <Badge variant={production?.status === "active" ? "success" : "warning"}>{production?.status || "Loading"}</Badge>
          <Button variant="outline" onClick={() => router.push(`/p/${productionId}/settings`)}>Settings</Button>
        </div>
      }
    />
  );
}
