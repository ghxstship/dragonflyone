"use client";

/**
 * Productions Vertical Page - 2026 Landing Page Best Practices
 * Live event production management
 * Full-width marketing layout with hero and content sections
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Check, Film, DollarSign, Users, Clock } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container,
  Body, Card, Grid, Stack,
  type FeatureItem
} from "@ghxstship/ui";

const FEATURES: FeatureItem[] = [
  { id: "planning", icon: <Film className="size-8" />, title: "Production Planning", description: "Plan productions with comprehensive scheduling and resource allocation." },
  { id: "budget", icon: <DollarSign className="size-8" />, title: "Budget Management", description: "Track budgets, expenses, and financial forecasts in real-time." },
  { id: "team", icon: <Users className="size-8" />, title: "Team Coordination", description: "Coordinate teams across departments and locations seamlessly." },
  { id: "timeline", icon: <Clock className="size-8" />, title: "Timeline Tracking", description: "Track milestones and deadlines with visual timeline management." },
];

const BENEFITS = ["Streamlined workflows", "Budget control", "Better collaboration", "On-time delivery", "Reduced overhead", "Improved quality"];

const STATS = [
  { value: "5000+", label: "Productions" },
  { value: "60%", label: "Time Saved" },
  { value: "30%", label: "Cost Reduction" },
  { value: "99%", label: "On-Time" },
];

export default function ProductionsVerticalPage() {
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
              title="Productions"
              description="Complete platform for live event productions and shows. Deliver exceptional experiences on time and on budget."
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
            <Container size="xl" className="py-12">
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
              title="Production Tools"
              description="Everything you need for successful live event productions"
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
            <Container size="lg" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Benefits</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Why Choose ATLVS for Productions</Body>
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
              title="Ready to Transform Your Productions?"
              description="See how ATLVS can help you deliver exceptional live events."
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
