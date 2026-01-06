"use client";

/**
 * BEOs (Banquet Event Orders) List Page
 * Uses ListPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ListPage } from "@ghxstship/ui";
import { getEntityColumns, getEntityFilters } from "@ghxstship/config";

interface BEO {
  id: string;
  event_name: string;
  client: string;
  date: string;
  status: "draft" | "pending" | "approved" | "completed";
  total: number;
  guests: number;
}

export default function BEOsPage() {
  const router = useRouter();

  const { data: beos = [], isLoading, error, refetch } = useQuery<BEO[]>({
    queryKey: ["beos"],
    queryFn: async () => {
      const response = await fetch("/api/beos");
      if (!response.ok) {
        throw new Error(`Failed to fetch BEOs: ${response.status}`);
      }
      const data = await response.json();
      return data.beos || [];
    },
  });

  const columns = getEntityColumns<BEO>('beos');
  const filters = getEntityFilters('beos');

  return (
    <ListPage
      title="Banquet Event Orders"
      subtitle="Manage your event orders and catering"
      data={beos}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      filters={filters}
      onCreate={() => router.push("/beos/new")}
      createLabel="New BEO"
      emptyMessage="No BEOs found"
      emptyAction={{ label: "Create BEO", onClick: () => router.push("/beos/new") }}
      onRowClick={(beo: BEO) => router.push(`/beos/${beo.id}`)}
    />
  );
}
