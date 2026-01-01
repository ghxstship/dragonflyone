"use client";

/**
 * GVTEWAY Venues Page
 * Browse and discover venues
 * Uses ListPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Eye, Calendar } from "lucide-react";
import {
  ListPage,
  type ListPageAction,
} from "@ghxstship/ui";
import { getEntityColumns, getEntityFilters } from "@ghxstship/config";
import { useVenues } from "@/hooks/useVenues";

interface Venue {
  id: string;
  name: string;
  address?: string;
  capacity: number;
  status?: string;
}

export default function VenuesPage() {
  const router = useRouter();
  const { data: venues = [], isLoading, error, refetch } = useVenues({ status: "active" });

  const columns = getEntityColumns<Venue>('venues');
  const filters = getEntityFilters('venues');

  const rowActions: ListPageAction<Venue>[] = [
    {
      id: "view",
      label: "View Details",
      icon: <Eye className="size-4" />,
      onClick: (row) => router.push(`/venues/${row.id}`),
    },
    {
      id: "calendar",
      label: "View Calendar",
      icon: <Calendar className="size-4" />,
      onClick: (row) => router.push(`/venues/${row.id}/calendar`),
    },
  ];

  const totalCapacity = venues.reduce((sum, v) => sum + (v.capacity || 0), 0);
  const activeVenues = venues.filter((v) => v.status === "active").length;

  const stats = [
    { label: "Total Venues", value: venues.length },
    { label: "Active Venues", value: activeVenues },
    { label: "Total Capacity", value: totalCapacity.toLocaleString() },
  ];

  return (
    <ListPage<Venue>
      title="Venues"
      subtitle="Discover world-class venues hosting unforgettable experiences"
      data={venues}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      error={error}
      onRetry={refetch}
      searchPlaceholder="Search venues..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(row) => router.push(`/venues/${row.id}`)}
      entityType="venues"
      stats={stats}
      emptyMessage="No venues found"
      emptyAction={{ label: "Browse Events", onClick: () => router.push("/events") }}
    />
  );
}
