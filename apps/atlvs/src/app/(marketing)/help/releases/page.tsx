"use client";

/**
 * Release Notes Page
 * Product updates and changelog
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Zap, Bug, Sparkles, Calendar, List, Star} from "lucide-react";
import {
  Badge, Body, Button, Card, Stack, DetailPage, Section, SectionHeader, Box} from "@ghxstship/ui";

interface Release {
  version: string;
  date: string;
  title: string;
  type: "major" | "minor" | "patch";
  highlights: string[];
}

const RELEASES: Release[] = [
  { version: "2.5.0", date: "2024-12-15", title: "Real-time Collaboration", type: "major", highlights: ["Real-time document editing", "Live cursor presence", "Instant notifications"] },
  { version: "2.4.2", date: "2024-12-01", title: "Performance Improvements", type: "patch", highlights: ["50% faster page loads", "Reduced memory usage", "Optimized queries"] },
  { version: "2.4.0", date: "2024-11-10", title: "New Dashboard", type: "minor", highlights: ["Customizable widgets", "New analytics charts", "Quick actions panel"] },
  { version: "2.3.0", date: "2024-10-15", title: "API v2 Launch", type: "major", highlights: ["New REST API", "Webhook support", "Rate limiting"] },
];

const TYPE_CONFIG = {
  major: { label: "Major Release", variant: "success" as const, icon: <Sparkles className="size-4" /> },
  minor: { label: "Feature Update", variant: "info" as const, icon: <Zap className="size-4" /> },
  patch: { label: "Bug Fix", variant: "warning" as const, icon: <Bug className="size-4" /> },
};

export default function ReleasesPage() {
  const router = useRouter();

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const tabs = [
    {
      id: "releases",
      label: "All Releases",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Stack gap={6}>
            {RELEASES.map((release) => {
              const config = TYPE_CONFIG[release.type];
              return (
                <Card key={release.version} className="p-6">
                  <Box className="flex items-start justify-between mb-4">
                    <Box className="flex items-center gap-3">
                      <Badge variant="outline" className="font-weight-medium px-3 py-1">v{release.version}</Badge>
                      <Badge variant={config.variant}>{config.icon} {config.label}</Badge>
                    </Box>
                    <Box className="flex items-center gap-2 text-on-dark-disabled">
                      <Calendar className="size-4" />
                      <Body size="sm">{formatDate(release.date)}</Body>
                    </Box>
                  </Box>
                  <Body className="font-weight-bold font-weight-medium mb-4">{release.title}</Body>
                  <Stack gap={2}>
                    {release.highlights.map((highlight, idx) => (
                      <Stack key={idx} direction="horizontal" gap={2} className="items-center">
                        <Box className="size-1.5 rounded-avatar bg-primary" />
                        <Body size="sm">{highlight}</Body>
                      </Stack>
                    ))}
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        </Section>
      ),
    },
    {
      id: "major",
      label: "Major Releases",
      icon: <Star className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Major Releases" description="Significant platform updates" />
          <Stack gap={6} className="mt-6">
            {RELEASES.filter((r) => r.type === "major").map((release) => (
              <Card key={release.version} className="p-8 border-primary">
                <Box className="flex items-center gap-3 mb-4">
                  <Sparkles className="size-6 text-primary" />
                  <Badge variant="outline" className="font-weight-medium px-3 py-1">v{release.version}</Badge>
                  <Body size="sm" className="text-on-dark-disabled">{formatDate(release.date)}</Body>
                </Box>
                <Body className="font-weight-bold font-weight-bold mb-4">{release.title}</Body>
                <Stack gap={2}>
                  {release.highlights.map((highlight, idx) => (
                    <Stack key={idx} direction="horizontal" gap={2} className="items-center">
                      <Sparkles className="size-4 text-primary" />
                      <Body>{highlight}</Body>
                    </Stack>
                  ))}
                </Stack>
              </Card>
            ))}
          </Stack>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Help", title: "Release Notes", description: "Latest updates and improvements" }}
      backButton={{ label: "Help Center", href: "/help" }}
      tabs={tabs}
      actions={<Button variant="outline" onClick={() => router.push("/changelog")}>Full Changelog</Button>}
    />
  );
}
