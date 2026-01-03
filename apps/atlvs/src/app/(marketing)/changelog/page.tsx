"use client";

/**
 * Changelog Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, timeline, and release notes
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useState } from "react";
import { Zap, Bug, Sparkles, Wrench, Calendar, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  MarketingPage, HeroSection, TimelineSection, CTABanner, Container, Stack, Grid, Card, Body, H3, Button, Badge, Spinner} from "@ghxstship/ui";

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
  { id: "1", version: "2.5.0", date: "2024-12-15", title: "Real-time Collaboration", description: "Major update with real-time collaboration features for seamless team coordination.", type: "feature", items: ["Real-time document editing", "Live cursor presence", "Instant notifications", "Collaborative comments"] },
  { id: "2", version: "2.4.2", date: "2024-12-01", title: "Performance Improvements", description: "Significant performance optimizations across the entire platform.", type: "improvement", items: ["50% faster page loads", "Reduced memory usage", "Optimized database queries", "Improved caching"] },
  { id: "3", version: "2.4.1", date: "2024-11-20", title: "Bug Fixes", description: "Various bug fixes and stability improvements for a smoother experience.", type: "bugfix", items: ["Fixed calendar sync issues", "Resolved export errors", "Fixed notification delays", "Corrected timezone handling"] },
  { id: "4", version: "2.4.0", date: "2024-11-10", title: "New Dashboard", description: "Redesigned dashboard with customizable widgets and improved analytics.", type: "feature", items: ["Customizable widgets", "New analytics charts", "Quick actions panel", "Recent activity feed"] },
  { id: "5", version: "2.3.5", date: "2024-10-25", title: "Security Update", description: "Important security enhancements to protect your data.", type: "security", items: ["Enhanced encryption", "Improved session management", "Security audit fixes", "Updated dependencies"] },
];

const TYPE_CONFIG = {
  feature: { icon: <Sparkles className="size-5" />, label: "New Feature", color: "bg-success/20 text-success border-success/30" },
  improvement: { icon: <Zap className="size-5" />, label: "Improvement", color: "bg-primary/20 text-primary border-primary/30" },
  bugfix: { icon: <Bug className="size-5" />, label: "Bug Fix", color: "bg-accent/20 text-accent border-accent/30" },
  security: { icon: <Wrench className="size-5" />, label: "Security", color: "bg-error/20 text-error border-error/30" },
};

const CHANGELOG_FILTER_OPTIONS = ["All", "Features", "Improvements", "Bug Fixes", "Security"];

export default function ChangelogPage() {
  const [selectedFilter, setSelectedFilter] = useState("All");

  const { data: changelog = [], isLoading } = useQuery({
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

  const timelineItems = changelog.slice(0, 5).map((entry: ChangelogEntry) => ({
    id: entry.id,
    title: `v${entry.version} - ${entry.title}`,
    description: entry.description,
    date: formatDate(entry.date),
    status: "completed" as const,
  }));

  return (
    <MarketingPage
      sections={[
        {
          id: "hero",
          background: "gradient",
          pattern: "halftone",
          patternOpacity: 0.05,
          content: (
            <HeroSection
              kicker="What is New"
              title="Changelog"
              description="Stay up to date with the latest improvements, features, and fixes. We ship updates regularly to make ATLVS better for you."
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "timeline",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <TimelineSection
              kicker="Recent Updates"
              title="Release Timeline"
              description="A quick overview of our recent releases"
              items={timelineItems}
              orientation="vertical"
              background="ink"
            />
          ),
        },
        {
          id: "releases",
          background: "black",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">All Releases</Body>
                  <H3 className="text-white">Release Notes</H3>
                </Stack>

                {/* Filters */}
                <Stack direction="horizontal" gap={2} className="flex-wrap justify-center">
                  {CHANGELOG_FILTER_OPTIONS.map((filter) => (
                    <Button
                      key={filter}
                      variant={selectedFilter === filter ? "solid" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter(filter)}
                    >
                      {filter}
                    </Button>
                  ))}
                </Stack>

                {/* Release List */}
                {isLoading ? (
                  <Stack className="items-center py-12">
                    <Spinner size="lg" />
                    <Body className="text-text-muted mt-4">Loading changelog...</Body>
                  </Stack>
                ) : filteredChangelog.length === 0 ? (
                  <Card className="p-12 text-center border-2 border-border rounded-card">
                    <Zap className="size-16 text-text-disabled mx-auto mb-4" />
                    <Body className="text-white font-weight-medium mb-2">No Updates Found</Body>
                    <Body className="text-text-muted mb-4">Check back soon for new releases</Body>
                    <Button variant="outline" onClick={() => setSelectedFilter("All")}>View All Updates</Button>
                  </Card>
                ) : (
                  <Stack gap={6}>
                    {filteredChangelog.map((entry: ChangelogEntry) => {
                      const config = TYPE_CONFIG[entry.type];
                      return (
                        <Card key={entry.id} className="p-8 border-2 border-border rounded-card pop-card">
                          <Stack gap={4}>
                            <Stack direction="horizontal" className="justify-between items-start flex-wrap gap-4">
                              <Stack direction="horizontal" gap={3} className="items-center">
                                <Badge variant="outline" className="px-3 py-1 font-weight-bold">v{entry.version}</Badge>
                                <Badge className={config.color}>
                                  <Stack direction="horizontal" gap={1} className="items-center">
                                    {config.icon}
                                    <Body size="sm">{config.label}</Body>
                                  </Stack>
                                </Badge>
                              </Stack>
                              <Stack direction="horizontal" gap={2} className="items-center text-text-disabled">
                                <Calendar className="size-4" />
                                <Body size="sm">{formatDate(entry.date)}</Body>
                              </Stack>
                            </Stack>

                            <Stack gap={2}>
                              <Body className="text-white font-weight-bold text-h5-md">{entry.title}</Body>
                              <Body className="text-text-muted">{entry.description}</Body>
                            </Stack>

                            <Grid cols={2} gap={3} className="grid-cols-1 md:grid-cols-2 mt-2">
                              {entry.items.map((item, idx) => (
                                <Stack key={idx} direction="horizontal" gap={2} className="items-center">
                                  <Check className="size-4 text-success flex-shrink-0" />
                                  <Body size="sm" className="text-text-secondary">{item}</Body>
                                </Stack>
                              ))}
                            </Grid>
                          </Stack>
                        </Card>
                      );
                    })}
                  </Stack>
                )}
              </Stack>
            </Container>
          ),
        },
        {
          id: "cta",
          background: "ink",
          pattern: "stripes",
          content: (
            <CTABanner
              title="Have Feature Requests?"
              description="We love hearing from our users. Share your ideas and help shape the future of ATLVS."
              primaryCta={{
                label: "Submit Feedback",
                onClick: () => window.location.href = "/contact?reason=feedback",
              }}
              secondaryCta={{
                label: "View Roadmap",
                onClick: () => window.location.href = "/roadmap",
              }}
              background="ink"
            />
          ),
        },
      ]}
    />
  );
}
