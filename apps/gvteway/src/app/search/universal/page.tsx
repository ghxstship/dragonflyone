'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ConsumerNavigationPublic } from '../../../components/navigation';
import {
  Container,
  Section,
  H1,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Grid,
  Stack,
  Badge,
  Tabs,
  LoadingSpinner,
  ProjectCard,
  Figure,
} from '@ghxstship/ui';
import Image from 'next/image';

interface SearchResult {
  id: string;
  type: 'event' | 'artist' | 'venue' | 'genre';
  title: string;
  subtitle?: string;
  image?: string;
  metadata?: string;
  tags?: string[];
}

function UniversalSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        ...(activeTab !== 'all' && { type: activeTab }),
      });

      const response = await fetch(`/api/search/universal?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (err) {
      console.error('Search failed');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query) {
        fetchResults(query);
        // Save to recent searches
        setRecentSearches(prev => {
          const updated = [query, ...prev.filter(s => s !== query)].slice(0, 5);
          localStorage.setItem('recentSearches', JSON.stringify(updated));
          return updated;
        });
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, fetchResults]);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const filteredResults = useMemo(() => {
    if (activeTab === 'all') return results;
    return results.filter(r => r.type === activeTab);
  }, [results, activeTab]);

  const resultCounts = useMemo(() => ({
    all: results.length,
    event: results.filter(r => r.type === 'event').length,
    artist: results.filter(r => r.type === 'artist').length,
    venue: results.filter(r => r.type === 'venue').length,
    genre: results.filter(r => r.type === 'genre').length,
  }), [results]);

  const handleResultClick = (result: SearchResult) => {
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

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event': return '🎫';
      case 'artist': return '🎤';
      case 'venue': return '🏟️';
      case 'genre': return '🎵';
      default: return '🔍';
    }
  };

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
        <Stack gap={2} className="border-b-2 border-black pb-8">
          <H1>Search</H1>
          <Stack className="mt-4 max-w-2xl">
            <Field label="">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, artists, venues, genres..."
                className="text-xl py-4"
              />
            </Field>
          </Stack>
        </Stack>

        {!query && recentSearches.length > 0 && (
          <Section className="mb-8">
            <Stack direction="horizontal" className="justify-between items-center mb-4">
              <H3>RECENT SEARCHES</H3>
              <Button variant="ghost" size="sm" onClick={handleClearRecent}>
                Clear
              </Button>
            </Stack>
            <Stack direction="horizontal" gap={2} className="flex-wrap">
              {recentSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => setQuery(search)}
                >
                  {search}
                </Button>
              ))}
            </Stack>
          </Section>
        )}

        {query && (
          <Stack gap={6}>
            <Stack direction="horizontal" gap={2} className="border-b border-grey-200 pb-4">
              <Button
                variant={activeTab === 'all' ? 'solid' : 'ghost'}
                onClick={() => setActiveTab('all')}
              >
                All ({resultCounts.all})
              </Button>
              <Button
                variant={activeTab === 'event' ? 'solid' : 'ghost'}
                onClick={() => setActiveTab('event')}
              >
                Events ({resultCounts.event})
              </Button>
              <Button
                variant={activeTab === 'artist' ? 'solid' : 'ghost'}
                onClick={() => setActiveTab('artist')}
              >
                Artists ({resultCounts.artist})
              </Button>
              <Button
                variant={activeTab === 'venue' ? 'solid' : 'ghost'}
                onClick={() => setActiveTab('venue')}
              >
                Venues ({resultCounts.venue})
              </Button>
              <Button
                variant={activeTab === 'genre' ? 'solid' : 'ghost'}
                onClick={() => setActiveTab('genre')}
              >
                Genres ({resultCounts.genre})
              </Button>
            </Stack>

            {loading ? (
              <Stack className="items-center py-12">
                <LoadingSpinner size="lg" />
              </Stack>
            ) : filteredResults.length > 0 ? (
              <Grid cols={3} gap={6}>
                {filteredResults.map(result => (
                  <Card
                    key={`${result.type}-${result.id}`}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleResultClick(result)}
                  >
                    {result.image && (
                      <Figure className="relative h-40 bg-grey-100 overflow-hidden">
                        <Image
                          src={result.image}
                          alt={result.title}
                          fill
                          className="object-cover"
                        />
                      </Figure>
                    )}
                    <Stack className="p-4" gap={2}>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Body>{getTypeIcon(result.type)}</Body>
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                      </Stack>
                      <H3>{result.title}</H3>
                      {result.subtitle && (
                        <Body className="text-grey-600">{result.subtitle}</Body>
                      )}
                      {result.metadata && (
                        <Body className="text-sm text-grey-500">{result.metadata}</Body>
                      )}
                      {result.tags && result.tags.length > 0 && (
                        <Stack direction="horizontal" gap={1} className="flex-wrap mt-2">
                          {result.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Grid>
            ) : (
              <Card className="p-12 text-center">
                <H3 className="mb-4">NO RESULTS FOUND</H3>
                <Body className="text-grey-600">
                  Try different keywords or browse our categories.
                </Body>
              </Card>
            )}
          </Stack>
        )}

        {!query && (
          <Section>
            <H2 className="mb-6">BROWSE BY CATEGORY</H2>
            <Grid cols={4} gap={4}>
              {['Concerts', 'Festivals', 'Theater', 'Sports', 'Comedy', 'Nightlife', 'Family', 'Arts'].map(category => (
                <Card
                  key={category}
                  className="p-6 text-center cursor-pointer hover:bg-grey-50 transition-colors"
                  onClick={() => router.push(`/browse?category=${category.toLowerCase()}`)}
                >
                  <H3>{category.toUpperCase()}</H3>
                </Card>
              ))}
            </Grid>
          </Section>
        )}
        </Stack>
      </Container>
    </Section>
  );
}

export default function UniversalSearchPage() {
  return (
    <Suspense fallback={
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading..." />
        </Container>
      </Section>
    }>
      <UniversalSearchContent />
    </Suspense>
  );
}
