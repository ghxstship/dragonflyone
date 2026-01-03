"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Search, Plus, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Body, Button, Card, Input, DetailPage, Section, Box, Stack } from "@ghxstship/ui";

interface Event { id: string; name: string; date: string; venue: string; status: "draft" | "published" | "sold_out"; tickets_sold: number; }
const DEMO_EVENTS: Event[] = [
  { id: "1", name: "Summer Festival 2024", date: "2024-12-20", venue: "Central Park", status: "published", tickets_sold: 1500 },
  { id: "2", name: "Jazz Night", date: "2024-12-22", venue: "Blue Note", status: "published", tickets_sold: 200 },
];

const STATUS_CONFIG = { draft: { label: "Draft", variant: "outline" as const }, published: { label: "Published", variant: "success" as const }, sold_out: { label: "Sold Out", variant: "error" as const } };

export default function EventsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: events = [], isLoading, error, refetch } = useQuery({
    queryKey: ["my-events"],
    queryFn: async () => {
      const response = await fetch("/api/events/mine");
      if (!response.ok) return DEMO_EVENTS;
      return (await response.json()).events?.length ? (await response.json()).events : DEMO_EVENTS;
    },
  });

  const filteredEvents = events.filter((e: Event) => e.name.toLowerCase().includes(search.toLowerCase()));
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const tabs = [{
    id: "events", label: "Events", icon: <List className="size-4" />,
    content: (
      <Section>
        <Box className="flex gap-4 items-center mb-6">
          <Box className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
            <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </Box>
        </Box>
        {filteredEvents.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="size-12 text-text-disabled mx-auto mb-4" />
            <Body className="font-weight-medium mb-2">No events yet</Body>
            <Body className="text-text-muted mb-4">Create your first event</Body>
            <Button variant="solid" onClick={() => router.push("/events/create")}>Create Event</Button>
          </Card>
        ) : (
          <Stack gap={4}>
            {filteredEvents.map((event: Event) => (
              <Card key={event.id} className="p-6 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(`/e/${event.id}`)}>
                <Box className="flex items-start justify-between">
                  <Box>
                    <Body className="font-weight-bold">{event.name}</Body>
                    <Box className="flex items-center gap-4 mt-2 text-text-muted">
                      <Box className="flex items-center gap-1"><Calendar className="size-4" /><Body size="sm">{formatDate(event.date)}</Body></Box>
                      <Box className="flex items-center gap-1"><MapPin className="size-4" /><Body size="sm">{event.venue}</Body></Box>
                    </Box>
                  </Box>
                  <Box className="text-right">
                    <Body className="font-weight-bold">{event.tickets_sold} sold</Body>
                    <Badge variant={STATUS_CONFIG[event.status].variant} className="mt-2">{STATUS_CONFIG[event.status].label}</Badge>
                  </Box>
                </Box>
              </Card>
            ))}
          </Stack>
        )}
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Manage", title: "My Events", description: "Manage your events" }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} actions={<Button variant="solid" icon={<Plus className="size-4" />} iconPosition="left" onClick={() => router.push("/events/create")}>Create Event</Button>} />;
}
