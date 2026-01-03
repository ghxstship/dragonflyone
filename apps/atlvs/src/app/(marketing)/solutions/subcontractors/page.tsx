"use client";

/**
 * Subcontractors Solution Page - 2026 Landing Page Best Practices
 * Full-width marketing layout for subcontractors
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Briefcase, Check, FileText, DollarSign, Users, Calendar, Wrench } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container, Stack, Grid, Card, Body, H3} from "@ghxstship/ui";

const FEATURES: FeatureItem[] = [
  { id: "contracts", icon: <FileText className="size-8" />, title: "Contract Management", description: "Manage subcontracts, scope of work, and deliverables in one place." },
  { id: "invoices", icon: <DollarSign className="size-8" />, title: "Invoice Tracking", description: "Submit invoices and track payment status with prime contractors." },
  { id: "coordination", icon: <Users className="size-8" />, title: "Project Coordination", description: "Coordinate with prime contractors and other subs on shared projects." },
  { id: "documents", icon: <Briefcase className="size-8" />, title: "Document Storage", description: "Store insurance, certifications, and compliance documents securely." },
  { id: "scheduling", icon: <Calendar className="size-8" />, title: "Schedule Management", description: "Manage your project schedule and resource allocation." },
  { id: "equipment", icon: <Wrench className="size-8" />, title: "Equipment Tracking", description: "Track equipment and materials across multiple projects." },
];

const BENEFITS = [
  "Streamlined contracts",
  "Faster payments",
  "Better coordination",
  "Professional management",
  "Compliance tracking",
  "Document storage",
  "Mobile access",
  "Project visibility",
  "Free to start",
];

const STATS = [
  { value: "10K+", label: "Subcontractors" },
  { value: "$100M+", label: "Contracts Managed" },
  { value: "98%", label: "Payment Rate" },
  { value: "Free", label: "To Start" },
];

export default function SubcontractorsSolutionPage() {
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
              kicker="For Subcontractors"
              title="Manage Subcontracts with Ease"
              description="Specialized tools for subcontractors in the live events industry. Manage contracts, track payments, and coordinate with prime contractors."
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
              title="Subcontractor Management Tools"
              description="Everything you need to manage your subcontracting business"
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
                  <H3 className="text-white">Why Subcontractors Choose ATLVS</H3>
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
              title="Ready to Streamline Your Subcontracting?"
              description="Join thousands of subcontractors who trust ATLVS to manage their business."
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
