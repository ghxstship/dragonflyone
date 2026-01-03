"use client";

/**
 * Production Shows Page
 * Show management for production
 * Uses DetailPage template for consistent layout
 */

import { useParams } from "next/navigation";
import { Calendar, Plus, Clock, MapPin, Users, List, LayoutGrid } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge, Body, Button, Card, Grid, StatCard, DetailPage, Section, SectionHeader, Box, Stack } from "@ghxstship/ui";

interface Show {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  capacity: number;
  tickets_sold: number;
  status: "scheduled" | "on_sale" | "sold_out" | "completed";
}

const DEMO_SHOWS: Show[] = [
  { id: "1", name: "Opening Night", date: "2024-12-20", time: "19:00", venue: "Main Stage", capacity: 5000, tickets_sold: 4500, status: "on_sale" },
  { id: "2", name: "Saturday Matinee", date: "2024-12-21", time: "14:00", venue: "Main Stage", capacity: 5000, tickets_sold: 3200, status: "on_sale" },
  { id: "3", name: "Saturday Evening", date: "2024-12-21", time: "20:00", venue: "Main Stage", capacity: 5000, tickets_sold: 5000, status: "sold_out" },
  { id: "4", name: "Sunday Finale", date: "2024-12-22", time: "18:00", venue: "Main Stage", capacity: 5000, tickets_sold: 2800, status: "on_sale" },
];

const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", variant: "outline" as const },
  on_sale: { label: "On Sale", variant: "success" as const },
  sold_out: { label: "Sold Out", variant: "warning" as const },
  completed: { label: "Completed", variant: "info" as const },
};

export default function ProductionShowsPage() {
  const params = useParams();
  const productionId = params.productionId as string;

  const { data: shows = [], isLoading, error, refetch } = useQuery({
    queryKey: ["production-shows", productionId],
    queryFn: async () => {
      const response = await fetch(`/api/productions/${productionId}/shows`);
      if (!response.ok) return DEMO_SHOWS;
      const data = await response.json();
      return data.shows?.length ? data.shows : DEMO_SHOWS;
    },
  });

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const totalCapacity = shows.reduce((sum: number, s: Show) => sum + s.capacity, 0);
  const totalSold = shows.reduce((sum: number, s: Show) => sum + s.tickets_sold, 0);

  const tabs = [
    {
      id: "shows",
      label: "Shows",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
            <StatCard label="Total Shows" value={shows.length.toString()} icon={<Calendar className="size-5" />} />
            <StatCard label="Total Capacity" value={totalCapacity.toLocaleString()} icon={<Users className="size-5" />} />
            <StatCard label="Tickets Sold" value={totalSold.toLocaleString()} icon={<Users className="size-5" />} />
            <StatCard label="Sell-through" value={`${Math.round((totalSold / totalCapacity) * 100)}%`} icon={<Users className="size-5" />} />
          </Grid>

          <Stack gap={4}>
            {shows.map((show: Show) => {
              const statusConfig = STATUS_CONFIG[show.status];
              const sellThrough = Math.round((show.tickets_sold / show.capacity) * 100);
              return (
                <Card key={show.id} className="p-6">
                  <Box className="flex items-start justify-between">
                    <Box>
                      <Body className="font-weight-bold font-weight-medium">{show.name}</Body>
                      <Box className="flex items-center gap-4 mt-2 text-text-muted">
                        <Box className="flex items-center gap-1"><Calendar className="size-4" /><Body size="sm">{formatDate(show.date)}</Body></Box>
                        <Box className="flex items-center gap-1"><Clock className="size-4" /><Body size="sm">{show.time}</Body></Box>
                        <Box className="flex items-center gap-1"><MapPin className="size-4" /><Body size="sm">{show.venue}</Body></Box>
                      </Box>
                    </Box>
                    <Box className="text-right">
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                      <Box className="mt-2">
                        <Body className="font-weight-bold">{show.tickets_sold.toLocaleString()} / {show.capacity.toLocaleString()}</Body>
                        <Body size="sm" className="text-text-muted">{sellThrough}% sold</Body>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Stack>
        </Section>
      ),
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: <LayoutGrid className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Show Calendar" description="View shows on a calendar" />
          <Card className="p-8 text-center mt-4">
            <Calendar className="size-12 text-text-disabled mx-auto mb-4" />
            <Body className="font-weight-medium font-weight-medium mb-2">Calendar View</Body>
            <Body className="text-text-muted">Calendar visualization coming soon</Body>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Production",
        title: "Shows",
        description: "Manage production shows and performances",
      }}
      backButton={{ label: "Overview", href: `/p/${productionId}/overview` }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
      actions={<Button variant="solid" icon={<Plus className="size-4" />} iconPosition="left">Add Show</Button>}
    />
  );
}
