"use client";

import { useState } from "react";

import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2,
  H3,
  Body,
  Input,
  Badge,
  Card,
  Stack,
  useDebounce,
} from "@ghxstship/ui";

import { DEMO_SEARCH_RESULTS } from "@/lib/demo-data";

const mockResults = DEMO_SEARCH_RESULTS;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  
  const results = debouncedQuery ? mockResults.filter(r => 
    r.title.toLowerCase().includes(debouncedQuery.toLowerCase())
  ) : [];

  return (
    <GvtewayAppLayout>
          <Stack gap={8}>
            <H2 className="text-white">Search</H2>
            <Input
              type="search"
              placeholder="Search events, venues, artists..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-ink-700 bg-black text-white text-body-md"
            />
            {debouncedQuery && (
              <Stack gap={4}>
                <Body className="font-mono text-body-sm uppercase tracking-label text-ink-400">
                  {results.length} {results.length === 1 ? "Result" : "Results"}
                </Body>
                {results.map((result) => (
                  <Card key={result.id} className="border-2 border-ink-800 p-6 bg-black">
                    <Stack gap={2}>
                      <Badge variant="outline">{result.type}</Badge>
                      <H3 className="text-white">{result.title}</H3>
                      <Body className="text-ink-400">
                        {result.location || result.genre}
                        {result.date && ` • ${result.date}`}
                        {result.capacity && ` • ${result.capacity} capacity`}
                        {result.followers && ` • ${result.followers} followers`}
                      </Body>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
    </GvtewayAppLayout>
  );
}
