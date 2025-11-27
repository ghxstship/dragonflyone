"use client";

import { useEffect, useMemo, useState } from "react";
import { Input, Switch, Button, Stack, Grid, Label, Badge, Article, H3, Body, Display, Radio } from "@ghxstship/ui";
import type { GvtewayEvent } from "../data/gvteway";

type PriceFilter = "all" | "$" | "$$" | "$$$";

const priceFilters: PriceFilter[] = ["all", "$", "$$", "$$$"];

const alertCadence = [
  { id: "daily", label: "Daily Digest" },
  { id: "instant", label: "Instant Pings" },
  { id: "weekly", label: "Weekly Summary" },
];

type SavedSearch = {
  name: string;
  criteria: {
    query: string;
    priceFilter: PriceFilter;
    nearbyOnly: boolean;
    lastMinuteOnly: boolean;
    trendingOnly: boolean;
    newOnly: boolean;
    cadence: string;
  };
};

export function ExperienceDiscovery() {
  const [query, setQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [lastMinuteOnly, setLastMinuteOnly] = useState(false);
  const [trendingOnly, setTrendingOnly] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [events, setEvents] = useState<GvtewayEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [newSavedSearch, setNewSavedSearch] = useState("");
  const [selectedCadence, setSelectedCadence] = useState("daily");

  const filters = useMemo(
    () => ({
      query,
      priceFilter,
      nearbyOnly,
      lastMinuteOnly,
      trendingOnly,
      newOnly,
    }),
    [query, priceFilter, nearbyOnly, lastMinuteOnly, trendingOnly, newOnly],
  );

  useEffect(() => {
    const params = new URLSearchParams({
      query: filters.query,
      priceRange: filters.priceFilter,
      nearbyOnly: String(filters.nearbyOnly),
      lastMinuteOnly: String(filters.lastMinuteOnly),
      trendingOnly: String(filters.trendingOnly),
      newOnly: String(filters.newOnly),
    });
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    fetch(`/api/events?${params.toString()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load events");
        return response.json();
      })
      .then((payload: { events: GvtewayEvent[] }) => {
        setEvents(payload.events);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
    return () => controller.abort();
  }, [filters]);

  useEffect(() => {
    // Use default saved searches for demo - API requires authentication
    setSavedSearches([
      {
        name: "Near Me Weekend",
        criteria: {
          query: "",
          priceFilter: "all",
          nearbyOnly: true,
          lastMinuteOnly: false,
          trendingOnly: true,
          newOnly: false,
          cadence: "daily",
        },
      },
      {
        name: "VIP Immersion",
        criteria: {
          query: "VIP",
          priceFilter: "$$$",
          nearbyOnly: false,
          lastMinuteOnly: false,
          trendingOnly: true,
          newOnly: false,
          cadence: "instant",
        },
      },
    ]);
  }, []);

  const handleSaveSearch = () => {
    const trimmed = newSavedSearch.trim();
    if (trimmed && !savedSearches.find((search) => search.name === trimmed)) {
      const payload: SavedSearch = {
        name: trimmed,
        criteria: {
          query,
          priceFilter,
          nearbyOnly,
          lastMinuteOnly,
          trendingOnly,
          newOnly,
          cadence: selectedCadence,
        },
      };
      // Add to local state for demo (API requires authentication)
      setSavedSearches((prev) => [...prev, payload]);
      setNewSavedSearch("");
    }
  };

  const stats = useMemo(() => {
    return {
      matches: events.length,
      saved: savedSearches.length,
      friends: events.reduce((acc: number, event: GvtewayEvent) => acc + event.friendsAttending, 0),
    };
  }, [events, savedSearches]);

  return (
    <Stack gap={8}>
      <Grid cols={2} gap={6} className="lg:grid-cols-[2fr_1fr]">
        <Stack gap={4}>
          <Label className="text-mono-xs uppercase tracking-kicker text-ink-500">Universal Search</Label>
          <Input
            type="search"
            placeholder="Search artists, venues, cities, vibes"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="font-code text-body-sm uppercase tracking-label"
          />
          <Stack direction="horizontal" gap={3} className="flex-wrap">
            {priceFilters.map((price) => (
              <Button
                key={price}
                variant={priceFilter === price ? "solid" : "outline"}
                size="sm"
                onClick={() => setPriceFilter(price)}
              >
                {price === "all" ? "All Prices" : price}
              </Button>
            ))}
          </Stack>
        </Stack>
        <Stack gap={4}>
          <Label className="text-mono-xs uppercase tracking-kicker text-ink-500">Alert Preferences</Label>
          <Stack gap={3}>
            <Input
              placeholder="Name this saved search"
              value={newSavedSearch}
              onChange={(event) => setNewSavedSearch(event.target.value)}
              className="font-code text-mono-xs uppercase tracking-label"
            />
            <Stack direction="horizontal" gap={3} className="flex-wrap text-mono-xs uppercase tracking-label text-ink-400">
              {alertCadence.map((cadence) => (
                <Radio
                  key={cadence.id}
                  name="alert-cadence"
                  value={cadence.id}
                  label={cadence.label}
                  checked={selectedCadence === cadence.id}
                  onChange={() => setSelectedCadence(cadence.id)}
                />
              ))}
            </Stack>
            <Button onClick={handleSaveSearch} variant="outline" size="sm">
              Save search + alerts
            </Button>
          </Stack>
        </Stack>
      </Grid>

      <Grid cols={4} gap={4} className="md:grid-cols-2 lg:grid-cols-4">
        <Switch label="Near me <50mi" checked={nearbyOnly} onChange={() => setNearbyOnly((prev) => !prev)} />
        <Switch label="Last-minute deals" checked={lastMinuteOnly} onChange={() => setLastMinuteOnly((prev) => !prev)} />
        <Switch label="Trending now" checked={trendingOnly} onChange={() => setTrendingOnly((prev) => !prev)} />
        <Switch label="New drops" checked={newOnly} onChange={() => setNewOnly((prev) => !prev)} />
      </Grid>

      <Stack direction="horizontal" gap={4} className="flex-col border border-ink-800 p-4 lg:flex-row lg:items-center lg:justify-between">
        <Stack direction="horizontal" gap={4} className="flex-wrap text-body-sm text-ink-300">
          <Stat label="Matches" value={stats.matches.toString()} />
          <Stat label="Saved Filters" value={stats.saved.toString()} />
          <Stat label="Friends attending" value={stats.friends.toString()} />
        </Stack>
        <Stack direction="horizontal" gap={2} className="flex-wrap text-mono-xs uppercase tracking-label text-ink-400">
          {savedSearches.map((search) => (
            <Badge key={search.name} variant="outline">
              {search.name}
            </Badge>
          ))}
        </Stack>
      </Stack>

      {error ? (
        <Body className="text-body-sm text-error-400">{error}</Body>
      ) : null}

      {isLoading ? (
        <Body className="text-body-sm uppercase tracking-kicker text-ink-400">Loading events…</Body>
      ) : (
        <Grid cols={3} gap={6} className="md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <Article key={event.id} variant="bordered" className="p-6">
              <Stack direction="horizontal" className="items-center justify-between text-mono-xs uppercase tracking-kicker text-ink-500">
                <Body>{event.city}</Body>
                <Body>{new Date(event.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</Body>
              </Stack>
              <H3 className="mt-3 text-h5-md uppercase text-white">{event.title}</H3>
              <Body className="text-body-sm text-ink-400">{event.headliner}</Body>
              <Stack direction="horizontal" gap={2} className="mt-4 flex-wrap text-[0.6rem] uppercase tracking-label text-ink-400">
                {event.genres.map((genre: string) => (
                  <Badge key={genre} variant="outline">
                    {genre}
                  </Badge>
                ))}
                <Badge variant="outline">{event.priceRange}</Badge>
              </Stack>
              <Stack direction="horizontal" gap={2} className="mt-4 flex-wrap text-mono-xs text-ink-300">
                {event.experienceTags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="uppercase tracking-label">
                    {tag}
                  </Badge>
                ))}
              </Stack>
              <Stack gap={2} className="mt-4 text-body-sm text-ink-300">
                <Body>Friends attending: {event.friendsAttending}</Body>
                <Body>Distance: {event.distanceMiles} mi</Body>
                <Body>Tour stops: {event.tourStops.join(" · ")}</Body>
              </Stack>
              <Button className="mt-6 w-full" variant="outline">
                Track price + alerts
              </Button>
            </Article>
          ))}
        </Grid>
      )}
    </Stack>
  );
}


function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Stack>
      <Label className="text-mono-xs uppercase tracking-label text-ink-500">{label}</Label>
      <Display className="font-display text-h4-md text-white">{value}</Display>
    </Stack>
  );
}
