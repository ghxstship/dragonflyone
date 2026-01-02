"use client";

/**
 * Help Getting Started Page - 2026 Landing Page Best Practices
 * Quick start guide in help center
 * Full-width marketing layout with hero and content sections
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Check, ArrowRight, Play, Book, Users, Zap } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container,
  Body, Button, Card, Grid, ProgressBar, Stack, Box,
  type FeatureItem
} from "@ghxstship/ui";

const QUICK_START_STEPS = [
  { id: 1, title: "Sign Up", description: "Create your free account", completed: true },
  { id: 2, title: "Set Up Profile", description: "Complete your profile information", completed: true },
  { id: 3, title: "Create Organization", description: "Set up your organization", completed: false },
  { id: 4, title: "Invite Team", description: "Add team members", completed: false },
  { id: 5, title: "First Project", description: "Create your first project", completed: false },
];

const VIDEO_TUTORIALS = [
  { title: "Platform Overview", duration: "5 min" },
  { title: "Creating Projects", duration: "8 min" },
  { title: "Team Collaboration", duration: "6 min" },
  { title: "Reporting", duration: "7 min" },
];

const RESOURCES: FeatureItem[] = [
  { id: "docs", icon: <Book className="size-8" />, title: "Documentation", description: "Comprehensive guides and reference materials." },
  { id: "videos", icon: <Play className="size-8" />, title: "Video Tutorials", description: "Watch step-by-step visual guides." },
  { id: "community", icon: <Users className="size-8" />, title: "Community", description: "Connect with other users and experts." },
  { id: "quickstart", icon: <Zap className="size-8" />, title: "Quick Start", description: "Get up and running in minutes." },
];

export default function HelpGettingStartedPage() {
  const router = useRouter();
  const completedSteps = QUICK_START_STEPS.filter((s) => s.completed).length;
  const progress = (completedSteps / QUICK_START_STEPS.length) * 100;

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
              kicker="Help"
              title="Getting Started"
              description="Learn the basics of ATLVS and get your team up and running quickly."
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
            <Container size="lg" className="py-16">
              <Card className="p-8 border-2 border-grey-800 rounded-card">
                <Stack gap={6}>
                  <Stack direction="horizontal" className="justify-between items-center">
                    <Stack gap={1}>
                      <Body className="text-white font-weight-bold text-h4-md">Your Progress</Body>
                      <Body className="text-on-dark-muted">{completedSteps} of {QUICK_START_STEPS.length} steps completed</Body>
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
            <Container size="lg" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Setup</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Quick Start Steps</Body>
                </Stack>

                <Stack gap={4}>
                  {QUICK_START_STEPS.map((step, idx) => (
                    <Card key={step.id} className={`p-6 border-2 rounded-card ${step.completed ? "border-success" : "border-grey-800"}`}>
                      <Box className="flex items-start gap-4">
                        <Box className={`size-12 rounded-avatar flex items-center justify-center ${step.completed ? "bg-success text-white" : "bg-grey-800 text-on-dark-muted"}`}>
                          {step.completed ? <Check className="size-6" /> : <Body className="font-weight-bold text-h5-md">{step.id}</Body>}
                        </Box>
                        <Box className="flex-1">
                          <Body className="text-white font-weight-bold">{step.title}</Body>
                          <Body className="text-on-dark-muted">{step.description}</Body>
                        </Box>
                        {!step.completed && idx === completedSteps && (
                          <Button variant="solid" size="sm" icon={<ArrowRight className="size-4" />} iconPosition="right">Start</Button>
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
          id: "videos",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <Container size="xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Learn</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Video Tutorials</Body>
                  <Body className="text-on-dark-muted">Watch step-by-step guides to master ATLVS</Body>
                </Stack>

                <Grid cols={4} gap={6} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  {VIDEO_TUTORIALS.map((video, idx) => (
                    <Card key={idx} className="p-6 border-2 border-grey-800 rounded-card pop-card cursor-pointer">
                      <Box className="aspect-video bg-grey-800 rounded-card flex items-center justify-center mb-4">
                        <Play className="size-10 text-on-dark-muted" />
                      </Box>
                      <Body className="text-white font-weight-medium">{video.title}</Body>
                      <Body size="sm" className="text-on-dark-muted">{video.duration}</Body>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Container>
          ),
        },
        {
          id: "resources",
          background: "black",
          content: (
            <FeatureGrid
              kicker="Resources"
              title="More Ways to Learn"
              description="Additional resources to help you succeed with ATLVS"
              features={RESOURCES}
              columns={4}
              variant="bordered"
              background="black"
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
              description="Our support team is here to assist you with any questions."
              primaryCta={{
                label: "Contact Support",
                onClick: () => router.push("/contact"),
              }}
              secondaryCta={{
                label: "Help Center",
                onClick: () => router.push("/help"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
