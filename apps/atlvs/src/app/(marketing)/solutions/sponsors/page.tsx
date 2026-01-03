"use client";

/**
 * Sponsors Solution Page - 2026 Landing Page Best Practices
 * Full-width marketing layout for sponsors and brands
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Award, Check, BarChart3, Target, Users, Eye, DollarSign } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container, Stack, Grid, Card, Body, H3} from "@ghxstship/ui";

const FEATURES: FeatureItem[] = [
  { id: "management", icon: <Award className="size-8" />, title: "Sponsorship Management", description: "Manage sponsorship agreements, deliverables, and activations in one place." },
  { id: "roi", icon: <BarChart3 className="size-8" />, title: "ROI Tracking", description: "Measure sponsorship performance with detailed analytics and attribution." },
  { id: "activation", icon: <Target className="size-8" />, title: "Brand Activation", description: "Plan and execute brand activations with real-time coordination." },
  { id: "analytics", icon: <Eye className="size-8" />, title: "Exposure Analytics", description: "Track brand exposure, impressions, and audience engagement." },
  { id: "network", icon: <Users className="size-8" />, title: "Event Network", description: "Discover and connect with events that match your brand objectives." },
  { id: "budget", icon: <DollarSign className="size-8" />, title: "Budget Management", description: "Track sponsorship budgets and forecast ROI across your portfolio." },
];

const BENEFITS = [
  "Maximize exposure",
  "Track performance",
  "Better engagement",
  "Data-driven decisions",
  "Portfolio management",
  "Real-time reporting",
  "Activation coordination",
  "Audience insights",
  "ROI attribution",
];

const STATS = [
  { value: "500+", label: "Brands" },
  { value: "$250M+", label: "Sponsorships Managed" },
  { value: "3x", label: "Average ROI" },
  { value: "10K+", label: "Activations" },
];

export default function SponsorsSolutionPage() {
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
              kicker="For Sponsors"
              title="Maximize Your Sponsorship ROI"
              description="Specialized tools for sponsors in the live events industry. Track performance, manage activations, and prove ROI with data-driven insights."
              primaryCta={{
                label: "Request Demo",
                onClick: () => router.push("/demo"),
              }}
              secondaryCta={{
                label: "View Pricing",
                onClick: () => router.push("/pricing"),
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
              title="Sponsorship Management Tools"
              description="Everything you need to manage successful sponsorships"
              features={FEATURES}
              columns={3}
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
                  <H3 className="text-white">Why Sponsors Choose ATLVS</H3>
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
              title="Ready to Prove Your Sponsorship ROI?"
              description="See how ATLVS can help you maximize the impact of your sponsorship investments."
              primaryCta={{
                label: "Schedule a Demo",
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
