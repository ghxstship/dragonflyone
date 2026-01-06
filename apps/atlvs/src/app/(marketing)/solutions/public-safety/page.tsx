"use client";

/**
 * Public Safety Solution Page - 2026 Landing Page Best Practices
 * Full-width marketing layout for public safety teams
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Shield, Check, AlertTriangle, Radio, FileText, Users, MapPin } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container, Stack, Grid, Card, Body, H3} from "@ghxstship/ui";

const FEATURES: FeatureItem[] = [
  { id: "planning", icon: <Shield className="size-8" />, title: "Safety Planning", description: "Create comprehensive safety plans with risk assessments and mitigation strategies." },
  { id: "incidents", icon: <AlertTriangle className="size-8" />, title: "Incident Tracking", description: "Log, track, and respond to incidents in real-time with full documentation." },
  { id: "coordination", icon: <Radio className="size-8" />, title: "Team Coordination", description: "Coordinate security, medical, and emergency response teams seamlessly." },
  { id: "compliance", icon: <FileText className="size-8" />, title: "Compliance Management", description: "Ensure regulatory compliance with automated checklists and documentation." },
  { id: "mapping", icon: <MapPin className="size-8" />, title: "Venue Mapping", description: "Interactive venue maps with emergency exits, medical stations, and security posts." },
  { id: "staffing", icon: <Users className="size-8" />, title: "Staff Management", description: "Schedule and manage security personnel, medical staff, and volunteers." },
];

const BENEFITS = [
  "Enhanced safety",
  "Quick response",
  "Regulatory compliance",
  "Risk mitigation",
  "Real-time communication",
  "Incident documentation",
  "Staff coordination",
  "Emergency protocols",
  "Post-event reporting",
];

const STATS = [
  { value: "1K+", label: "Safety Teams" },
  { value: "50K+", label: "Events Secured" },
  { value: "99.9%", label: "Incident Response" },
  { value: "Zero", label: "Major Incidents" },
];

export default function PublicSafetySolutionPage() {
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
              kicker="For Public Safety"
              title="Keep Events Safe & Secure"
              description="Specialized tools for public safety teams in the live events industry. Plan, coordinate, and respond with confidence."
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
                    <Body className="text-text-primary font-weight-bold text-h3-md">{stat.value}</Body>
                    <Body className="text-text-primary/80">{stat.label}</Body>
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
              title="Public Safety Tools"
              description="Everything you need to keep events safe"
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
                  <H3 className="text-text-primary">Why Safety Teams Choose ATLVS</H3>
                </Stack>

                <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3">
                  {BENEFITS.map((benefit, idx) => (
                    <Card key={idx} className="p-5 border-2 border-border rounded-card">
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Check className="size-5 text-success flex-shrink-0" />
                        <Body className="text-text-primary">{benefit}</Body>
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
              title="Ready to Enhance Event Safety?"
              description="See how ATLVS can help your team plan and execute safer events."
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
