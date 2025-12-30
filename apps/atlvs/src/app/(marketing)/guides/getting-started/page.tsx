"use client";

/**
 * Getting Started Guide Page
 * Introduction to ATLVS
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Book, Check, ArrowRight, Play, List, FileText } from "lucide-react";
import {
  Body, Button, Card, Grid, ProgressBar, DetailPage, Section, SectionHeader} from "@ghxstship/ui";

const STEPS = [
  { id: 1, title: "Create Your Account", description: "Sign up and set up your profile", completed: true },
  { id: 2, title: "Set Up Your Organization", description: "Configure your organization settings", completed: true },
  { id: 3, title: "Invite Team Members", description: "Add your team to collaborate", completed: false },
  { id: 4, title: "Create Your First Project", description: "Start managing your first production", completed: false },
  { id: 5, title: "Explore Features", description: "Discover all the tools available", completed: false },
];

export default function GettingStartedPage() {
  const router = useRouter();
  const completedSteps = STEPS.filter((s) => s.completed).length;
  const progress = (completedSteps / STEPS.length) * 100;

  const tabs = [
    {
      id: "guide",
      label: "Guide",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Body className="font-weight-bold font-weight-medium">Your Progress</Body>
                <Body size="sm" className="text-on-dark-muted">{completedSteps} of {STEPS.length} steps completed</Body>
              </div>
              <Body className="font-weight-bold font-weight-bold text-primary">{Math.round(progress)}%</Body>
            </div>
            <ProgressBar value={progress} size="lg" />
          </Card>

          <div className="space-y-4">
            {STEPS.map((step, idx) => (
              <Card key={step.id} className={`p-6 ${step.completed ? "border-success" : ""}`}>
                <div className="flex items-start gap-4">
                  <div className={`size-10 rounded-avatar flex items-center justify-center ${step.completed ? "bg-success text-white" : "bg-grey-800 text-on-dark-muted"}`}>
                    {step.completed ? <Check className="size-5" /> : <Body className="font-weight-bold">{step.id}</Body>}
                  </div>
                  <div className="flex-1">
                    <Body className="font-weight-bold font-weight-medium">{step.title}</Body>
                    <Body className="text-on-dark-muted">{step.description}</Body>
                  </div>
                  {!step.completed && (
                    <Button variant={idx === completedSteps ? "solid" : "outline"} size="sm" icon={<ArrowRight className="size-4" />} iconPosition="right">
                      {idx === completedSteps ? "Start" : "View"}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ),
    },
    {
      id: "resources",
      label: "Resources",
      icon: <FileText className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Helpful Resources" description="Additional materials to help you get started" />
          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2 mt-6">
            <Card className="p-6 cursor-pointer hover:border-primary" onClick={() => router.push("/docs")}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-card"><Book className="size-6 text-primary" /></div>
                <div>
                  <Body className="font-weight-bold">Documentation</Body>
                  <Body size="sm" className="text-on-dark-muted">Comprehensive guides and reference</Body>
                </div>
              </div>
            </Card>
            <Card className="p-6 cursor-pointer hover:border-primary" onClick={() => router.push("/demo")}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-card"><Play className="size-6 text-primary" /></div>
                <div>
                  <Body className="font-weight-bold">Video Tutorials</Body>
                  <Body size="sm" className="text-on-dark-muted">Watch step-by-step walkthroughs</Body>
                </div>
              </div>
            </Card>
          </Grid>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Guide",
        title: "Getting Started",
        description: "Complete these steps to set up your ATLVS account",
      }}
      backButton={{ label: "Guides", href: "/guides" }}
      tabs={tabs}
    />
  );
}
