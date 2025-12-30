"use client";

/**
 * Solution Detail Page - 2026 Landing Page Best Practices
 * Dynamic solution page by slug with hero, features, benefits, and CTA
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useParams, useRouter } from "next/navigation";
import { Check, Zap, Target, TrendingUp, Users } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container, Stack, Grid, Card, Body, H3} from "@ghxstship/ui";

interface SolutionData {
  title: string;
  kicker: string;
  description: string;
  longDescription: string;
  features: FeatureItem[];
  benefits: string[];
  stats: { value: string; label: string }[];
}

const SOLUTIONS: Record<string, SolutionData> = {
  "festivals": {
    title: "Festival Management",
    kicker: "For Festivals",
    description: "Complete solution for music festivals and large-scale events",
    longDescription: "ATLVS provides everything you need to plan, execute, and manage successful festivals. From multi-stage scheduling to vendor coordination, our platform streamlines every aspect of festival production.",
    features: [
      { id: "1", icon: <Zap className="size-8" />, title: "Multi-Stage Scheduling", description: "Coordinate multiple stages with real-time scheduling and conflict detection." },
      { id: "2", icon: <Users className="size-8" />, title: "Vendor Coordination", description: "Manage vendors, contracts, and deliverables in one central platform." },
      { id: "3", icon: <Target className="size-8" />, title: "Crowd Management", description: "Real-time crowd analytics and safety monitoring tools." },
      { id: "4", icon: <TrendingUp className="size-8" />, title: "Artist Management", description: "Handle artist logistics, riders, and scheduling seamlessly." },
    ],
    benefits: ["Reduce planning time by 60%", "Improve vendor communication", "Real-time crowd analytics", "Streamlined artist logistics", "Centralized document management", "Mobile-first crew coordination"],
    stats: [{ value: "60%", label: "Time Saved" }, { value: "500+", label: "Festivals Managed" }, { value: "99.9%", label: "Uptime" }, { value: "24/7", label: "Support" }],
  },
  "corporate": {
    title: "Corporate Events",
    kicker: "For Corporate",
    description: "Professional event management for corporate functions",
    longDescription: "Deliver flawless corporate events that impress stakeholders and achieve business objectives. ATLVS provides the tools you need for conferences, product launches, and executive briefings.",
    features: [
      { id: "1", icon: <Zap className="size-8" />, title: "Conference Planning", description: "End-to-end conference management with session scheduling and speaker coordination." },
      { id: "2", icon: <Users className="size-8" />, title: "Executive Briefings", description: "High-touch event management for C-suite and board-level events." },
      { id: "3", icon: <Target className="size-8" />, title: "Team Building Events", description: "Plan and execute engaging team building activities and offsites." },
      { id: "4", icon: <TrendingUp className="size-8" />, title: "Product Launches", description: "Coordinate complex product launches with precision timing." },
    ],
    benefits: ["Impress stakeholders", "Seamless execution", "Brand consistency", "Measurable ROI", "Professional reporting", "Enterprise security"],
    stats: [{ value: "1000+", label: "Events Delivered" }, { value: "98%", label: "Client Satisfaction" }, { value: "50%", label: "Cost Reduction" }, { value: "Fortune 500", label: "Trusted By" }],
  },
  "concerts": {
    title: "Concert Production",
    kicker: "For Concerts",
    description: "End-to-end concert production management",
    longDescription: "From intimate venues to stadium tours, ATLVS scales with your production needs. Manage tours, coordinate venues, and track every detail of your concert production.",
    features: [
      { id: "1", icon: <Zap className="size-8" />, title: "Tour Management", description: "Plan and execute multi-city tours with comprehensive logistics tracking." },
      { id: "2", icon: <Users className="size-8" />, title: "Venue Coordination", description: "Manage venue relationships, contracts, and technical requirements." },
      { id: "3", icon: <Target className="size-8" />, title: "Technical Production", description: "Coordinate sound, lighting, and staging across all venues." },
      { id: "4", icon: <TrendingUp className="size-8" />, title: "Merchandise Tracking", description: "Track merchandise inventory and sales across tour dates." },
    ],
    benefits: ["Scale across venues", "Consistent quality", "Efficient load-in/out", "Revenue optimization", "Real-time tour updates", "Crew management"],
    stats: [{ value: "10K+", label: "Shows Managed" }, { value: "45%", label: "Efficiency Gain" }, { value: "200+", label: "Venues" }, { value: "Global", label: "Coverage" }],
  },
  "theater": {
    title: "Theater Productions",
    kicker: "For Theater",
    description: "Complete theater production management",
    longDescription: "From rehearsals to opening night, ATLVS helps theater companies deliver exceptional productions. Manage cast, crew, sets, and costumes with precision.",
    features: [
      { id: "1", icon: <Zap className="size-8" />, title: "Rehearsal Scheduling", description: "Coordinate complex rehearsal schedules with cast and crew availability." },
      { id: "2", icon: <Users className="size-8" />, title: "Cast Management", description: "Manage cast contracts, schedules, and communications." },
      { id: "3", icon: <Target className="size-8" />, title: "Set Design Tracking", description: "Track set construction, props, and scenic elements." },
      { id: "4", icon: <TrendingUp className="size-8" />, title: "Costume Inventory", description: "Manage costume inventory, fittings, and quick changes." },
    ],
    benefits: ["Streamlined rehearsals", "Better cast coordination", "Efficient tech weeks", "Opening night success", "Budget tracking", "Historical archives"],
    stats: [{ value: "500+", label: "Productions" }, { value: "Broadway", label: "Trusted By" }, { value: "40%", label: "Time Saved" }, { value: "Award", label: "Winning" }],
  },
};

export default function SolutionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const solution = SOLUTIONS[slug] || {
    title: "Solution",
    kicker: "Solutions",
    description: "Industry solution",
    longDescription: "ATLVS provides comprehensive tools for your production needs.",
    features: [],
    benefits: [],
    stats: [],
  };

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
              kicker={solution.kicker}
              title={solution.title}
              description={solution.longDescription}
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
                {solution.stats.map((stat, idx) => (
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
              title="Key Capabilities"
              description="Everything you need for successful productions"
              features={solution.features}
              columns={2}
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
                  <H3 className="text-white">Why Choose ATLVS</H3>
                </Stack>

                <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3">
                  {solution.benefits.map((benefit, idx) => (
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
              title={`Ready to Transform Your ${solution.title}?`}
              description="See how ATLVS can help your team deliver exceptional productions."
              primaryCta={{
                label: "Schedule a Demo",
                onClick: () => router.push("/demo"),
              }}
              secondaryCta={{
                label: "View Case Studies",
                onClick: () => router.push("/case-studies"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
