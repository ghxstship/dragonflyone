"use client";

/**
 * Producers Solution Page - 2026 Landing Page Best Practices
 * Full-width marketing layout for producers
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Film, Check, Calendar, DollarSign, Users, TrendingUp, FileText } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container, Stack, Grid, Card, Body, H3} from "@ghxstship/ui";

const FEATURES: FeatureItem[] = [
  { id: "planning", icon: <Calendar className="size-8" />, title: "Production Planning", description: "Plan every aspect of your production with comprehensive scheduling and milestone tracking." },
  { id: "budget", icon: <DollarSign className="size-8" />, title: "Budget Management", description: "Track budgets in real-time with variance analysis and cost forecasting." },
  { id: "team", icon: <Users className="size-8" />, title: "Team Coordination", description: "Coordinate crews, vendors, and stakeholders with centralized communication." },
  { id: "timeline", icon: <TrendingUp className="size-8" />, title: "Timeline Tracking", description: "Keep productions on schedule with visual timelines and milestone alerts." },
  { id: "docs", icon: <FileText className="size-8" />, title: "Document Management", description: "Centralize contracts, call sheets, and production documents." },
  { id: "reports", icon: <Film className="size-8" />, title: "Production Reports", description: "Generate comprehensive reports for stakeholders and wrap documentation." },
];

const BENEFITS = [
  "Streamlined workflows",
  "Budget control",
  "Better collaboration",
  "On-time delivery",
  "Reduced overhead",
  "Real-time visibility",
  "Stakeholder reporting",
  "Mobile access",
  "Enterprise security",
];

const STATS = [
  { value: "5K+", label: "Producers" },
  { value: "$1B+", label: "Budgets Managed" },
  { value: "95%", label: "On-Time Delivery" },
  { value: "40%", label: "Time Saved" },
];

export default function ProducersSolutionPage() {
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
              kicker="For Producers"
              title="Deliver Productions On Time & On Budget"
              description="Specialized tools for producers in the live events industry. Plan, coordinate, and execute productions with confidence."
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
              title="Production Management Tools"
              description="Everything you need to manage successful productions"
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
                  <H3 className="text-white">Why Producers Choose ATLVS</H3>
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
              title="Ready to Transform Your Productions?"
              description="See how ATLVS can help you deliver exceptional productions on time and on budget."
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
