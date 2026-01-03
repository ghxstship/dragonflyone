"use client";

/**
 * Release Notes Page - 2026 Landing Page Best Practices
 * Product updates and changelog
 * Full-width marketing layout with hero and content sections
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Zap, Bug, Sparkles, Calendar, Bell } from "lucide-react";
import {
  MarketingPage, HeroSection, CTABanner, Container,
  Badge, Body, Button, Card, Grid, Stack, Box
} from "@ghxstship/ui";

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

const STATS = [
  { value: "4", label: "Recent Releases" },
  { value: "15+", label: "New Features" },
  { value: "99.9%", label: "Uptime" },
  { value: "Weekly", label: "Updates" },
];

export default function ReleasesPage() {
  const router = useRouter();

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const majorReleases = RELEASES.filter((r) => r.type === "major");

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
              kicker="Help"
              title="Release Notes"
              description="Stay up to date with the latest updates, features, and improvements to ATLVS."
              primaryCta={{
                label: "Full Changelog",
                onClick: () => router.push("/changelog"),
              }}
              secondaryCta={{
                label: "Subscribe to Updates",
                onClick: () => router.push("/contact"),
              }}
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "stats",
          background: "primary",
          content: (
            <Container size="2xl" className="py-12">
              <Grid cols={4} gap={8} className="grid-cols-2 md:grid-cols-4">
                {STATS.map((stat, idx) => (
                  <Stack key={idx} gap={1} className="text-center">
                    <Body className="text-white font-weight-bold text-h3-md">{stat.value}</Body>
                    <Body className="text-white/80">{stat.label}</Body>
                  </Stack>
                ))}
              </Grid>
            </Container>
          ),
        },
        {
          id: "releases",
          background: "ink",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Updates</Body>
                  <Body className="text-white font-weight-bold text-h3-md">All Releases</Body>
                </Stack>

                <Stack gap={6}>
                  {RELEASES.map((release) => {
                    const config = TYPE_CONFIG[release.type];
                    return (
                      <Card key={release.version} className="p-6 border-2 border-border rounded-card">
                        <Box className="flex items-start justify-between mb-4">
                          <Box className="flex items-center gap-3 flex-wrap">
                            <Badge variant="outline" className="font-weight-medium px-3 py-1">v{release.version}</Badge>
                            <Badge variant={config.variant}>{config.icon} {config.label}</Badge>
                          </Box>
                          <Box className="flex items-center gap-2 text-on-dark-disabled">
                            <Calendar className="size-4" />
                            <Body size="sm">{formatDate(release.date)}</Body>
                          </Box>
                        </Box>
                        <Body className="text-white font-weight-bold mb-4">{release.title}</Body>
                        <Stack gap={2}>
                          {release.highlights.map((highlight, idx) => (
                            <Stack key={idx} direction="horizontal" gap={2} className="items-center">
                              <Box className="size-1.5 rounded-avatar bg-primary" />
                              <Body className="text-on-dark-secondary">{highlight}</Body>
                            </Stack>
                          ))}
                        </Stack>
                      </Card>
                    );
                  })}
                </Stack>
              </Stack>
            </Container>
          ),
        },
        {
          id: "major",
          background: "black",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Highlights</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Major Releases</Body>
                  <Body className="text-on-dark-muted">Significant platform updates and new features</Body>
                </Stack>

                <Stack gap={6}>
                  {majorReleases.map((release) => (
                    <Card key={release.version} className="p-8 border-2 border-primary rounded-card">
                      <Box className="flex items-center gap-3 mb-4">
                        <Sparkles className="size-6 text-primary" />
                        <Badge variant="outline" className="font-weight-medium px-3 py-1">v{release.version}</Badge>
                        <Body size="sm" className="text-on-dark-disabled">{formatDate(release.date)}</Body>
                      </Box>
                      <Body className="text-white font-weight-bold text-h4-md mb-4">{release.title}</Body>
                      <Stack gap={3}>
                        {release.highlights.map((highlight, idx) => (
                          <Stack key={idx} direction="horizontal" gap={3} className="items-center">
                            <Sparkles className="size-4 text-primary" />
                            <Body className="text-white">{highlight}</Body>
                          </Stack>
                        ))}
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Container>
          ),
        },
        {
          id: "subscribe",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <Container size="2xl" className="py-20">
              <Card className="p-12 border-2 border-border rounded-card text-center">
                <Bell className="size-16 text-primary mx-auto mb-6" />
                <Body className="text-white font-weight-bold text-h3-md mb-4">Stay Updated</Body>
                <Body className="text-on-dark-muted mb-6 max-w-xl mx-auto">Subscribe to our newsletter to receive release notes and product updates directly in your inbox.</Body>
                <Button variant="solid" onClick={() => router.push("/contact")}>Subscribe to Updates</Button>
              </Card>
            </Container>
          ),
        },
        {
          id: "cta",
          background: "primary",
          pattern: "halftone",
          content: (
            <CTABanner
              title="Want to See More?"
              description="View our complete changelog for a detailed history of all updates."
              primaryCta={{
                label: "Full Changelog",
                onClick: () => router.push("/changelog"),
              }}
              secondaryCta={{
                label: "Help Center",
                onClick: () => router.push("/help"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
