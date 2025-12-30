"use client";

/**
 * Brand Ambassadors Solution Page - 2026 Landing Page Best Practices
 * Full-width marketing layout for brand ambassadors
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Users, MapPin, Calendar, BarChart3, Check, Camera, DollarSign } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container, Stack, Grid, Card, Body, H3} from "@ghxstship/ui";

const FEATURES: FeatureItem[] = [
  { id: "scheduling", icon: <Calendar className="size-8" />, title: "Event Scheduling", description: "Manage your activation schedule with availability and shift preferences." },
  { id: "checkin", icon: <MapPin className="size-8" />, title: "Location Check-In", description: "GPS-verified check-ins at event locations with time tracking." },
  { id: "metrics", icon: <BarChart3 className="size-8" />, title: "Performance Metrics", description: "Track engagement, conversions, and samples distributed." },
  { id: "team", icon: <Users className="size-8" />, title: "Team Coordination", description: "Collaborate with team leads and other ambassadors." },
  { id: "photos", icon: <Camera className="size-8" />, title: "Photo & Reports", description: "Upload photos and submit activation reports from your phone." },
  { id: "payments", icon: <DollarSign className="size-8" />, title: "Quick Payments", description: "Get paid faster with integrated payment processing." },
];

const BENEFITS = [
  "Easy shift management",
  "Real-time check-ins",
  "Photo uploads",
  "Performance tracking",
  "Brand communication",
  "Quick payments",
  "Mobile-first app",
  "Training materials",
  "Career growth",
];

const STATS = [
  { value: "25K+", label: "Ambassadors" },
  { value: "100K+", label: "Activations" },
  { value: "Fast", label: "Payments" },
  { value: "Free", label: "To Join" },
];

export default function BrandAmbassadorsSolutionPage() {
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
              kicker="For Brand Ambassadors"
              title="Elevate Your Ambassador Career"
              description="ATLVS empowers brand ambassadors with tools to manage activations, track performance, and communicate with brands seamlessly."
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
              title="Ambassador Tools"
              description="Everything you need to succeed as a brand ambassador"
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
                  <H3 className="text-white">Why Ambassadors Choose ATLVS</H3>
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
              title="Ready to Grow Your Ambassador Career?"
              description="Join thousands of brand ambassadors who use ATLVS to manage their activations."
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
