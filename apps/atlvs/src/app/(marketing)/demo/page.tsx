"use client";

/**
 * Demo Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, video, features, and CTA
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Calendar, Users, Zap, Check, BarChart3, Shield, Globe } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, VideoSection, CTABanner, Container, Stack, Grid, Card, Body, H3, Button} from "@ghxstship/ui";

const DEMO_FEATURES: FeatureItem[] = [
  {
    id: "planning",
    icon: <Calendar className="size-8" />,
    title: "Production Planning",
    description: "Streamline your production workflow from start to finish with powerful scheduling tools",
  },
  {
    id: "collaboration",
    icon: <Users className="size-8" />,
    title: "Team Collaboration",
    description: "Work together in real-time with your entire team across multiple locations",
  },
  {
    id: "resources",
    icon: <Zap className="size-8" />,
    title: "Resource Management",
    description: "Track and allocate resources efficiently to maximize your production budget",
  },
  {
    id: "analytics",
    icon: <BarChart3 className="size-8" />,
    title: "Analytics & Reporting",
    description: "Get real-time insights into your production performance and costs",
  },
  {
    id: "security",
    icon: <Shield className="size-8" />,
    title: "Enterprise Security",
    description: "Bank-level security with SOC 2 compliance and end-to-end encryption",
  },
  {
    id: "integrations",
    icon: <Globe className="size-8" />,
    title: "100+ Integrations",
    description: "Connect with your favorite tools and build custom workflows",
  },
];

const DEMO_BENEFITS = [
  "See the platform in action with a live walkthrough",
  "Get answers to your specific questions",
  "Learn how ATLVS fits your workflow",
  "Discover features tailored to your industry",
  "No commitment required",
];

export default function DemoPage() {
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
              kicker="Get Started"
              title="See ATLVS in Action"
              description="Get a personalized demo and discover how ATLVS can transform your production management workflow."
              primaryCta={{
                label: "Schedule a Demo",
                onClick: () => router.push("/demo/request"),
              }}
              secondaryCta={{
                label: "Start Free Trial",
                onClick: () => router.push("/auth/signup"),
              }}
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "video",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <VideoSection
              kicker="Product Overview"
              title="Watch a 2-Minute Overview"
              description="See the key features in action before scheduling your personalized demo"
              videoUrl="https://www.youtube.com/watch?v=demo-video"
              posterUrl="/images/demo-poster.jpg"
              provider="youtube"
              mode="modal"
              background="ink"
            />
          ),
        },
        {
          id: "benefits",
          background: "black",
          content: (
            <Container size="lg" className="py-20">
              <Grid cols={2} gap={12} className="grid-cols-1 lg:grid-cols-2 items-center">
                <Stack gap={8}>
                  <Stack gap={4}>
                    <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Why Schedule a Demo</Body>
                    <H3 className="text-white">Get a Personalized Walkthrough</H3>
                    <Body className="text-on-dark-muted">
                      Our team will walk you through the platform and answer all your questions. 
                      See exactly how ATLVS can solve your specific production challenges.
                    </Body>
                  </Stack>

                  <Stack gap={3}>
                    {DEMO_BENEFITS.map((benefit, idx) => (
                      <Stack key={idx} direction="horizontal" gap={3} className="items-center">
                        <div className="p-1 bg-success/20 rounded-avatar">
                          <Check className="size-4 text-success" />
                        </div>
                        <Body className="text-on-dark-secondary">{benefit}</Body>
                      </Stack>
                    ))}
                  </Stack>

                  <Stack direction="horizontal" gap={4}>
                    <Button
                      variant="solid"
                      size="lg"
                      onClick={() => router.push("/demo/request")}
                      icon={<Calendar className="size-5" />}
                      iconPosition="left"
                    >
                      Schedule a Demo
                    </Button>
                  </Stack>
                </Stack>

                <Card className="p-8 border-2 border-grey-800 rounded-card">
                  <Stack gap={6} className="text-center">
                    <Stack gap={2}>
                      <Body className="text-primary font-weight-semibold">Average Demo Duration</Body>
                      <H3 className="text-white">30 Minutes</H3>
                    </Stack>
                    <Stack gap={2}>
                      <Body className="text-primary font-weight-semibold">Response Time</Body>
                      <H3 className="text-white">Within 24 Hours</H3>
                    </Stack>
                    <Stack gap={2}>
                      <Body className="text-primary font-weight-semibold">Commitment</Body>
                      <H3 className="text-white">None Required</H3>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            </Container>
          ),
        },
        {
          id: "features",
          background: "ink",
          content: (
            <FeatureGrid
              kicker="What You Will See"
              title="Key Features We Cover"
              description="Get a comprehensive overview of everything ATLVS can do for your team"
              features={DEMO_FEATURES}
              columns={3}
              variant="bordered"
              background="ink"
              align="center"
            />
          ),
        },
        {
          id: "cta",
          background: "primary",
          pattern: "halftone",
          content: (
            <CTABanner
              title="Ready to Transform Your Productions?"
              description="Schedule your personalized demo today and see ATLVS in action."
              primaryCta={{
                label: "Schedule a Demo",
                onClick: () => router.push("/demo/request"),
              }}
              secondaryCta={{
                label: "Start Free Trial",
                onClick: () => router.push("/auth/signup"),
              }}
              background="primary"
            />
          ),
        },
      ]}
      stickyCta={{
        label: "Schedule a Demo",
        onClick: () => router.push("/demo/request"),
      }}
    />
  );
}
