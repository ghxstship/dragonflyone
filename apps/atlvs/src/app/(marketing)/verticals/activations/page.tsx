"use client";

/**
 * Activations Vertical Page - 2026 Landing Page Best Practices
 * Brand activation and experiential marketing
 * Full-width marketing layout with hero and content sections
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Check, Target, TrendingUp, Users, Zap } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container,
  Body, Card, Grid, Stack,
  type FeatureItem
} from "@ghxstship/ui";

const FEATURES: FeatureItem[] = [
  { id: "campaigns", icon: <Target className="size-8" />, title: "Campaign Management", description: "Plan and execute brand activation campaigns with precision." },
  { id: "tracking", icon: <TrendingUp className="size-8" />, title: "Activation Tracking", description: "Monitor brand activations in real-time across all touchpoints." },
  { id: "coordination", icon: <Users className="size-8" />, title: "Team Coordination", description: "Coordinate field teams and brand ambassadors seamlessly." },
  { id: "analytics", icon: <Zap className="size-8" />, title: "Performance Analytics", description: "Measure engagement and ROI with detailed analytics." },
];

const BENEFITS = ["Streamlined activations", "Better brand engagement", "Real-time tracking", "Measurable results", "Reduced coordination overhead", "Improved ROI"];

const STATS = [
  { value: "60%", label: "Time Saved" },
  { value: "3x", label: "Engagement" },
  { value: "500+", label: "Activations" },
  { value: "98%", label: "Satisfaction" },
];

export default function ActivationsVerticalPage() {
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
              title="Activations"
              description="Complete platform for brand activations and experiential marketing campaigns. Engage audiences and measure impact."
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
              title="Activation Tools"
              description="Everything you need for successful brand activations"
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
                  <Body className="text-white font-weight-bold text-h3-md">Why Choose ATLVS for Activations</Body>
                </Stack>

                <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3">
                  {BENEFITS.map((benefit, idx) => (
                    <Card key={idx} className="p-5 border-2 border-border rounded-card">
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
              title="Ready to Transform Your Activations?"
              description="See how ATLVS can help you deliver exceptional brand experiences."
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
