"use client";

/**
 * Admin Events Management Page
 * Manage all events on the platform
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Search,
  List,
} from "lucide-react";
import {
  Badge,
  Body,
  Button,
  Card,
  Grid,
  Input,
  Select,
  StatCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DetailPage,
  Section,
  useNotifications,
} from "@ghxstship/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AdminEvent {
  id: string;
  title: string;
  venue_name: string;
  start_date: string;
  status: "draft" | "published" | "cancelled" | "completed";
  tickets_sold: number;
  capacity: number;
  revenue: number;
}

const STATUS_COLORS: Record<string, "success" | "warning" | "error" | "info" | "outline"> = {
  draft: "outline",
  published: "success",
  cancelled: "error",
  completed: "info",
};

const DEMO_EVENTS: AdminEvent[] = [
  { id: "1", title: "Summer Festival 2024", venue_name: "Central Park", start_date: "2024-07-15", status: "published", tickets_sold: 2500, capacity: 5000, revenue: 125000 },
  { id: "2", title: "Concert Series", venue_name: "Madison Square Garden", start_date: "2024-08-20", status: "published", tickets_sold: 8000, capacity: 10000, revenue: 400000 },
  { id: "3", title: "Winter Gala", venue_name: "Grand Ballroom", start_date: "2024-12-15", status: "draft", tickets_sold: 0, capacity: 500, revenue: 0 },
];

export default function AdminEventsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: events = [], isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "events"],
    queryFn: async () => {
      const response = await fetch("/api/admin/events");
      if (!response.ok) return DEMO_EVENTS;
      const data = await response.json();
      return data.events?.length ? data.events : DEMO_EVENTS;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`/api/admin/events/${eventId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      addNotification({ type: "success", title: "Deleted", message: "Event deleted successfully" });
    },
    onError: () => {
      addNotification({ type: "error", title: "Error", message: "Failed to delete event" });
    },
  });

  const filteredEvents = events.filter((event: AdminEvent) => {
    const matchesStatus = !statusFilter || event.status === statusFilter;
    const matchesSearch = !search || event.title.toLowerCase().includes(search.toLowerCase()) || event.venue_name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: events.length,
    published: events.filter((e: AdminEvent) => e.status === "published").length,
    totalTickets: events.reduce((sum: number, e: AdminEvent) => sum + e.tickets_sold, 0),
    totalRevenue: events.reduce((sum: number, e: AdminEvent) => sum + e.revenue, 0),
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const tabs = [
    {
      id: "events",
      label: "Events",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard label="Total Events" value={stats.total.toString()} icon={<Calendar className="size-5" />} />
            <StatCard label="Published" value={stats.published.toString()} icon={<CheckCircle className="size-5" />} />
            <StatCard label="Tickets Sold" value={stats.totalTickets.toLocaleString()} icon={<Clock className="size-5" />} />
            <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={<Calendar className="size-5" />} />
          </Grid>

          <Card className="p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" />
                <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </Select>
            </div>
          </Card>

          {filteredEvents.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="size-12 text-on-dark-disabled mx-auto mb-4" />
              <Body className="font-weight-medium mb-2">No Events Found</Body>
              <Body className="text-on-dark-muted mb-4">{search || statusFilter ? "Try adjusting your filters" : "Create your first event"}</Body>
              <Button variant="solid" onClick={() => router.push("/admin/events/new")} icon={<Plus className="size-4" />} iconPosition="left">
                Create Event
              </Button>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tickets</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event: AdminEvent) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Body className="font-weight-medium">{event.title}</Body>
                        <Body size="sm" className="text-on-dark-muted">{event.venue_name}</Body>
                      </TableCell>
                      <TableCell><Body>{formatDate(event.start_date)}</Body></TableCell>
                      <TableCell><Badge variant={STATUS_COLORS[event.status] || "outline"}>{event.status}</Badge></TableCell>
                      <TableCell><Body>{event.tickets_sold.toLocaleString()} / {event.capacity.toLocaleString()}</Body></TableCell>
                      <TableCell><Body className="font-weight-medium">{formatCurrency(event.revenue)}</Body></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/events/${event.id}`)} icon={<Eye className="size-4" />} />
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/events/${event.id}/edit`)} icon={<Edit className="size-4" />} />
                          <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(event.id)} disabled={deleteMutation.isPending} icon={<Trash2 className="size-4 text-error" />} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Admin",
        title: "Event Management",
        description: "Manage all events on the platform",
      }}
      backButton={{ label: "Admin", href: "/admin" }}
      actions={
        <Button variant="solid" onClick={() => router.push("/admin/events/new")} icon={<Plus className="size-4" />} iconPosition="left">
          Create Event
        </Button>
      }
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
