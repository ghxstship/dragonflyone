"use client";

import { useRouter } from "next/navigation";
// Layout provided by route group
import {
  ListPage, Badge, Stack, Body, Text} from "@ghxstship/ui";
import { createExportHandler } from "@ghxstship/config";
import { useSubcontractorsData, type Subcontractor } from "@/hooks/useSubcontractors";
import { Eye } from "lucide-react";

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};

const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
  switch (status?.toLowerCase()) {
    case "active":
    case "valid":
    case "approved":
      return "solid";
    case "pending":
    case "expiring":
      return "outline";
    default:
      return "ghost";
  }
};

const renderRating = (rating: number) => {
  const stars = Math.round(rating);
  return "★".repeat(stars) + "☆".repeat(5 - stars);
};

export default function SubcontractorsPage() {
  const router = useRouter();
  const { subcontractors, summary, isLoading: loading, error, refetch } = useSubcontractorsData();

  const columns: ListPageColumn<Subcontractor>[] = [
    {
      key: 'company_name',
      label: 'Company',
      accessor: 'company_name',
      sortable: true,
      render: (_, s) => (
        <Stack gap={1}>
          <Body className="font-display">{s.company_name}</Body>
          <Body size="sm" className="text-muted-foreground">{s.email}</Body>
        </Stack>
      ),
    },
    { key: 'contact_name', label: 'Contact', accessor: 'contact_name' },
    { key: 'specialty', label: 'Specialty', accessor: 'specialty', sortable: true },
    { key: 'location', label: 'Location', accessor: 'location' },
    {
      key: 'rating',
      label: 'Rating',
      accessor: 'rating',
      sortable: true,
      render: (_, s) => <Text>{renderRating(s.rating)}</Text>,
    },
    {
      key: 'projects',
      label: 'Projects',
      accessor: (s) => `${s.active_projects}/${s.total_projects}`,
      render: (_, s) => <Text className="font-mono">{s.active_projects}/{s.total_projects}</Text>,
    },
    {
      key: 'insurance_status',
      label: 'Insurance',
      accessor: 'insurance_status',
      render: (_, s) => <Badge variant={getStatusVariant(s.insurance_status)}>{s.insurance_status}</Badge>,
    },
    {
      key: 'contract_status',
      label: 'Contract',
      accessor: 'contract_status',
      render: (_, s) => <Badge variant={getStatusVariant(s.contract_status)}>{s.contract_status}</Badge>,
    },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'specialty',
      label: 'Specialty',
      options: [
        { value: 'audio', label: 'Audio' },
        { value: 'lighting', label: 'Lighting' },
        { value: 'video', label: 'Video' },
        { value: 'staging', label: 'Staging' },
        { value: 'rigging', label: 'Rigging' },
        { value: 'power', label: 'Power/Electrical' },
        { value: 'backline', label: 'Backline' },
      ],
    },
  ];

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
      showFavorite
      showSettings
    />
  );
}
