"use client";

import { useRouter } from "next/navigation";
// Layout provided by route group
import { useVenues } from "@/hooks/useVenues";
import {
  ListPage, Badge, Text} from '@ghxstship/ui';
import { createExportHandler } from "@ghxstship/config";
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

  const columns: ListPageColumn<Venue>[] = [
    { key: 'name', label: 'Venue Name', accessor: 'name', sortable: true },
    {
      key: 'location',
      label: 'Location',
      accessor: (v) => `${v.city || ''}, ${v.state || ''}`.replace(/^, |, $/g, '') || '—',
    },
    {
      key: 'capacity',
      label: 'Capacity',
      accessor: 'capacity',
      sortable: true,
      render: (_, v) => <Text className="font-mono">{v.capacity?.toLocaleString() || '—'}</Text>,
    },
    {
      key: 'type',
      label: 'Type',
      accessor: 'type',
      sortable: true,
      render: (_, v) => <Badge variant="outline">{v.type || 'Unknown'}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (_, v) => (
        <Badge variant={v.status === "active" ? "solid" : "outline"}>
          {v.status === "active" ? "Available" : "Inactive"}
        </Badge>
      ),
    },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Available' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
    {
      key: 'type',
      label: 'Type',
      options: [
        { value: 'arena', label: 'Arena' },
        { value: 'stadium', label: 'Stadium' },
        { value: 'theater', label: 'Theater' },
        { value: 'club', label: 'Club' },
        { value: 'outdoor', label: 'Outdoor' },
      ],
    },
  ];

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
      showFavorite
      showSettings
    />
  );
}
