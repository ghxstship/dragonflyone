"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Body, Button, Card, Input, DetailPage, Section } from "@ghxstship/ui";

interface SearchResult { id: string; type: "event" | "artist" | "venue"; name: string; subtitle: string; }
const DEMO: SearchResult[] = [
  { id: "1", type: "event", name: "Summer Festival 2024", subtitle: "Dec 20 • Central Park" },
  { id: "2", type: "artist", name: "The Jazz Quartet", subtitle: "Jazz • 5 upcoming events" },
  { id: "3", type: "venue", name: "Blue Note", subtitle: "New York, NY" },
];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");

  const { data: results = [], isLoading, error, refetch } = useQuery({
    queryKey: ["search", query],
    queryFn: async () => { if (!query) return DEMO; const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`); if (!r.ok) return DEMO; return (await r.json()).results?.length ? (await r.json()).results : DEMO; },
    enabled: true,
  });

  const filtered = type === "all" ? results : results.filter((r: SearchResult) => r.type === type);

  const tabs = [{
    id: "search", label: "Search", icon: <List className="size-4" />,
    content: (
      <Section>
        <div className="flex gap-4 items-center mb-6">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-grey-400" /><Input placeholder="Search events, artists, venues..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" /></div>
          <div className="flex gap-2">
            {["all", "event", "artist", "venue"].map((t) => <Button key={t} variant={type === t ? "solid" : "outline"} size="sm" onClick={() => setType(t)}>{t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1) + "s"}</Button>)}
          </div>
        </div>
        {filtered.length === 0 ? (
          <Card className="p-8 text-center"><Search className="size-12 text-grey-600 mx-auto mb-4" /><Body className="font-weight-medium mb-2">No results found</Body><Body className="text-grey-400">Try a different search term</Body></Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((result: SearchResult) => (
              <Card key={result.id} className="p-4 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(result.type === "event" ? `/e/${result.id}` : `/${result.type}s/${result.id}`)}>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{result.type}</Badge>
                  <div><Body className="font-weight-bold">{result.name}</Body><Body size="sm" className="text-grey-400">{result.subtitle}</Body></div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Discover", title: "Search", description: "Find events, artists, and venues" }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} />;
}
