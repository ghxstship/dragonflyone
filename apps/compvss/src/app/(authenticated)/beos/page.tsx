"use client";

/**
 * BEOs (Banquet Event Orders) List Page
 * Uses ListPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Badge, ListPage, type ListPageFilter } from "@ghxstship/ui";

interface BEO {
  id: string;
  event_name: string;
  client: string;
  date: string;
  status: "draft" | "pending" | "approved" | "completed";
  total: number;
  guests: number;
}

const DEMO_BEOS: BEO[] = [
  { id: "1", event_name: "Corporate Gala 2024", client: "Acme Corp", date: "2024-12-20", status: "approved", total: 45000, guests: 200 },
  { id: "2", event_name: "Wedding Reception", client: "Smith Family", date: "2024-12-25", status: "pending", total: 25000, guests: 150 },
  { id: "3", event_name: "Product Launch", client: "Tech Inc", date: "2025-01-15", status: "draft", total: 35000, guests: 100 },
];

const STATUS_CONFIG = {
  draft: { label: "Draft", variant: "outline" as const },
  pending: { label: "Pending", variant: "warning" as const },
  approved: { label: "Approved", variant: "success" as const },
  completed: { label: "Completed", variant: "info" as const },
};

export default function BEOsPage() {
  const router = useRouter();

  const { data: beos = [], isLoading, error, refetch } = useQuery<BEO[]>({
    queryKey: ["beos"],
    queryFn: async () => {
      const response = await fetch("/api/beos");
      if (!response.ok) return DEMO_BEOS;
      const data = await response.json();
      return data.beos?.length ? data.beos : DEMO_BEOS;
    },
  });

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const filterOptions: ListPageFilter[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "all", label: "All" },
        { value: "draft", label: "Draft" },
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "completed", label: "Completed" },
      ],
    },
  ];

  return (
    <ListPage
      title="Banquet Event Orders"
      subtitle="Manage your event orders and catering"
      data={beos}
      columns={[
        { key: "event_name", label: "Event", accessor: "event_name" },
        { key: "client", label: "Client", accessor: "client" },
        { key: "date", label: "Date", accessor: (row: BEO) => formatDate(row.date) },
        { key: "guests", label: "Guests", accessor: "guests" },
        { key: "total", label: "Total", accessor: (row: BEO) => formatCurrency(row.total) },
        { key: "status", label: "Status", accessor: (row: BEO) => <Badge variant={STATUS_CONFIG[row.status].variant}>{STATUS_CONFIG[row.status].label}</Badge> },
      ]}
      rowKey="id"
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      filters={filterOptions}
      onCreate={() => router.push("/beos/new")}
      createLabel="New BEO"
      emptyMessage="No BEOs found"
      emptyAction={{ label: "Create BEO", onClick: () => router.push("/beos/new") }}
      onRowClick={(beo) => router.push(`/beos/${beo.id}`)}
    />
  );
}
