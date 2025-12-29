"use client";

/**
 * Changelog Page
 * Product updates and release notes
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { Zap, Bug, Sparkles, Wrench, Calendar, List, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Body,
  Button,
  Card,
  Grid,
  Stack,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  type: "feature" | "improvement" | "bugfix" | "security";
  items: string[];
}

const DEMO_CHANGELOG: ChangelogEntry[] = [
  { id: "1", version: "2.5.0", date: "2024-12-15", title: "Real-time Collaboration", description: "Major update with real-time collaboration features", type: "feature", items: ["Real-time document editing", "Live cursor presence", "Instant notifications", "Collaborative comments"] },
  { id: "2", version: "2.4.2", date: "2024-12-01", title: "Performance Improvements", description: "Significant performance optimizations", type: "improvement", items: ["50% faster page loads", "Reduced memory usage", "Optimized database queries", "Improved caching"] },
  { id: "3", version: "2.4.1", date: "2024-11-20", title: "Bug Fixes", description: "Various bug fixes and stability improvements", type: "bugfix", items: ["Fixed calendar sync issues", "Resolved export errors", "Fixed notification delays", "Corrected timezone handling"] },
  { id: "4", version: "2.4.0", date: "2024-11-10", title: "New Dashboard", description: "Redesigned dashboard with new widgets", type: "feature", items: ["Customizable widgets", "New analytics charts", "Quick actions panel", "Recent activity feed"] },
  { id: "5", version: "2.3.5", date: "2024-10-25", title: "Security Update", description: "Important security enhancements", type: "security", items: ["Enhanced encryption", "Improved session management", "Security audit fixes", "Updated dependencies"] },
];

const TYPE_CONFIG = {
  feature: { icon: <Sparkles className="size-4" />, label: "New Feature", variant: "success" as const },
  improvement: { icon: <Zap className="size-4" />, label: "Improvement", variant: "info" as const },
  bugfix: { icon: <Bug className="size-4" />, label: "Bug Fix", variant: "warning" as const },
  security: { icon: <Wrench className="size-4" />, label: "Security", variant: "error" as const },
};

const FILTERS = ["All", "Features", "Improvements", "Bug Fixes", "Security"];

export default function ChangelogPage() {
    const [selectedFilter, setSelectedFilter] = useState("All");

  const { data: changelog = [], isLoading, error, refetch } = useQuery({
    queryKey: ["changelog"],
    queryFn: async () => {
      const response = await fetch("/api/changelog");
      if (!response.ok) return DEMO_CHANGELOG;
      const data = await response.json();
      return data.entries?.length ? data.entries : DEMO_CHANGELOG;
    },
  });

  const filterMap: Record<string, string> = { "All": "all", "Features": "feature", "Improvements": "improvement", "Bug Fixes": "bugfix", "Security": "security" };
  const filteredChangelog = selectedFilter === "All" ? changelog : changelog.filter((entry: ChangelogEntry) => entry.type === filterMap[selectedFilter]);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const tabs = [
    {
      id: "all",
      label: "All Updates",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <div className="flex gap-2 mb-6 flex-wrap">
            {FILTERS.map((filter) => (
              <Button key={filter} variant={selectedFilter === filter ? "solid" : "outline"} size="sm" onClick={() => setSelectedFilter(filter)}>
                {filter}
              </Button>
            ))}
          </div>

          {filteredChangelog.length === 0 ? (
            <Card className="p-8 text-center">
              <Zap className="size-12 text-grey-600 mx-auto mb-4" />
              <Body className="font-weight-medium mb-2">No Updates Found</Body>
              <Body className="text-grey-400">Check back soon for new releases</Body>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredChangelog.map((entry: ChangelogEntry) => {
                const config = TYPE_CONFIG[entry.type];
                return (
                  <Card key={entry.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="px-3 py-1">v{entry.version}</Badge>
                        <Badge variant={config.variant}>{config.icon} {config.label}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-grey-500">
                        <Calendar className="size-4" />
                        <Body size="sm">{formatDate(entry.date)}</Body>
                      </div>
                    </div>
                    <Body className="font-weight-bold mb-2">{entry.title}</Body>
                    <Body className="text-grey-400 mb-4">{entry.description}</Body>
                    <Stack gap={2}>
                      {entry.items.map((item, idx) => (
                        <Stack key={idx} direction="horizontal" gap={2} className="items-center">
                          <div className="size-1.5 rounded-avatar bg-primary" />
                          <Body size="sm">{item}</Body>
                        </Stack>
                      ))}
                    </Stack>
                  </Card>
                );
              })}
            </div>
          )}
        </Section>
      ),
    },
    {
      id: "highlights",
      label: "Highlights",
      icon: <Star className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Major Releases" description="Our biggest updates and new features" />
          <div className="space-y-6 mt-6">
            {changelog.filter((e: ChangelogEntry) => e.type === "feature").map((entry: ChangelogEntry) => (
              <Card key={entry.id} className="p-8 border-primary">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="size-6 text-primary" />
                  <Badge variant="outline" className="px-3 py-1">v{entry.version}</Badge>
                  <Body size="sm" className="text-grey-500">{formatDate(entry.date)}</Body>
                </div>
                <Body className="font-weight-bold mb-2">{entry.title}</Body>
                <Body className="text-grey-400 mb-6">{entry.description}</Body>
                <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
                  {entry.items.map((item, idx) => (
                    <Card key={idx} className="p-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-4 text-primary" />
                        <Body size="sm">{item}</Body>
                      </div>
                    </Card>
                  ))}
                </Grid>
              </Card>
            ))}
          </div>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "What's New",
        title: "Changelog",
        description: "Stay up to date with the latest improvements and features",
      }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
