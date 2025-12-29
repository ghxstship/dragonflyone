"use client";

/**
 * GVTEWAY Venues Page
 * Browse and discover venues
 * Uses ListPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Eye, Calendar, MapPin, Users } from "lucide-react";
import {
  Badge,
  Body,
  ListPage,
  type ListPageAction,
  type ListPageColumn,
  type ListPageFilter,
} from "@ghxstship/ui";
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

  const columns: ListPageColumn<Venue>[] = [
    {
      key: "name",
      label: "Venue",
      accessor: "name",
      sortable: true,
      render: (value, row) => (
        <div>
          <Body className="font-weight-medium text-white">{String(value)}</Body>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="size-3 text-grey-400" />
            <Body size="sm" className="text-grey-400">{row.address || "Location TBD"}</Body>
          </div>
        </div>
      ),
    },
    {
      key: "capacity",
      label: "Capacity",
      accessor: "capacity",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Users className="size-4 text-grey-400" />
          <Body size="sm">{Number(value).toLocaleString()}</Body>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      accessor: "status",
      sortable: true,
      render: (value) => {
        const variant = value === "active" ? "success" : value === "inactive" ? "warning" : "outline";
        return <Badge variant={variant}>{String(value || "active").toUpperCase()}</Badge>;
      },
    },
  ];

  const filters: ListPageFilter[] = [
    {
      key: "capacity",
      label: "Capacity",
      options: [
        { value: "small", label: "Small (<1,000)" },
        { value: "medium", label: "Medium (1K-5K)" },
        { value: "large", label: "Large (5K+)" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ];

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
