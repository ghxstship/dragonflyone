"use client";

/**
 * Artists Solution Page - 2026 Landing Page Best Practices
 * Full-width marketing layout for artists and performers
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Calendar, DollarSign, Star, Check, TrendingUp, Users, FileText } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container, Stack, Grid, Card, Body, H3} from "@ghxstship/ui";

const FEATURES: FeatureItem[] = [
  { id: "booking", icon: <Calendar className="size-8" />, title: "Booking Management", description: "Track all your bookings, confirmations, and schedules in one centralized calendar." },
  { id: "payments", icon: <DollarSign className="size-8" />, title: "Payment Tracking", description: "Monitor payments, invoices, and deposits with automated reminders." },
  { id: "riders", icon: <FileText className="size-8" />, title: "Rider Management", description: "Create and share technical and hospitality riders digitally with promoters." },
  { id: "portfolio", icon: <Star className="size-8" />, title: "Profile & Portfolio", description: "Showcase your work with a professional portfolio visible to promoters." },
  { id: "analytics", icon: <TrendingUp className="size-8" />, title: "Performance Analytics", description: "Track your career growth with insights on bookings, earnings, and reach." },
  { id: "network", icon: <Users className="size-8" />, title: "Industry Network", description: "Connect directly with promoters, venues, and other industry professionals." },
];

const BENEFITS = [
  "Centralized booking calendar",
  "Automated payment reminders",
  "Digital rider sharing",
  "Professional portfolio",
  "Direct promoter connections",
  "Performance analytics",
  "Contract management",
  "Mobile app access",
  "24/7 support",
];

const STATS = [
  { value: "10K+", label: "Artists" },
  { value: "50K+", label: "Bookings Managed" },
  { value: "98%", label: "Payment Success" },
  { value: "Free", label: "To Start" },
];

export default function ArtistsSolutionPage() {
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
              kicker="For Artists"
              title="Focus on Your Craft"
              description="ATLVS helps artists manage their bookings, payments, and professional presence. Let us handle the business side while you focus on what you do best."
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
              title="Everything You Need"
              description="Tools designed specifically for artists and performers"
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
                  <H3 className="text-white">Why Artists Choose ATLVS</H3>
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
              title="Join Thousands of Artists"
              description="Start managing your career professionally. Sign up free and see why artists love ATLVS."
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
