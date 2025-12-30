"use client";

/**
 * Contractors Solution Page - 2026 Landing Page Best Practices
 * Full-width marketing layout for contractors and freelancers
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Briefcase, FileText, DollarSign, Calendar, Check, TrendingUp, Users } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container, Stack, Grid, Card, Body, H3} from "@ghxstship/ui";

const FEATURES: FeatureItem[] = [
  { id: "jobs", icon: <Briefcase className="size-8" />, title: "Job Management", description: "Track all your contracts, gigs, and projects in one centralized dashboard." },
  { id: "docs", icon: <FileText className="size-8" />, title: "Document Storage", description: "Store contracts, certifications, and important documents securely." },
  { id: "invoices", icon: <DollarSign className="size-8" />, title: "Invoice Tracking", description: "Create professional invoices and track payments automatically." },
  { id: "availability", icon: <Calendar className="size-8" />, title: "Availability Calendar", description: "Share your availability with clients and manage your schedule." },
  { id: "analytics", icon: <TrendingUp className="size-8" />, title: "Business Analytics", description: "Track your earnings, utilization, and business growth over time." },
  { id: "network", icon: <Users className="size-8" />, title: "Client Network", description: "Build and maintain relationships with clients and collaborators." },
];

const BENEFITS = [
  "Centralized job tracking",
  "Professional invoicing",
  "Document management",
  "Availability calendar",
  "Client communication",
  "Payment history",
  "Tax-ready reports",
  "Mobile access",
  "Free to start",
];

const STATS = [
  { value: "15K+", label: "Contractors" },
  { value: "$50M+", label: "Invoiced" },
  { value: "99%", label: "Payment Rate" },
  { value: "Free", label: "To Start" },
];

export default function ContractorsSolutionPage() {
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
              kicker="For Contractors"
              title="Run Your Business Professionally"
              description="ATLVS helps contractors manage their freelance business with professional tools for job tracking, invoicing, and client communication."
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
              title="Tools for Freelance Success"
              description="Everything you need to run your contracting business professionally"
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
              description="Join thousands of contractors who trust ATLVS to manage their freelance careers."
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
