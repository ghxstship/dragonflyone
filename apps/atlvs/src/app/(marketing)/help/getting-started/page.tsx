"use client";

/**
 * Help Getting Started Page
 * Quick start guide in help center
 * Uses DetailPage template for consistent layout
 */

import { Check, ArrowRight, Play, List} from "lucide-react";
import {
  Body, Button, Card, Grid, ProgressBar, DetailPage, Section, SectionHeader, Box, Stack } from "@ghxstship/ui";

const QUICK_START_STEPS = [
  { id: 1, title: "Sign Up", description: "Create your free account", completed: true },
  { id: 2, title: "Set Up Profile", description: "Complete your profile information", completed: true },
  { id: 3, title: "Create Organization", description: "Set up your organization", completed: false },
  { id: 4, title: "Invite Team", description: "Add team members", completed: false },
  { id: 5, title: "First Project", description: "Create your first project", completed: false },
];

export default function HelpGettingStartedPage() {
  const completedSteps = QUICK_START_STEPS.filter((s) => s.completed).length;
  const progress = (completedSteps / QUICK_START_STEPS.length) * 100;

  const tabs = [
    {
      id: "quickstart",
      label: "Quick Start",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-6 mb-6">
            <Box className="flex items-center justify-between mb-4">
              <Body className="font-weight-bold font-weight-medium">Your Progress</Body>
              <Body className="font-weight-bold font-weight-bold text-primary">{Math.round(progress)}%</Body>
            </Box>
            <ProgressBar value={progress} size="lg" />
          </Card>

          <Stack gap={4}>
            {QUICK_START_STEPS.map((step, idx) => (
              <Card key={step.id} className={`p-6 ${step.completed ? "border-success" : ""}`}>
                <Box className="flex items-start gap-4">
                  <Box className={`size-10 rounded-avatar flex items-center justify-center ${step.completed ? "bg-success text-white" : "bg-grey-800 text-on-dark-muted"}`}>
                    {step.completed ? <Check className="size-5" /> : <Body className="font-weight-bold">{step.id}</Body>}
                  </Box>
                  <Box className="flex-1">
                    <Body className="font-weight-bold">{step.title}</Body>
                    <Body size="sm" className="text-on-dark-muted">{step.description}</Body>
                  </Box>
                  {!step.completed && idx === completedSteps && (
                    <Button variant="solid" size="sm" icon={<ArrowRight className="size-4" />} iconPosition="right">Start</Button>
                  )}
                </Box>
              </Card>
            ))}
          </Stack>
        </Section>
      ),
    },
    {
      id: "videos",
      label: "Video Guides",
      icon: <Play className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Video Tutorials" description="Watch step-by-step guides" />
          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2 mt-6">
            {["Platform Overview", "Creating Projects", "Team Collaboration", "Reporting"].map((title, idx) => (
              <Card key={idx} className="p-6 cursor-pointer hover:border-primary">
                <Box className="aspect-video bg-grey-800 rounded-card flex items-center justify-center mb-4">
                  <Play className="size-8 text-on-dark-muted" />
                </Box>
                <Body className="font-weight-medium">{title}</Body>
                <Body size="sm" className="text-on-dark-muted">5 min video</Body>
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Help", title: "Getting Started", description: "Learn the basics of ATLVS" }}
      backButton={{ label: "Help Center", href: "/help" }}
      tabs={tabs}
    />
  );
}
