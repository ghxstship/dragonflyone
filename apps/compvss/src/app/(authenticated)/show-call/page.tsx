"use client";

import { useRouter } from "next/navigation";
import {
  ListPage,
  type ListPageAction} from "@ghxstship/ui";
import { createExportHandler, getEntityColumns, getEntityFilters } from "@ghxstship/config";
import { useShowCallCrew } from '@/hooks/useShowCall';
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

export default function ShowCallPage() {
  const router = useRouter();
  const { data: showCallCrew = [], refetch } = useShowCallCrew();

  const checkedInCount = showCallCrew.filter(c => c.status === "Checked In" || c.status === "On Site").length;
  const lateCount = showCallCrew.filter(c => c.status === "Late").length;
  const noShowCount = showCallCrew.filter(c => c.status === "No Show").length;
  const notDueCount = showCallCrew.filter(c => c.status === "Not Due").length;

  const columns = getEntityColumns<ShowCallCrewMember>('show-call');
  const filters = getEntityFilters('show-call');

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
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
