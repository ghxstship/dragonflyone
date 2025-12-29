"use client";

import { useRouter } from "next/navigation";
// Layout provided by route group
import {
  ListPage,
  Body,
  Stack,
  Badge,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
} from "@ghxstship/ui";
import { createExportHandler } from "@ghxstship/config";
import { useShowCallCrew } from '../../hooks/useShowCall';
import { Eye, Phone, CheckCircle } from "lucide-react";

interface ShowCallCrewMember {
  id: string;
  name: string;
  role: string;
  department: string;
  callTime: string;
  status: string;
  checkedInAt?: string;
}

const getStatusVariant = (status: string): 'solid' | 'outline' | 'ghost' => {
  switch (status) {
    case "Checked In": case "On Site": return "solid";
    case "Late": return "outline";
    default: return "ghost";
  }
};

export default function ShowCallPage() {
  const router = useRouter();
  const { data: showCallCrew = [], refetch } = useShowCallCrew();

  const checkedInCount = showCallCrew.filter(c => c.status === "Checked In" || c.status === "On Site").length;
  const lateCount = showCallCrew.filter(c => c.status === "Late").length;
  const noShowCount = showCallCrew.filter(c => c.status === "No Show").length;
  const notDueCount = showCallCrew.filter(c => c.status === "Not Due").length;

  const columns: ListPageColumn<ShowCallCrewMember>[] = [
    {
      key: 'name',
      label: 'Crew Member',
      accessor: 'name',
      sortable: true,
      render: (_, c) => (
        <Stack gap={1}>
          <Body className="font-display">{c.name}</Body>
          <Body size="sm" className="text-muted-foreground">{c.role}</Body>
        </Stack>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      accessor: 'department',
      sortable: true,
      render: (_, c) => <Badge variant="outline">{c.department}</Badge>,
    },
    { key: 'callTime', label: 'Call Time', accessor: 'callTime', sortable: true },
    { key: 'checkedInAt', label: 'Checked In', accessor: (c) => c.checkedInAt || '—' },
    {
      key: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (_, c) => <Badge variant={getStatusVariant(c.status)}>{c.status}</Badge>,
    },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'Checked In', label: 'Checked In' },
        { value: 'On Site', label: 'On Site' },
        { value: 'Late', label: 'Late' },
        { value: 'No Show', label: 'No Show' },
        { value: 'Not Due', label: 'Not Due' },
      ],
    },
    {
      key: 'department',
      label: 'Department',
      options: [
        { value: 'Audio', label: 'Audio' },
        { value: 'Lighting', label: 'Lighting' },
        { value: 'Video', label: 'Video' },
        { value: 'Staging', label: 'Staging' },
        { value: 'Rigging', label: 'Rigging' },
      ],
    },
  ];

  const rowActions: ListPageAction<ShowCallCrewMember>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (c) => router.push(`/crew/${c.id}`) },
    { id: 'contact', label: 'Contact', icon: <Phone className="h-4 w-4" />, onClick: () => {}, hidden: (c) => c.status !== 'Late' && c.status !== 'No Show' },
    { id: 'checkin', label: 'Check In', icon: <CheckCircle className="h-4 w-4" />, onClick: () => {}, hidden: (c) => c.status !== 'Not Due' },
  ];

  const stats = [
    { label: 'Checked In', value: checkedInCount },
    { label: 'Late', value: lateCount },
    { label: 'No Show', value: noShowCount },
    { label: 'Not Due Yet', value: notDueCount },
  ];

  return (
    <ListPage<ShowCallCrewMember>
      title="Show Call Status"
      subtitle="Real-time crew check-in and attendance tracking"
      data={showCallCrew}
      columns={columns}
      rowKey="id"
      loading={false}
      onRetry={refetch}
      searchPlaceholder="Search crew..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(c) => router.push(`/crew/${c.id}`)}
      createLabel="Manual Check-In"
      onCreate={() => {}}
      entityType="show-call"
      onExport={createExportHandler({
        filename: "show-call",
        getData: () => showCallCrew.map((c: ShowCallCrewMember) => ({
          name: c.name,
          role: c.role,
          department: c.department,
          callTime: c.callTime,
          checkedInAt: c.checkedInAt || '',
          status: c.status,
        })),
      })}
      stats={stats}
      emptyMessage="No crew members found"
      showFavorite
      showSettings
    />
  );
}
