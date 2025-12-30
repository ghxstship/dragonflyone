"use client";

/**
 * Independent Contractors Solution Page - 2026 Landing Page Best Practices
 * Full-width marketing layout for independent contractors
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Briefcase, Check, Calendar, FileText, DollarSign, TrendingUp, Users } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container, Stack, Grid, Card, Body, H3} from "@ghxstship/ui";

const FEATURES: FeatureItem[] = [
  { id: "jobs", icon: <Briefcase className="size-8" />, title: "Job Tracking", description: "Track all your gigs, contracts, and projects in one organized dashboard." },
  { id: "invoices", icon: <DollarSign className="size-8" />, title: "Invoice Management", description: "Create professional invoices and track payments automatically." },
  { id: "contracts", icon: <FileText className="size-8" />, title: "Contract Storage", description: "Store and manage all your contracts and certifications securely." },
  { id: "availability", icon: <Calendar className="size-8" />, title: "Availability Calendar", description: "Share your availability with clients and manage your schedule." },
  { id: "analytics", icon: <TrendingUp className="size-8" />, title: "Business Analytics", description: "Track your earnings, utilization, and business growth." },
  { id: "network", icon: <Users className="size-8" />, title: "Client Network", description: "Build relationships with clients and get repeat bookings." },
];

const BENEFITS = [
  "Organized workflow",
  "Faster payments",
  "Professional presence",
  "Better client relations",
  "Tax-ready reports",
  "Contract management",
  "Mobile access",
  "Free to start",
  "24/7 support",
];

const STATS = [
  { value: "20K+", label: "Contractors" },
  { value: "$75M+", label: "Invoiced" },
  { value: "99%", label: "Payment Rate" },
  { value: "Free", label: "To Start" },
];

export default function IndependentContractorsSolutionPage() {
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
              kicker="For Independent Contractors"
              title="Run Your Business Like a Pro"
              description="Specialized tools for independent contractors in the live events industry. Track jobs, manage invoices, and grow your business."
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
              title="Contractor Business Tools"
              description="Everything you need to run your independent business"
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
                  <H3 className="text-white">Why Contractors Choose ATLVS</H3>
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
              title="Ready to Grow Your Business?"
              description="Join thousands of independent contractors who trust ATLVS to manage their careers."
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
