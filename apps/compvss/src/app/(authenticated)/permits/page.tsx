"use client";

import { useRouter } from "next/navigation";
// Layout provided by route group
import {
  ListPage, Badge, Text, useNotifications} from "@ghxstship/ui";
import { createExportHandler } from "@ghxstship/config";
import { usePermitsData, type Permit } from "@/hooks/usePermits";
import { Eye, Send } from "lucide-react";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
  switch (status?.toLowerCase()) {
    case "approved":
    case "active":
      return "solid";
    case "pending":
    case "submitted":
      return "outline";
    default:
      return "ghost";
  }
};

export default function PermitsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { permits, summary, isLoading: loading, error, refetch } = usePermitsData();

  const handleSubmitApplication = async (permitId: string) => {
    try {
      const response = await fetch(`/api/permits/${permitId}/submit`, { method: "POST" });
      if (response.ok) {
        addNotification({ type: "success", title: "Success", message: "Application submitted" });
        refetch();
      }
    } catch {
      addNotification({ type: "error", title: "Error", message: "Failed to submit application" });
    }
  };

  const columns: ListPageColumn<Permit>[] = [
    {
      key: 'permit_number',
      label: 'Permit #',
      accessor: (p) => p.permit_number || '—',
      sortable: true,
      render: (_, p) => <Text className="font-mono">{p.permit_number || '—'}</Text>,
    },
    { key: 'permit_type', label: 'Type', accessor: 'permit_type', sortable: true },
    { key: 'project_name', label: 'Project', accessor: 'project_name', sortable: true },
    { key: 'venue_name', label: 'Venue', accessor: 'venue_name' },
    { key: 'jurisdiction', label: 'Jurisdiction', accessor: 'jurisdiction' },
    {
      key: 'expiration_date',
      label: 'Deadline',
      accessor: 'expiration_date',
      sortable: true,
      render: (_, p) => <Text className="font-mono">{p.expiration_date ? formatDate(p.expiration_date) : '—'}</Text>,
    },
    {
      key: 'fee_amount',
      label: 'Fee',
      accessor: 'fee_amount',
      render: (_, p) => <Text className="font-mono">{formatCurrency(p.fee_amount)}</Text>,
    },
    {
      key: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (_, p) => <Badge variant={getStatusVariant(p.status)}>{p.status}</Badge>,
    },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'denied', label: 'Denied' },
        { value: 'expired', label: 'Expired' },
      ],
    },
    {
      key: 'permit_type',
      label: 'Type',
      options: [
        { value: 'special_event', label: 'Special Event' },
        { value: 'noise', label: 'Noise/Sound' },
        { value: 'fire_safety', label: 'Fire/Safety' },
        { value: 'street_closure', label: 'Street Closure' },
        { value: 'alcohol', label: 'Alcohol' },
        { value: 'food', label: 'Food Service' },
      ],
    },
  ];

  const rowActions: ListPageAction<Permit>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (p) => router.push(`/permits/${p.id}`) },
    {
      id: 'submit',
      label: 'Submit',
      icon: <Send className="h-4 w-4" />,
      onClick: (p) => handleSubmitApplication(p.id),
      hidden: (p) => p.status !== 'draft',
    },
  ];

  const stats = [
    { label: 'Total Permits', value: summary?.total_permits || 0 },
    { label: 'Pending', value: summary?.pending_applications || 0 },
    { label: 'Expiring Soon', value: summary?.expiring_soon || 0 },
    { label: 'Total Fees', value: formatCurrency(summary?.total_fees || 0) },
  ];

  return (
    <ListPage<Permit>
      title="Permit Management"
      subtitle="Track permit applications, approvals, and compliance requirements"
      data={permits}
      columns={columns}
      rowKey="id"
      loading={loading}
      error={error instanceof Error ? error : undefined}
      onRetry={refetch}
      searchPlaceholder="Search permits..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(p) => router.push(`/permits/${p.id}`)}
      createLabel="New Application"
      onCreate={() => router.push('/permits/new')}
      entityType="permits"
      onExport={createExportHandler({
        filename: "permits",
        getData: () => permits.map((p: Permit) => ({
          permit_number: p.permit_number || '',
          permit_type: p.permit_type,
          project_name: p.project_name,
          venue_name: p.venue_name,
          jurisdiction: p.jurisdiction,
          expiration_date: p.expiration_date || '',
          fee_amount: p.fee_amount,
          status: p.status,
        })),
      })}
      stats={stats}
      emptyMessage="No permits found"
      emptyAction={{ label: 'New Application', onClick: () => router.push('/permits/new') }}
      showFavorite
      showSettings
    />
  );
}
