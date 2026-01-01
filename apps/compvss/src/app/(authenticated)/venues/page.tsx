"use client";

import { useRouter } from "next/navigation";
import { useVenues } from "@/hooks/useVenues";
import {
  ListPage,
  type ListPageAction} from "@ghxstship/ui";
import { createExportHandler, getEntityColumns, getEntityFilters } from "@ghxstship/config";
import { Eye } from "lucide-react";

interface Venue {
  id: string;
  name: string;
  city?: string;
  state?: string;
  capacity?: number;
  type?: string;
  status?: string;
}

export default function VenuesPage() {
  const router = useRouter();
  const { data: venues, isLoading, error, refetch } = useVenues();

  const venueList = venues || [];

  const columns = getEntityColumns<Venue>('venues');
  const filters = getEntityFilters('venues');

  const rowActions: ListPageAction<Venue>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (v) => router.push(`/venues/${v.id}`) },
  ];

  return (
    <ListPage<Venue>
      title="Venue Directory"
      subtitle="Browse and manage venue information for productions"
      data={venueList}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      error={error instanceof Error ? error : undefined}
      onRetry={refetch}
      searchPlaceholder="Search venues..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(v) => router.push(`/venues/${v.id}`)}
      entityType="venues"
      onExport={createExportHandler({
        filename: "venues",
        getData: () => venueList.map((v: Venue) => ({
          name: v.name,
          city: v.city || '',
          state: v.state || '',
          capacity: v.capacity || 0,
          type: v.type || '',
          status: v.status || '',
        })),
      })}
      emptyMessage="No venues found"
      emptyAction={{ label: 'Add Venue', onClick: () => router.push('/venues/new') }}
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
