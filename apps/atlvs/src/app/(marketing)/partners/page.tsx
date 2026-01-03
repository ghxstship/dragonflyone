"use client";

/**
 * Partners Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, partner types, logo cloud, and CTA
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Users, DollarSign, Zap, Check } from "lucide-react";
import {
  MarketingPage, HeroSection, StatsSection, LogoCloud, CTABanner, Container, Stack, Grid, Card, Body, H3, Button, Box,
  type StatItem, type LogoItem} from "@ghxstship/ui";

const PARTNER_TYPES = [
  {
    id: "reseller",
    title: "Reseller Partner",
    description: "Sell ATLVS to your customers and earn industry-leading commissions on every deal you close.",
    icon: <DollarSign className="size-10" />,
    benefits: ["Up to 30% commission", "Sales training & certification", "Marketing materials & co-branding", "Dedicated partner success manager"],
  },
  {
    id: "integration",
    title: "Integration Partner",
    description: "Build powerful integrations with ATLVS and get featured in our marketplace.",
    icon: <Zap className="size-10" />,
    benefits: ["Full API access", "Technical support & documentation", "Co-marketing opportunities", "Partner directory listing"],
  },
  {
    id: "referral",
    title: "Referral Partner",
    description: "Refer customers to ATLVS and earn rewards for every successful conversion.",
    icon: <Users className="size-10" />,
    benefits: ["$500 per qualified referral", "No minimum commitment", "Easy tracking dashboard", "Monthly payouts"],
  },
];

const STATS: StatItem[] = [
  { id: "partners", value: 500, suffix: "+", label: "Partners", description: "Growing network" },
  { id: "countries", value: 50, suffix: "+", label: "Countries", description: "Global reach" },
  { id: "revenue", value: 2, prefix: "$", suffix: "M+", label: "Revenue Shared", description: "With our partners" },
  { id: "integrations", value: 100, suffix: "+", label: "Integrations", description: "Built by partners" },
];

const FEATURED_PARTNERS: LogoItem[] = [
  { id: "techcorp", name: "TechCorp", logo: "/partners/techcorp.svg" },
  { id: "eventpro", name: "EventPro", logo: "/partners/eventpro.svg" },
  { id: "stageworks", name: "StageWorks", logo: "/partners/stageworks.svg" },
  { id: "livenation", name: "LiveNation", logo: "/partners/livenation.svg" },
  { id: "festivalco", name: "FestivalCo", logo: "/partners/festivalco.svg" },
  { id: "venuetech", name: "VenueTech", logo: "/partners/venuetech.svg" },
];

export default function PartnersPage() {
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
              kicker="Partners"
              title="Grow Your Business with ATLVS"
              description="Join our partner ecosystem and unlock new revenue streams. Whether you are a reseller, integrator, or referrer, we have a program for you."
              primaryCta={{
                label: "Become a Partner",
                onClick: () => router.push("/partners/apply"),
              }}
              secondaryCta={{
                label: "Contact Us",
                onClick: () => router.push("/contact"),
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
            <StatsSection
              stats={STATS}
              background="primary"
              animate
            />
          ),
        },
        {
          id: "programs",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={12}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Partnership Types</Body>
                  <H3 className="text-white">Choose Your Program</H3>
                  <Body className="text-on-dark-muted max-w-2xl">Select the partnership model that best fits your business and start earning today.</Body>
                </Stack>

                <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3">
                  {PARTNER_TYPES.map((type) => (
                    <Card
                      key={type.id}
                      className="p-8 border-2 border-border rounded-card pop-card-atlvs group"
                    >
                      <Stack gap={6}>
                        <Box className="p-4 bg-primary/20 rounded-card text-primary w-fit group-hover:scale-110 transition-transform">
                          {type.icon}
                        </Box>

                        <Stack gap={2}>
                          <Body className="text-white font-weight-bold text-h5-md">{type.title}</Body>
                          <Body className="text-on-dark-muted">{type.description}</Body>
                        </Stack>

                        <Stack gap={3}>
                          {type.benefits.map((benefit, idx) => (
                            <Stack key={idx} direction="horizontal" gap={3} className="items-center">
                              <Check className="size-4 text-success flex-shrink-0" />
                              <Body size="sm" className="text-on-dark-secondary">{benefit}</Body>
                            </Stack>
                          ))}
                        </Stack>

                        <Button
                          variant="outline"
                          className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors"
                          onClick={() => router.push(`/partners/apply?type=${type.id}`)}
                        >
                          Apply Now
                        </Button>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Container>
          ),
        },
        {
          id: "partners",
          background: "black",
          content: (
            <LogoCloud
              title="Trusted by Industry Leaders"
              logos={FEATURED_PARTNERS}
              background="black"
            />
          ),
        },
        {
          id: "cta",
          background: "ink",
          pattern: "stripes",
          content: (
            <CTABanner
              title="Ready to Partner with ATLVS?"
              description="Apply today and start growing your business with the leading production management platform."
              primaryCta={{
                label: "Apply to Partner Program",
                onClick: () => router.push("/partners/apply"),
              }}
              secondaryCta={{
                label: "Contact Us",
                onClick: () => router.push("/contact"),
              }}
              background="ink"
            />
          ),
        },
      ]}
      stickyCta={{
        label: "Become a Partner",
        onClick: () => router.push("/partners/apply"),
      }}
    />
  );
}
