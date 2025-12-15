"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2,
  H3,
  Body,
  Input,
  Badge,
  Card,
  Stack,
  Kicker,
  Alert,
  useDebounce,
} from "@ghxstship/ui";

import { useUniversalSearchData, SearchResult } from "@/hooks/useUniversalSearch";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  
  const { results, isLoading, error } = useUniversalSearchData(debouncedQuery);

  const handleResultClick = (result: { id: string; type: string }) => {
    switch (result.type) {
      case 'event':
        router.push(`/events/${result.id}`);
        break;
      case 'artist':
        router.push(`/artists/${result.id}`);
        break;
      case 'venue':
        router.push(`/venues/${result.id}`);
        break;
      case 'genre':
        router.push(`/browse?category=${result.id}`);
        break;
    }
  };

  return (
    <GvtewayAppLayout>
      <Stack gap={10}>
        <Stack gap={2}>
          <Kicker colorScheme="on-dark">Find</Kicker>
          <H2 size="lg" className="text-white">Search</H2>
          <Body className="text-on-dark-muted">Search events, venues, artists, and more</Body>
        </Stack>

        <Input
          type="search"
          placeholder="Search events, venues, artists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border-ink-700 bg-black text-white text-body-md"
        />

        {error && (
          <Alert variant="error">
            Failed to load search results. Please try again.
          </Alert>
        )}

        {isLoading && debouncedQuery && (
          <Body className="text-on-dark-muted">Searching...</Body>
        )}

        {debouncedQuery && !isLoading && (
          <Stack gap={4}>
            <Body className="font-mono uppercase tracking-label text-ink-400">
              {results.length} {results.length === 1 ? "Result" : "Results"}
            </Body>
            
            {results.length === 0 ? (
              <Card className="border-2 border-ink-800 p-6 bg-black">
                <Stack gap={2} className="items-center text-center">
                  <H3 className="text-white">No results found</H3>
                  <Body className="text-ink-400">
                    Try adjusting your search terms or browse all events
                  </Body>
                </Stack>
              </Card>
            ) : (
              results.map((result: SearchResult) => (
                <Card 
                  key={`${result.type}-${result.id}`} 
                  className="border-2 border-ink-800 p-6 bg-black cursor-pointer hover:border-ink-600 transition-colors"
                  onClick={() => handleResultClick(result)}
                >
                  <Stack gap={2}>
                    <Badge variant="outline">{result.type}</Badge>
                    <H3 className="text-white">{result.title}</H3>
                    <Body className="text-ink-400">
                      {result.subtitle}
                      {result.metadata && ` • ${result.metadata}`}
                    </Body>
                    {result.tags && result.tags.length > 0 && (
                      <Stack direction="horizontal" gap={2}>
                        {result.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" size="sm">{tag}</Badge>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Card>
              ))
            )}
          </Stack>
        )}
      </Stack>
    </GvtewayAppLayout>
  );
}
