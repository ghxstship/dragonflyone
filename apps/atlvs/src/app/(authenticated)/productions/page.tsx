"use client";

/**
 * Productions List Page
 * 
 * SSOT-compliant: Uses entity registry for columns and filters.
 */

import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { 
  ListPage, useToast,
  type ListPageAction,
} from "@ghxstship/ui";
import { useProductions, useDeleteProduction, type Production } from "../../../hooks/useProductions";
import { 
  useAuthContext, 
  ATLVS_ADMIN_ROLES,
  getEntityColumns,
  getEntityFilters,
} from '@ghxstship/config';
import { atlvsDemoProductions, type ProductionContext } from "@/data/atlvs";

// Unified production display type
interface DisplayProduction {
  id: string;
  name: string;
  status: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
}

// Normalize API production to display format
function normalizeProduction(p: Production | ProductionContext): DisplayProduction {
  if ('title' in p) {
    return {
      id: p.id,
      name: p.title,
      status: p.status,
      startDate: p.opening_date,
      endDate: p.closing_date,
      venue: p.venue_name,
    };
  }
  return {
    id: p.id,
    name: p.name,
    status: p.status,
    startDate: p.startDate,
    endDate: p.endDate,
    venue: p.venue,
  };
}

export default function ProductionsPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const toast = useToast();

  const columns = getEntityColumns<DisplayProduction>('productions');
  const filters = getEntityFilters('productions');

  const canManageProductions = ATLVS_ADMIN_ROLES.some(role => hasRole(role));
  
  const { data: apiProductions, isLoading, error, refetch } = useProductions();
  const deleteMutation = useDeleteProduction();

  const handleDelete = async (prod: DisplayProduction) => {
    if (!confirm(`Delete production "${prod.name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(prod.id);
      toast.success("Production Deleted", `${prod.name} has been deleted`);
    } catch (err) {
      toast.error('Delete Failed', err instanceof Error ? err.message : 'Failed to delete production');
    }
  };
  
  // Use API data if available, fallback to demo data
  const rawProductions = apiProductions && apiProductions.length > 0 ? apiProductions : atlvsDemoProductions;
  const productions: DisplayProduction[] = rawProductions.map(normalizeProduction);

  const rowActions: ListPageAction<DisplayProduction>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (prod) => router.push(`/p/${prod.id}/overview`) },
    ...(canManageProductions ? [
      { id: 'edit', label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: (prod: DisplayProduction) => router.push(`/productions/${prod.id}/edit`) },
      { id: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, variant: 'danger' as const, onClick: (prod: DisplayProduction) => handleDelete(prod) },
    ] : []),
  ];

  return (
    <ListPage<DisplayProduction>
      title="Productions"
      subtitle="Manage all your productions across the platform"
      data={productions}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      error={error}
      onRetry={refetch}
      searchPlaceholder="Search productions..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(prod) => router.push(`/p/${prod.id}/overview`)}
      createLabel="New Production"
      onCreate={canManageProductions ? () => router.push("/productions/new") : undefined}
      emptyMessage="No productions yet"
      emptyAction={canManageProductions ? { label: "New Production", onClick: () => router.push("/productions/new") } : undefined}
      entityType="productions"
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
