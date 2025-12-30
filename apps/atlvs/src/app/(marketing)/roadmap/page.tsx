"use client";

/**
 * Roadmap Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, timeline, and feature request CTA
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { CheckCircle, Clock, Zap } from "lucide-react";
import {
  MarketingPage, HeroSection, TimelineSection, StatsSection, CTABanner, Container, Stack, Grid, Card, Body, H3, Badge} from "@ghxstship/ui";

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  quarter: string;
  status: "completed" | "in_progress" | "planned";
  category: string;
}

const ROADMAP_ITEMS: RoadmapItem[] = [
  { id: "1", title: "Real-time Collaboration", description: "Live editing and presence indicators for seamless team coordination", quarter: "Q4 2024", status: "completed", category: "Collaboration" },
  { id: "2", title: "Mobile App v2", description: "Redesigned mobile experience with offline support", quarter: "Q4 2024", status: "completed", category: "Mobile" },
  { id: "3", title: "AI-Powered Scheduling", description: "Smart scheduling suggestions based on team availability and preferences", quarter: "Q1 2025", status: "in_progress", category: "AI" },
  { id: "4", title: "Advanced Analytics", description: "Custom dashboards and detailed reports for production insights", quarter: "Q1 2025", status: "in_progress", category: "Analytics" },
  { id: "5", title: "Workflow Automation", description: "Automated task workflows and triggers for repetitive processes", quarter: "Q2 2025", status: "planned", category: "Automation" },
  { id: "6", title: "Multi-language Support", description: "Support for 10+ languages to serve global teams", quarter: "Q2 2025", status: "planned", category: "Localization" },
];

const STATUS_CONFIG = {
  completed: { label: "Completed", color: "bg-success/20 text-success border-success/30", icon: <CheckCircle className="size-5" />, timelineStatus: "completed" as const },
  in_progress: { label: "In Progress", color: "bg-primary/20 text-primary border-primary/30", icon: <Zap className="size-5" />, timelineStatus: "in-progress" as const },
  planned: { label: "Planned", color: "bg-accent/20 text-accent border-accent/30", icon: <Clock className="size-5" />, timelineStatus: "upcoming" as const },
};

export default function RoadmapPage() {
  const router = useRouter();

  const stats: StatItem[] = [
    { id: "completed", value: ROADMAP_ITEMS.filter((i) => i.status === "completed").length, label: "Completed", description: "Features shipped" },
    { id: "in_progress", value: ROADMAP_ITEMS.filter((i) => i.status === "in_progress").length, label: "In Progress", description: "Currently building" },
    { id: "planned", value: ROADMAP_ITEMS.filter((i) => i.status === "planned").length, label: "Planned", description: "Coming soon" },
    { id: "total", value: ROADMAP_ITEMS.length, label: "Total Features", description: "On the roadmap" },
  ];

  const timelineItems = ROADMAP_ITEMS.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    date: item.quarter,
    status: STATUS_CONFIG[item.status].timelineStatus,
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
              kicker="Product"
              title="Product Roadmap"
              description="See what we are building next. Our roadmap is shaped by customer feedback and our vision for the future of production management."
              primaryCta={{
                label: "Request a Feature",
                onClick: () => router.push("/contact?reason=feature"),
              }}
              secondaryCta={{
                label: "View Changelog",
                onClick: () => router.push("/changelog"),
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
            <StatsSection
              stats={stats}
              background="primary"
              animate
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
              kicker="Timeline"
              title="Development Roadmap"
              description="Track our progress from completed features to upcoming releases"
              items={timelineItems}
              orientation="vertical"
              background="ink"
            />
          ),
        },
        {
          id: "details",
          background: "black",
          content: (
            <Container size="xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Feature Details</Body>
                  <H3 className="text-white">What We Are Building</H3>
                </Stack>

                <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2">
                  {ROADMAP_ITEMS.map((item) => {
                    const config = STATUS_CONFIG[item.status];
                    return (
                      <Card key={item.id} className="p-6 border-2 border-grey-800 rounded-card hover:border-grey-700 transition-all">
                        <Stack gap={4}>
                          <Stack direction="horizontal" className="justify-between items-start">
                            <div className={`p-3 rounded-card ${item.status === "completed" ? "bg-success/20 text-success" : item.status === "in_progress" ? "bg-primary/20 text-primary" : "bg-grey-800 text-grey-400"}`}>
                              {config.icon}
                            </div>
                            <Stack direction="horizontal" gap={2}>
                              <Badge variant="outline">{item.quarter}</Badge>
                              <Badge className={config.color}>{config.label}</Badge>
                            </Stack>
                          </Stack>
                          <Stack gap={2}>
                            <Body className="text-white font-weight-bold">{item.title}</Body>
                            <Body className="text-grey-400">{item.description}</Body>
                          </Stack>
                          <Badge variant="outline" className="w-fit">{item.category}</Badge>
                        </Stack>
                      </Card>
                    );
                  })}
                </Grid>
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
              title="Have a Feature Request?"
              description="We love hearing from our users. Share your ideas and help shape the future of ATLVS."
              primaryCta={{
                label: "Submit Feature Request",
                onClick: () => router.push("/contact?reason=feature"),
              }}
              secondaryCta={{
                label: "Contact Us",
                onClick: () => router.push("/contact"),
              }}
              background="ink"
            />
          ),
        },
      ]}
    />
  );
}
