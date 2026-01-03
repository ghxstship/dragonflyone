"use client";

/**
 * Installations Vertical Page - 2026 Landing Page Best Practices
 * Event installation and technical production
 * Full-width marketing layout with hero and content sections
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Check, Wrench, Package, Users, ClipboardList } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container,
  Body, Card, Grid, Stack,
  type FeatureItem
} from "@ghxstship/ui";

const FEATURES: FeatureItem[] = [
  { id: "planning", icon: <ClipboardList className="size-8" />, title: "Installation Planning", description: "Plan complex installations with detailed timelines and checklists." },
  { id: "equipment", icon: <Package className="size-8" />, title: "Equipment Tracking", description: "Track equipment inventory and deployment across projects." },
  { id: "crew", icon: <Users className="size-8" />, title: "Crew Scheduling", description: "Schedule installation crews with skill-based assignments." },
  { id: "project", icon: <Wrench className="size-8" />, title: "Project Management", description: "Manage installation projects from start to finish." },
];

const BENEFITS = ["Efficient installations", "Resource optimization", "On-time delivery", "Quality assurance", "Reduced downtime", "Better coordination"];

const STATS = [
  { value: "1000+", label: "Installations" },
  { value: "50%", label: "Faster Setup" },
  { value: "99%", label: "On-Time" },
  { value: "Zero", label: "Defects" },
];

export default function InstallationsVerticalPage() {
  const router = useRouter();

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
              kicker="Verticals"
              title="Installations"
              description="Complete platform for event installations and technical production. Deliver flawless setups every time."
              primaryCta={{
                label: "Request Demo",
                onClick: () => router.push("/demo"),
              }}
              secondaryCta={{
                label: "Learn More",
                onClick: () => router.push("/features"),
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
          id: "features",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <FeatureGrid
              kicker="Features"
              title="Installation Tools"
              description="Everything you need for successful event installations"
              features={FEATURES}
              columns={4}
              variant="bordered"
              background="ink"
              align="center"
            />
          ),
        },
        {
          id: "benefits",
          background: "black",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Benefits</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Why Choose ATLVS for Installations</Body>
                </Stack>

                <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3">
                  {BENEFITS.map((benefit, idx) => (
                    <Card key={idx} className="p-5 border-2 border-grey-800 rounded-card">
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Check className="size-5 text-success flex-shrink-0" />
                        <Body className="text-white">{benefit}</Body>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Container>
          ),
        },
        {
          id: "cta",
          background: "primary",
          pattern: "halftone",
          content: (
            <CTABanner
              title="Ready to Transform Your Installations?"
              description="See how ATLVS can help you deliver flawless event setups."
              primaryCta={{
                label: "Request Demo",
                onClick: () => router.push("/demo"),
              }}
              secondaryCta={{
                label: "Contact Sales",
                onClick: () => router.push("/contact"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
