"use client";

import { useRouter } from "next/navigation";
import {
  ListPage,
  type ListPageAction} from "@ghxstship/ui";
import { createExportHandler, getEntityColumns, getEntityFilters } from "@ghxstship/config";
import { useSubcontractorsData, type Subcontractor } from "@/hooks/useSubcontractors";
import { Eye } from "lucide-react";

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};

export default function SubcontractorsPage() {
  const router = useRouter();
  const { subcontractors, summary, isLoading: loading, error, refetch } = useSubcontractorsData();

  const columns = getEntityColumns<Subcontractor>('subcontractors');
  const filters = getEntityFilters('subcontractors');

  const rowActions: ListPageAction<Subcontractor>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (s) => router.push(`/subcontractors/${s.id}`) },
  ];

  const stats = [
    { label: 'Total Subcontractors', value: summary?.total_subcontractors || 0 },
    { label: 'Active Engagements', value: summary?.active_engagements || 0 },
    { label: 'YTD Spend', value: formatCurrency(summary?.total_spend_ytd || 0) },
    { label: 'Avg Rating', value: summary?.average_rating?.toFixed(1) || '0.0' },
  ];

  return (
    <ListPage<Subcontractor>
      title="Subcontractor Directory"
      subtitle="Manage subcontractor relationships and compliance"
      data={subcontractors}
      columns={columns}
      rowKey="id"
      loading={loading}
      error={error instanceof Error ? error : undefined}
      onRetry={refetch}
      searchPlaceholder="Search subcontractors..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(s) => router.push(`/subcontractors/${s.id}`)}
      createLabel="Add Subcontractor"
      onCreate={() => router.push('/subcontractors/new')}
      entityType="subcontractors"
      onExport={createExportHandler({
        filename: "subcontractors",
        getData: () => subcontractors.map((s: Subcontractor) => ({
          company_name: s.company_name,
          contact_name: s.contact_name,
          email: s.email,
          specialty: s.specialty,
          location: s.location,
          rating: s.rating,
          active_projects: s.active_projects,
          total_projects: s.total_projects,
          insurance_status: s.insurance_status,
          contract_status: s.contract_status,
        })),
      })}
      stats={stats}
      emptyMessage="No subcontractors found"
      emptyAction={{ label: 'Add Subcontractor', onClick: () => router.push('/subcontractors/new') }}
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
