"use client";

/**
 * Destinations Solution Page - 2026 Landing Page Best Practices
 * Full-width marketing layout for venues and destinations
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, BarChart3, Check, Building, FileText } from "lucide-react";
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
  { id: "booking", icon: <Calendar className="size-8" />, title: "Venue Booking", description: "Manage venue availability and bookings with an intuitive calendar system." },
  { id: "coordination", icon: <Users className="size-8" />, title: "Event Coordination", description: "Coordinate seamlessly with event organizers and production teams." },
  { id: "spaces", icon: <MapPin className="size-8" />, title: "Space Management", description: "Manage multiple spaces, rooms, and outdoor areas from one dashboard." },
  { id: "analytics", icon: <BarChart3 className="size-8" />, title: "Revenue Analytics", description: "Track revenue, utilization rates, and booking trends over time." },
  { id: "contracts", icon: <FileText className="size-8" />, title: "Contract Management", description: "Generate and manage venue contracts with digital signatures." },
  { id: "portfolio", icon: <Building className="size-8" />, title: "Venue Portfolio", description: "Showcase your venue with professional photos and virtual tours." },
];

const BENEFITS = [
  "Maximize venue utilization",
  "Streamlined booking process",
  "Better client communication",
  "Revenue optimization",
  "Reduced double-bookings",
  "Professional presentation",
  "Automated invoicing",
  "Mobile access",
  "24/7 booking requests",
];

const STATS = [
  { value: "2K+", label: "Venues" },
  { value: "50K+", label: "Events Hosted" },
  { value: "35%", label: "Revenue Increase" },
  { value: "99%", label: "Booking Accuracy" },
];

export default function DestinationsSolutionPage() {
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
              kicker="For Venues"
              title="Maximize Your Venue Potential"
              description="ATLVS helps venues and destinations manage bookings, coordinate events, and maximize revenue with professional venue management tools."
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
              title="Venue Management Tools"
              description="Everything you need to run a successful venue"
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
                  <H3 className="text-white">Why Venues Choose ATLVS</H3>
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
              title="Ready to Transform Your Venue?"
              description="See how ATLVS can help you maximize bookings and streamline operations."
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
