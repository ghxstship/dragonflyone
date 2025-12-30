"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, MapPin, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Body, Button, Card, Input, Grid as GridLayout, DetailPage, Section, Box} from "@ghxstship/ui";

interface Event { id: string; name: string; date: string; venue: string; category: string; price: number; image: string; }
const DEMO_EVENTS: Event[] = [
  { id: "1", name: "Summer Festival 2024", date: "2024-12-20", venue: "Central Park", category: "Festival", price: 75, image: "" },
  { id: "2", name: "Jazz Night", date: "2024-12-22", venue: "Blue Note", category: "Concert", price: 45, image: "" },
  { id: "3", name: "Comedy Show", date: "2024-12-25", venue: "Laugh Factory", category: "Comedy", price: 35, image: "" },
];

export default function BrowsePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: events = [], isLoading, error, refetch } = useQuery({
    queryKey: ["browse-events"],
    queryFn: async () => {
      const response = await fetch("/api/events");
      if (!response.ok) return DEMO_EVENTS;
      return (await response.json()).events?.length ? (await response.json()).events : DEMO_EVENTS;
    },
  });

  const categories: string[] = ["all", ...Array.from(new Set(events.map((e: Event) => e.category))) as string[]];
  const filteredEvents = events.filter((e: Event) => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === "all" || e.category === category;
    return matchesSearch && matchesCat;
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const formatCurrency = (a: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(a);

  const tabs = [{
    id: "events", label: "Events", icon: <List className="size-4" />,
    content: (
      <Section>
        <Box className="flex gap-4 items-center mb-6">
          <Box className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" />
            <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </Box>
          <Box className="flex gap-2">
            {categories.map((cat) => (
              <Button key={cat} variant={category === cat ? "solid" : "outline"} size="sm" onClick={() => setCategory(cat)}>{cat === "all" ? "All" : cat}</Button>
            ))}
          </Box>
        </Box>
        <GridLayout cols={3} gap={6} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event: Event) => (
            <Card key={event.id} className="overflow-hidden cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(`/e/${event.id}`)}>
              <Box className="h-40 bg-grey-800 flex items-center justify-center"><Calendar className="size-12 text-on-dark-disabled" /></Box>
              <Box className="p-4">
                <Badge variant="outline" className="mb-2">{event.category}</Badge>
                <Body className="font-weight-bold">{event.name}</Body>
                <Box className="flex items-center gap-2 mt-2 text-on-dark-muted"><Calendar className="size-4" /><Body size="sm">{formatDate(event.date)}</Body></Box>
                <Box className="flex items-center gap-2 text-on-dark-muted"><MapPin className="size-4" /><Body size="sm">{event.venue}</Body></Box>
                <Body className="font-weight-bold mt-3">From {formatCurrency(event.price)}</Body>
              </Box>
            </Card>
          ))}
        </GridLayout>
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Discover", title: "Browse Events", description: "Find your next experience" }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} />;
}
