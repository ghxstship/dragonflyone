"use client";

/**
 * Event Staff Solution Page - 2026 Landing Page Best Practices
 * Full-width marketing layout for event staff
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Check, Calendar, Clock, Radio, BarChart3, Users, DollarSign } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container, Stack, Grid, Card, Body, H3} from "@ghxstship/ui";

const FEATURES: FeatureItem[] = [
  { id: "shifts", icon: <Calendar className="size-8" />, title: "Shift Scheduling", description: "View and accept shifts that match your availability and preferences." },
  { id: "time", icon: <Clock className="size-8" />, title: "Time Tracking", description: "Clock in and out with GPS verification and break tracking." },
  { id: "communication", icon: <Radio className="size-8" />, title: "Team Communication", description: "Stay connected with supervisors and team members in real-time." },
  { id: "metrics", icon: <BarChart3 className="size-8" />, title: "Performance Metrics", description: "Track your hours, ratings, and performance over time." },
  { id: "team", icon: <Users className="size-8" />, title: "Team Coordination", description: "See who you are working with and coordinate assignments." },
  { id: "payments", icon: <DollarSign className="size-8" />, title: "Fast Payments", description: "Get paid quickly with integrated payment processing." },
];

const BENEFITS = [
  "Streamlined scheduling",
  "Accurate timekeeping",
  "Better coordination",
  "Professional management",
  "Mobile access",
  "Fast payments",
  "Shift notifications",
  "Performance tracking",
  "Career growth",
];

const STATS = [
  { value: "50K+", label: "Event Staff" },
  { value: "200K+", label: "Shifts Worked" },
  { value: "Fast", label: "Payments" },
  { value: "Free", label: "To Join" },
];

export default function EventStaffSolutionPage() {
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
              kicker="For Event Staff"
              title="Work Events You Love"
              description="Specialized tools for event staff in the live events industry. Find shifts, track time, and get paid faster."
              primaryCta={{
                label: "Get Started Free",
                onClick: () => router.push("/auth/signup"),
              }}
              secondaryCta={{
                label: "See How It Works",
                onClick: () => router.push("/demo"),
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
              title="Event Staff Tools"
              description="Everything you need to work events professionally"
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
                  <H3 className="text-white">Why Event Staff Choose ATLVS</H3>
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
              title="Ready to Start Working Events?"
              description="Join thousands of event staff who use ATLVS to find and manage their shifts."
              primaryCta={{
                label: "Sign Up Free",
                onClick: () => router.push("/auth/signup"),
              }}
              secondaryCta={{
                label: "Contact Us",
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
