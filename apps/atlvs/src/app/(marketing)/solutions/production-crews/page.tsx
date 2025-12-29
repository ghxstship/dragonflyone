"use client";

/**
 * Production Crews Solution Page - 2026 Landing Page Best Practices
 * Full-width marketing layout for production crews
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Users, Check, Calendar, FileText, Radio, Wrench } from "lucide-react";
import {
  MarketingPage,
  HeroSection,
  FeatureGrid,
  CTABanner,
  Container,
  Stack,
  Grid,
  Card,
  Body,
  H3,
  type FeatureItem,
} from "@ghxstship/ui";

const FEATURES: FeatureItem[] = [
  { id: "scheduling", icon: <Calendar className="size-8" />, title: "Crew Scheduling", description: "Schedule crew members across departments with availability tracking and conflict detection." },
  { id: "callsheets", icon: <FileText className="size-8" />, title: "Digital Call Sheets", description: "Create and distribute call sheets with automatic updates and read receipts." },
  { id: "departments", icon: <Users className="size-8" />, title: "Department Coordination", description: "Coordinate between departments with shared timelines and task assignments." },
  { id: "equipment", icon: <Wrench className="size-8" />, title: "Equipment Tracking", description: "Track equipment assignments, maintenance, and inventory across productions." },
  { id: "communication", icon: <Radio className="size-8" />, title: "Team Communication", description: "Real-time messaging and announcements for crew coordination." },
  { id: "timesheets", icon: <Calendar className="size-8" />, title: "Time Tracking", description: "Track crew hours, overtime, and generate payroll-ready reports." },
];

const BENEFITS = [
  "Efficient scheduling",
  "Clear communication",
  "Team alignment",
  "Resource management",
  "Reduced overtime",
  "Digital call sheets",
  "Equipment tracking",
  "Mobile access",
  "Real-time updates",
];

const STATS = [
  { value: "20K+", label: "Crew Members" },
  { value: "100K+", label: "Call Sheets Sent" },
  { value: "30%", label: "Time Saved" },
  { value: "95%", label: "On-Time Starts" },
];

export default function ProductionCrewsSolutionPage() {
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
              kicker="For Production Crews"
              title="Coordinate Crews Like Never Before"
              description="Specialized tools for production crews in the live events industry. Schedule, communicate, and coordinate with precision."
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
              title="Crew Coordination Tools"
              description="Everything you need to manage production crews"
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
            <Container size="xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Benefits</Body>
                  <H3 className="text-white">Why Crews Choose ATLVS</H3>
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
              title="Ready to Streamline Crew Coordination?"
              description="See how ATLVS can help your crew work more efficiently."
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
