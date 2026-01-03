"use client";

/**
 * Getting Started Guide Page - 2026 Landing Page Best Practices
 * Introduction to ATLVS
 * Full-width marketing layout with hero and content sections
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Book, Check, ArrowRight, Play, Zap, Users } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container,
  Body, Button, Card, ProgressBar, Stack, Box,
  type FeatureItem
} from "@ghxstship/ui";

const STEPS = [
  { id: 1, title: "Create Your Account", description: "Sign up and set up your profile", completed: true },
  { id: 2, title: "Set Up Your Organization", description: "Configure your organization settings", completed: true },
  { id: 3, title: "Invite Team Members", description: "Add your team to collaborate", completed: false },
  { id: 4, title: "Create Your First Project", description: "Start managing your first production", completed: false },
  { id: 5, title: "Explore Features", description: "Discover all the tools available", completed: false },
];

const RESOURCES: FeatureItem[] = [
  { id: "docs", icon: <Book className="size-8" />, title: "Documentation", description: "Comprehensive guides and reference materials for all features." },
  { id: "videos", icon: <Play className="size-8" />, title: "Video Tutorials", description: "Watch step-by-step walkthroughs and learn visually." },
  { id: "quickstart", icon: <Zap className="size-8" />, title: "Quick Start", description: "Get up and running in under 5 minutes." },
  { id: "community", icon: <Users className="size-8" />, title: "Community", description: "Connect with other users and get help from experts." },
];

export default function GettingStartedPage() {
  const router = useRouter();
  const completedSteps = STEPS.filter((s) => s.completed).length;
  const progress = (completedSteps / STEPS.length) * 100;

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
              kicker="Guide"
              title="Getting Started"
              description="Complete these steps to set up your ATLVS account and start managing productions like a pro."
              primaryCta={{
                label: "Start Setup",
                onClick: () => router.push("/signup"),
              }}
              secondaryCta={{
                label: "Watch Demo",
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
          id: "progress",
          background: "ink",
          content: (
            <Container size="2xl" className="py-16">
              <Card className="p-8 border-2 border-grey-800 rounded-card">
                <Stack gap={6}>
                  <Stack direction="horizontal" className="justify-between items-center">
                    <Stack gap={1}>
                      <Body className="text-white font-weight-bold text-h4-md">Your Progress</Body>
                      <Body className="text-on-dark-muted">{completedSteps} of {STEPS.length} steps completed</Body>
                    </Stack>
                    <Body className="text-primary font-weight-bold text-h3-md">{Math.round(progress)}%</Body>
                  </Stack>
                  <ProgressBar value={progress} size="lg" />
                </Stack>
              </Card>
            </Container>
          ),
        },
        {
          id: "steps",
          background: "black",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Setup</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Complete These Steps</Body>
                </Stack>

                <Stack gap={4}>
                  {STEPS.map((step, idx) => (
                    <Card key={step.id} className={`p-6 border-2 rounded-card ${step.completed ? "border-success" : "border-grey-800"}`}>
                      <Box className="flex items-start gap-4">
                        <Box className={`size-12 rounded-avatar flex items-center justify-center ${step.completed ? "bg-success text-white" : "bg-grey-800 text-on-dark-muted"}`}>
                          {step.completed ? <Check className="size-6" /> : <Body className="font-weight-bold text-h5-md">{step.id}</Body>}
                        </Box>
                        <Box className="flex-1">
                          <Body className="text-white font-weight-bold">{step.title}</Body>
                          <Body className="text-on-dark-muted">{step.description}</Body>
                        </Box>
                        {!step.completed && (
                          <Button variant={idx === completedSteps ? "solid" : "outline"} size="sm" icon={<ArrowRight className="size-4" />} iconPosition="right">
                            {idx === completedSteps ? "Start" : "View"}
                          </Button>
                        )}
                      </Box>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Container>
          ),
        },
        {
          id: "resources",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <FeatureGrid
              kicker="Resources"
              title="Helpful Materials"
              description="Additional resources to help you get the most out of ATLVS"
              features={RESOURCES}
              columns={4}
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
              title="Need Help?"
              description="Our support team is here to help you get started with ATLVS."
              primaryCta={{
                label: "Contact Support",
                onClick: () => router.push("/contact"),
              }}
              secondaryCta={{
                label: "View Documentation",
                onClick: () => router.push("/docs"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
