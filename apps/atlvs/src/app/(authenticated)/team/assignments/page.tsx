"use client";

import { useState, useMemo } from "react";
import { Eye, Loader2, AlertTriangle } from "lucide-react";
import {
  Badge,
  Body,
  Button,
  Card,
  DetailDrawer,
  EnterprisePageHeader,
  Grid,
  ListPage,
  Stack,
  type DetailSection,
  type ListPageAction,
  type ListPageColumn,
  type ListPageFilter,
} from '@ghxstship/ui';
import { createExportHandler, useTeamAssignments, type TeamAssignment } from "@ghxstship/config";

interface Assignment {
  id: string;
  member: string;
  role: string;
  project: string;
  start_date: string;
  end_date: string | null;
  hours_per_week: number;
  status: "active" | "pending" | "completed" | "cancelled";
  priority: "high" | "medium" | "low";
}

const mapApiToAssignment = (a: TeamAssignment): Assignment => ({
  id: a.id,
  member: a.team_member?.full_name || "Unknown",
  role: a.role,
  project: a.project?.name || "Unassigned",
  start_date: a.start_date,
  end_date: a.end_date || null,
  hours_per_week: 40,
  status: a.status === "confirmed" ? "active" : a.status === "in_progress" ? "active" : a.status as Assignment["status"],
  priority: "medium",
});

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const getStatusVariant = (status: Assignment["status"]): "solid" | "outline" | "ghost" => {
  switch (status) {
    case "active": return "solid";
    case "pending": return "outline";
    default: return "ghost";
  }
};

const getPriorityColor = (priority: Assignment["priority"]) => {
  switch (priority) {
    case "high": return "text-error";
    case "medium": return "text-warning";
    default: return "text-grey-400";
  }
};

const columns: ListPageColumn<Assignment>[] = [
  { key: "member", label: "Team Member", accessor: "member", sortable: true },
  { key: "role", label: "Role", accessor: "role" },
  { key: "project", label: "Project", accessor: "project", sortable: true },
  { key: "hours_per_week", label: "Hours/Week", accessor: (r) => `${r.hours_per_week}h` },
  { key: "start_date", label: "Start", accessor: (r) => formatDate(r.start_date), sortable: true },
  { key: "priority", label: "Priority", accessor: "priority", render: (v) => <Badge variant="outline" className={`capitalize ${getPriorityColor(v as Assignment["priority"])}`}>{String(v)}</Badge> },
  { key: "status", label: "Status", accessor: "status", render: (v) => <Badge variant={getStatusVariant(v as Assignment["status"])} className="capitalize">{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: "status", label: "Status", options: [
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
  ]},
  { key: "priority", label: "Priority", options: [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ]},
];

export default function TeamAssignmentsPage() {
  const { assignments: apiAssignments, isLoading, error, refetch } = useTeamAssignments();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const assignments = useMemo(() => apiAssignments.map(mapApiToAssignment), [apiAssignments]);

  const activeCount = assignments.filter((a: Assignment) => a.status === "active").length;
  const totalHours = assignments.filter((a: Assignment) => a.status === "active").reduce((sum: number, a: Assignment) => sum + a.hours_per_week, 0);
  const highPriorityCount = assignments.filter((a: Assignment) => a.priority === "high" && a.status === "active").length;

  if (isLoading) {
    return (
      <Stack gap={8}>
        <EnterprisePageHeader title="Team Assignments" subtitle="Manage team member project assignments" showFavorite showSettings />
        <Card inverted className="border-2 border-ink-800 p-12">
          <Stack gap={4} className="items-center justify-center">
            <Loader2 className="size-8 text-primary animate-spin" />
            <Body className="text-grey-400">Loading assignments...</Body>
          </Stack>
        </Card>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack gap={8}>
        <EnterprisePageHeader title="Team Assignments" subtitle="Manage team member project assignments" showFavorite showSettings />
        <Card inverted className="border-2 border-error/30 p-8">
          <Stack gap={4} className="items-center justify-center">
            <AlertTriangle className="size-8 text-error" />
            <Body className="text-error">Failed to load assignments</Body>
            <Button onClick={() => refetch()} className="px-4 py-2 rounded-button bg-primary text-white">Retry</Button>
          </Stack>
        </Card>
      </Stack>
    );
  }

  const rowActions: ListPageAction<Assignment>[] = [
    { id: "view", label: "View Details", icon: <Eye className="size-4" />, onClick: (r) => { setSelectedAssignment(r); setDrawerOpen(true); } },
  ];

  const stats = [
    { label: "Total Assignments", value: assignments.length },
    { label: "Active", value: activeCount },
    { label: "Weekly Hours", value: `${totalHours}h` },
    { label: "High Priority", value: highPriorityCount },
  ];

  const detailSections: DetailSection[] = selectedAssignment ? [
    { id: "overview", title: "Assignment Details", content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Member:</strong> {selectedAssignment.member}</Body>
        <Body size="sm"><strong>Role:</strong> {selectedAssignment.role}</Body>
        <Body size="sm"><strong>Project:</strong> {selectedAssignment.project}</Body>
        <Body size="sm"><strong>Hours/Week:</strong> {selectedAssignment.hours_per_week}h</Body>
        <Body size="sm"><strong>Start:</strong> {formatDate(selectedAssignment.start_date)}</Body>
        <Body size="sm"><strong>End:</strong> {selectedAssignment.end_date ? formatDate(selectedAssignment.end_date) : "Ongoing"}</Body>
        <Body size="sm"><strong>Priority:</strong> {selectedAssignment.priority}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedAssignment.status}</Body>
      </Grid>
    )},
  ] : [];

  return (
    <>
      <ListPage<Assignment>
        title="Team Assignments"
        subtitle="Manage team member project assignments"
        data={assignments}
        columns={columns}
        rowKey="id"
        searchPlaceholder="Search assignments..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedAssignment(r); setDrawerOpen(true); }}
        entityType="assignments"
        onExport={createExportHandler({
          filename: "team-assignments",
          getData: () => assignments.map((a: Assignment) => ({
            member: a.member,
            role: a.role,
            project: a.project,
            hours_per_week: a.hours_per_week,
            start_date: a.start_date,
            end_date: a.end_date || "",
            priority: a.priority,
            status: a.status,
          })),
        })}
        stats={stats}
        emptyMessage="No assignments found"
        showFavorite
        showSettings
      />
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedAssignment}
        title={(r) => r.member}
        subtitle={(r) => `${r.role} - ${r.project}`}
        sections={detailSections}
      />
    </>
  );
}
