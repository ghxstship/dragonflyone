"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AtlvsAppLayout, AtlvsLoadingLayout } from "@/components/app-layout";
import {
  H3,
  Body,
  Button,
  Badge,
  Select,
  EmptyState,
  Stack,
  Card,
  StatCard,
  Grid,
  Label,
  EnterprisePageHeader,
  Section,
  SectionHeader,
  StatusBadge,
} from "@ghxstship/ui";
import {
  CheckCircle,
  ListTodo,
  Filter,
  ArrowRight,
} from "lucide-react";
import { useActionItems, useActionItemStats, useCompleteActionItem } from "@/hooks/useActionItems";
import { log } from '@ghxstship/config';

export default function ActionItemsPage() {
  const router = useRouter();
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: actionItems, isLoading, refetch } = useActionItems({
    priority: filterPriority !== "all" ? filterPriority : undefined,
    status: filterStatus !== "all" ? filterStatus : undefined,
    limit: 100,
  });

  const { data: stats } = useActionItemStats();
  const completeItem = useCompleteActionItem();

  const handleComplete = async (id: string, source: 'task' | 'meeting') => {
    try {
      await completeItem.mutateAsync({ id, source });
      refetch();
    } catch (error) {
      log.error('Failed to complete action item:', error instanceof Error ? error : undefined);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <StatusBadge status="error" size="sm">Critical</StatusBadge>;
      case 'high':
        return <StatusBadge status="warning" size="sm">High</StatusBadge>;
      case 'medium':
        return <StatusBadge status="info" size="sm">Medium</StatusBadge>;
      default:
        return <StatusBadge status="neutral" size="sm">Low</StatusBadge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge variant="outline">In Progress</Badge>;
      case 'completed':
        return <Badge variant="solid">Completed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getDueDateDisplay = (dueDate?: string) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <Label size="xs" className="text-error">Overdue by {Math.abs(diffDays)} days</Label>;
    } else if (diffDays === 0) {
      return <Label size="xs" className="text-warning">Due today</Label>;
    } else if (diffDays <= 3) {
      return <Label size="xs" className="text-warning">Due in {diffDays} days</Label>;
    }
    return <Label size="xs" className="text-on-dark-muted">Due {date.toLocaleDateString()}</Label>;
  };

  if (isLoading) {
    return <AtlvsLoadingLayout text="Loading action items..." />;
  }

  return (
    <AtlvsAppLayout>
      <Stack gap={10}>
        <EnterprisePageHeader
          title="Action Items"
          subtitle="Track and manage all pending tasks and follow-ups"
          showFavorite
          showSettings
        />

        {/* Stats */}
        <Grid cols={4} gap={6}>
          <StatCard
            label="Total Pending"
            value={stats?.total?.toString() || "0"}
            trend="neutral"
          />
          <StatCard
            label="Critical Priority"
            value={stats?.critical?.toString() || "0"}
            trend={stats?.critical && stats.critical > 0 ? "down" : "neutral"}
            trendValue={stats?.critical && stats.critical > 0 ? "Needs attention" : ""}
          />
          <StatCard
            label="High Priority"
            value={stats?.high?.toString() || "0"}
            trend="neutral"
          />
          <StatCard
            label="In Progress"
            value={stats?.inProgress?.toString() || "0"}
            trend="up"
          />
        </Grid>

        {/* Filters */}
        <Section border>
          <SectionHeader
            kicker="Filters"
            title="Filter Action Items"
            icon={<Filter className="size-5" />}
          />
          <Stack direction="horizontal" gap={4} className="items-end">
            <Stack gap={2}>
              <Label size="xs" className="text-on-dark-muted">Priority</Label>
              <Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                inverted
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </Stack>
            <Stack gap={2}>
              <Label size="xs" className="text-on-dark-muted">Status</Label>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                inverted
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
              </Select>
            </Stack>
            <Button
              variant="outlineWhite"
              size="sm"
              onClick={() => {
                setFilterPriority("all");
                setFilterStatus("all");
              }}
            >
              Clear Filters
            </Button>
          </Stack>
        </Section>

        {/* Action Items List */}
        <Section border>
          <SectionHeader
            kicker="Tasks"
            title="All Action Items"
            description={`${actionItems?.length || 0} items requiring attention`}
          />
          
          {!actionItems || actionItems.length === 0 ? (
            <EmptyState
              icon={<ListTodo className="size-12" />}
              title="No Action Items"
              description="You're all caught up! No pending action items."
              inverted
            />
          ) : (
            <Stack gap={3}>
              {actionItems.map((item) => (
                <Card
                  key={`${item.source}-${item.id}`}
                  inverted
                  interactive
                  className={`border-2 p-5 transition-colors ${
                    item.priority === 'critical' ? 'border-error' :
                    item.priority === 'high' ? 'border-warning' :
                    'border-grey-700 hover:border-grey-500'
                  }`}
                >
                  <Stack gap={4} direction="horizontal" className="items-start justify-between">
                    <Stack gap={2} className="flex-1">
                      <Stack direction="horizontal" gap={3} className="items-center">
                        {getPriorityBadge(item.priority)}
                        {getStatusBadge(item.status)}
                        <Badge variant="outline">
                          {item.source === 'task' ? 'Task' : 'Meeting Follow-up'}
                        </Badge>
                      </Stack>
                      <H3 className="text-white">{item.title}</H3>
                      {item.description && (
                        <Body size="sm" className="text-grey-300">{item.description}</Body>
                      )}
                      <Stack direction="horizontal" gap={4} className="items-center">
                        {getDueDateDisplay(item.due_date)}
                        {item.assignee_name && (
                          <Label size="xs" className="text-on-dark-muted">
                            Assigned to: {item.assignee_name}
                          </Label>
                        )}
                      </Stack>
                    </Stack>
                    <Stack direction="horizontal" gap={2}>
                      {item.status !== 'completed' && (
                        <Button
                          variant="solid"
                          size="sm"
                          onClick={() => handleComplete(item.id, item.source)}
                          icon={<CheckCircle className="size-4" />}
                          iconPosition="left"
                        >
                          Complete
                        </Button>
                      )}
                      <Button
                        variant="outlineWhite"
                        size="sm"
                        onClick={() => {
                          if (item.source === 'task' && item.production_id) {
                            router.push(`/p/${item.production_id}/schedule`);
                          } else if (item.project_id) {
                            router.push(`/projects/${item.project_id}`);
                          }
                        }}
                        icon={<ArrowRight className="size-4" />}
                        iconPosition="right"
                      >
                        View Details
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Section>
      </Stack>
    </AtlvsAppLayout>
  );
}
