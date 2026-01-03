"use client";

/**
 * Promoters Solution Page - 2026 Landing Page Best Practices
 * Full-width marketing layout for promoters
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Megaphone, Check, Ticket, Users, BarChart3, Calendar, Mail } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container, Stack, Grid, Card, Body, H3} from "@ghxstship/ui";

const FEATURES: FeatureItem[] = [
  { id: "promotion", icon: <Megaphone className="size-8" />, title: "Event Promotion", description: "Create and manage promotional campaigns across multiple channels." },
  { id: "tickets", icon: <Ticket className="size-8" />, title: "Ticket Management", description: "Integrate with ticketing platforms and track sales in real-time." },
  { id: "booking", icon: <Calendar className="size-8" />, title: "Artist Booking", description: "Book and manage artists with contracts, riders, and scheduling." },
  { id: "marketing", icon: <Mail className="size-8" />, title: "Marketing Tools", description: "Email campaigns, social media integration, and audience targeting." },
  { id: "analytics", icon: <BarChart3 className="size-8" />, title: "Event Analytics", description: "Track attendance, revenue, and marketing ROI with detailed reports." },
  { id: "network", icon: <Users className="size-8" />, title: "Industry Network", description: "Connect with artists, venues, and vendors in the ATLVS network." },
];

const BENEFITS = [
  "Increased reach",
  "Better conversions",
  "Streamlined bookings",
  "Data-driven marketing",
  "Ticket integration",
  "Artist management",
  "Venue coordination",
  "Real-time analytics",
  "Mobile access",
];

const STATS = [
  { value: "3K+", label: "Promoters" },
  { value: "25K+", label: "Events Promoted" },
  { value: "45%", label: "Ticket Sales Increase" },
  { value: "$100M+", label: "Revenue Generated" },
];

export default function PromotersSolutionPage() {
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
              kicker="For Promoters"
              title="Promote Events That Sell Out"
              description="Specialized tools for promoters in the live events industry. From artist booking to ticket sales, manage every aspect of event promotion."
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
              title="Event Promotion Tools"
              description="Everything you need to promote successful events"
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
                  <H3 className="text-white">Why Promoters Choose ATLVS</H3>
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
              title="Ready to Sell Out Your Next Event?"
              description="See how ATLVS can help you promote events that audiences love."
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
