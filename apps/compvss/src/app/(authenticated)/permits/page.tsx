"use client";

import { useRouter } from "next/navigation";
import {
  ListPage, useToast,
  type ListPageAction} from "@ghxstship/ui";
import { createExportHandler, getEntityColumns, getEntityFilters } from "@ghxstship/config";
import { usePermitsData, type Permit } from "@/hooks/usePermits";
import { Eye, Send } from "lucide-react";

export default function PermitsPage() {
  const router = useRouter();
  const toast = useToast();
  const { permits, summary, isLoading: loading, error, refetch } = usePermitsData();

  const columns = getEntityColumns<Permit>('permits');
  const filters = getEntityFilters('permits');

  const handleSubmitApplication = async (permitId: string) => {
    try {
      const response = await fetch(`/api/permits/${permitId}/submit`, { method: "POST" });
      if (response.ok) {
        toast.success("Success", "Application submitted");
        refetch();
      }
    } catch {
      toast.error("Error", "Failed to submit application");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
