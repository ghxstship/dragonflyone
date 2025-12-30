"use client";

import { useParams, useRouter } from "next/navigation";
import { Calendar, MapPin, Ticket, Users, Share2, Heart, List, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Body, Button, Card, Grid, StatCard, DetailPage, Section, SectionHeader } from "@ghxstship/ui";

interface Event { id: string; name: string; date: string; venue: string; description: string; category: string; price: number; capacity: number; sold: number; }
const DEMO_EVENT: Event = { id: "1", name: "Summer Festival 2024", date: "2024-12-20", venue: "Central Park, NYC", description: "The biggest summer festival of the year featuring top artists.", category: "Festival", price: 75, capacity: 5000, sold: 3500 };

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const { data: event = DEMO_EVENT, isLoading, error, refetch } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) return DEMO_EVENT;
      return (await response.json()).event || DEMO_EVENT;
    },
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const formatCurrency = (a: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(a);

  const tabs = [
    { id: "overview", label: "Overview", icon: <List className="size-4" />, content: (
      <Section>
        <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
          <StatCard label="Date" value={new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} icon={<Calendar className="size-5" />} />
          <StatCard label="Price" value={formatCurrency(event.price)} icon={<Ticket className="size-5" />} />
          <StatCard label="Capacity" value={event.capacity.toLocaleString()} icon={<Users className="size-5" />} />
          <StatCard label="Sold" value={`${Math.round((event.sold / event.capacity) * 100)}%`} icon={<Ticket className="size-5" />} />
        </Grid>
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="outline">{event.category}</Badge>
            <div className="flex items-center gap-2 text-on-dark-muted"><Calendar className="size-4" /><Body size="sm">{formatDate(event.date)}</Body></div>
            <div className="flex items-center gap-2 text-on-dark-muted"><MapPin className="size-4" /><Body size="sm">{event.venue}</Body></div>
          </div>
          <Body className="text-on-dark-secondary">{event.description}</Body>
        </Card>
        <Card className="p-6">
          <SectionHeader title="Get Tickets" />
          <div className="flex items-center justify-between mt-4">
            <div><Body className="font-weight-bold">From {formatCurrency(event.price)}</Body><Body size="sm" className="text-on-dark-muted">{event.capacity - event.sold} tickets remaining</Body></div>
            <Button variant="solid" icon={<Ticket className="size-4" />} iconPosition="left" onClick={() => router.push(`/e/${eventId}/tickets`)}>Buy Tickets</Button>
          </div>
        </Card>
      </Section>
    )},
    { id: "info", label: "Info", icon: <Info className="size-4" />, content: (
      <Section>
        <SectionHeader title="Event Information" />
        <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2 mt-4">
          <Card className="p-6"><Body className="font-weight-bold mb-2">Venue</Body><Body className="text-on-dark-muted">{event.venue}</Body></Card>
          <Card className="p-6"><Body className="font-weight-bold mb-2">Date & Time</Body><Body className="text-on-dark-muted">{formatDate(event.date)}</Body></Card>
        </Grid>
      </Section>
    )},
  ];

  return <DetailPage header={{ kicker: event.category, title: event.name, description: event.venue }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} actions={<><Button variant="outline" icon={<Share2 className="size-4" />} /><Button variant="outline" icon={<Heart className="size-4" />} /></>} />;
}
