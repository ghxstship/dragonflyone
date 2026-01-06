"use client";

/**
 * Destinations Vertical Page - 2026 Landing Page Best Practices
 * Venue and destination management
 * Full-width marketing layout with hero and content sections
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Check, MapPin, Calendar, DollarSign, Building } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container,
  Body, Card, Grid, Stack,
  type FeatureItem
} from "@ghxstship/ui";

const FEATURES: FeatureItem[] = [
  { id: "venue", icon: <Building className="size-8" />, title: "Venue Management", description: "Manage multiple venues and spaces with comprehensive tools." },
  { id: "events", icon: <Calendar className="size-8" />, title: "Event Coordination", description: "Coordinate events across your venues seamlessly." },
  { id: "booking", icon: <MapPin className="size-8" />, title: "Booking System", description: "Streamlined booking and reservation management." },
  { id: "revenue", icon: <DollarSign className="size-8" />, title: "Revenue Tracking", description: "Track revenue and optimize pricing strategies." },
];

const BENEFITS = ["Maximize utilization", "Streamlined bookings", "Better coordination", "Revenue optimization", "Real-time availability", "Automated scheduling"];

const STATS = [
  { value: "200+", label: "Venues" },
  { value: "40%", label: "More Bookings" },
  { value: "99%", label: "Uptime" },
  { value: "24/7", label: "Support" },
];

export default function DestinationsVerticalPage() {
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
              kicker="Verticals"
              title="Destinations"
              description="Complete platform for venues and destinations hosting live events. Maximize utilization and streamline operations."
              primaryCta={{
                label: "Request Demo",
                onClick: () => router.push("/demo"),
              }}
              secondaryCta={{
                label: "Learn More",
                onClick: () => router.push("/features"),
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
              title="Destination Tools"
              description="Everything you need for successful venue management"
              features={FEATURES}
              columns={4}
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
                  <Body className="text-text-primary font-weight-bold text-h3-md">Why Choose ATLVS for Destinations</Body>
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
              title="Ready to Transform Your Venue?"
              description="See how ATLVS can help you maximize venue utilization and revenue."
              primaryCta={{
                label: "Request Demo",
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
