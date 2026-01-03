"use client";

/**
 * Admin Ticketing Management Page
 * 
 * SSOT-compliant: Uses entity registry for status colors.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ticket,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Users,
  TrendingUp,
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
  ProgressBar,
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
  useToast,
  Box,
  Stack,
} from "@ghxstship/ui";
import { TICKET_STATUS_COLORS } from "@ghxstship/config";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TicketType {
  id: string;
  event_id: string;
  event_title: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  status: "active" | "sold_out" | "inactive";
}

const STATUS_COLORS = TICKET_STATUS_COLORS;

const DEMO_TICKETS: TicketType[] = [
  { id: "1", event_id: "e1", event_title: "Summer Festival 2024", name: "General Admission", price: 75, quantity: 3000, sold: 2100, status: "active" },
  { id: "2", event_id: "e1", event_title: "Summer Festival 2024", name: "VIP Pass", price: 299, quantity: 500, sold: 400, status: "active" },
  { id: "3", event_id: "e2", event_title: "Concert Series", name: "Floor Seats", price: 150, quantity: 2000, sold: 2000, status: "sold_out" },
  { id: "4", event_id: "e2", event_title: "Concert Series", name: "Balcony", price: 85, quantity: 3000, sold: 1500, status: "active" },
];

export default function AdminTicketingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: tickets = [], isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "ticketing"],
    queryFn: async () => {
      const response = await fetch("/api/admin/ticketing");
      if (!response.ok) return DEMO_TICKETS;
      const data = await response.json();
      return data.tickets?.length ? data.tickets : DEMO_TICKETS;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await fetch(`/api/admin/ticketing/${ticketId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete ticket type");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ticketing"] });
      toast.success("Deleted", "Ticket type deleted");
    },
    onError: () => {
      toast.error("Error", "Failed to delete ticket type");
    },
  });

  const filteredTickets = tickets.filter((ticket: TicketType) => {
    const matchesStatus = !statusFilter || ticket.status === statusFilter;
    const matchesSearch = !search || ticket.name.toLowerCase().includes(search.toLowerCase()) || ticket.event_title.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    totalTypes: tickets.length,
    totalSold: tickets.reduce((sum: number, t: TicketType) => sum + t.sold, 0),
    totalRevenue: tickets.reduce((sum: number, t: TicketType) => sum + t.sold * t.price, 0),
    soldOut: tickets.filter((t: TicketType) => t.status === "sold_out").length,
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);

  const tabs = [
    {
      id: "tickets",
      label: "Tickets",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard label="Ticket Types" value={stats.totalTypes.toString()} icon={<Ticket className="size-5" />} />
            <StatCard label="Total Sold" value={stats.totalSold.toLocaleString()} icon={<Users className="size-5" />} />
            <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={<DollarSign className="size-5" />} />
            <StatCard label="Sold Out" value={stats.soldOut.toString()} icon={<TrendingUp className="size-5" />} />
          </Grid>

          <Card className="p-4 mb-6">
            <Box className="flex items-center gap-4">
              <Box className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
                <Input placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </Box>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="sold_out">Sold Out</option>
                <option value="inactive">Inactive</option>
              </Select>
            </Box>
          </Card>

          {filteredTickets.length === 0 ? (
            <Card className="p-12 text-center">
              <Ticket className="size-12 text-text-disabled mx-auto mb-4" />
              <Body className="font-weight-medium mb-2">No Ticket Types Found</Body>
              <Body className="text-text-muted mb-4">{search || statusFilter ? "Try adjusting your filters" : "Create your first ticket type"}</Body>
              <Button variant="solid" onClick={() => router.push("/admin/ticketing/new")} icon={<Plus className="size-4" />} iconPosition="left">
                Create Ticket Type
              </Button>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket Type</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Sold / Available</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket: TicketType) => (
                    <TableRow key={ticket.id}>
                      <TableCell><Body className="font-weight-medium">{ticket.name}</Body></TableCell>
                      <TableCell><Body>{ticket.event_title}</Body></TableCell>
                      <TableCell><Body className="font-weight-medium">{formatCurrency(ticket.price)}</Body></TableCell>
                      <TableCell>
                        <Stack gap={1}>
                          <Body size="sm">{ticket.sold.toLocaleString()} / {ticket.quantity.toLocaleString()}</Body>
                          <ProgressBar value={(ticket.sold / ticket.quantity) * 100} size="sm" />
                        </Stack>
                      </TableCell>
                      <TableCell><Badge variant={STATUS_COLORS[ticket.status] || "outline"}>{ticket.status.replace("_", " ")}</Badge></TableCell>
                      <TableCell><Body className="font-weight-medium">{formatCurrency(ticket.sold * ticket.price)}</Body></TableCell>
                      <TableCell>
                        <Box className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/ticketing/${ticket.id}/edit`)} icon={<Edit className="size-4" />} />
                          <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(ticket.id)} disabled={deleteMutation.isPending} icon={<Trash2 className="size-4 text-error" />} />
                        </Box>
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
        title: "Ticketing Management",
        description: "Manage ticket types, pricing, and inventory",
      }}
      backButton={{ label: "Admin", href: "/admin" }}
      actions={
        <Button variant="solid" onClick={() => router.push("/admin/ticketing/new")} icon={<Plus className="size-4" />} iconPosition="left">
          Create Ticket Type
        </Button>
      }
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
