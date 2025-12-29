"use client";

/**
 * Demo Page
 * Product demo and trial information
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Play, Calendar, Users, Zap, Check, ArrowRight, List, Video } from "lucide-react";
import {
  Body,
  Button,
  Card,
  Grid,
  Stack,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

const FEATURES = [
  { icon: <Calendar className="size-6" />, title: "Production Planning", description: "Streamline your production workflow from start to finish" },
  { icon: <Users className="size-6" />, title: "Team Collaboration", description: "Work together in real-time with your entire team" },
  { icon: <Zap className="size-6" />, title: "Resource Management", description: "Track and allocate resources efficiently" },
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

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={2} gap={8} className="grid-cols-1 lg:grid-cols-2 mb-8">
            <div>
              <Body className="font-weight-bold font-weight-bold mb-4">See ATLVS in Action</Body>
              <Body className="text-grey-300 font-weight-medium mb-6">
                Get a personalized demo of ATLVS and see how it can transform your production management workflow. 
                Our team will walk you through the platform and answer all your questions.
              </Body>
              <Stack gap={3} className="mb-8">
                {DEMO_BENEFITS.map((benefit, idx) => (
                  <Stack key={idx} direction="horizontal" gap={3} className="items-center">
                    <Check className="size-5 text-success" />
                    <Body>{benefit}</Body>
                  </Stack>
                ))}
              </Stack>
              <div className="flex gap-4">
                <Button variant="solid" onClick={() => router.push("/demo/request")} icon={<Calendar className="size-4" />} iconPosition="left">
                  Schedule a Demo
                </Button>
                <Button variant="outline" onClick={() => router.push("/features")} icon={<ArrowRight className="size-4" />} iconPosition="right">
                  Explore Features
                </Button>
              </div>
            </div>
            <Card className="p-8 text-center">
              <div className="aspect-video bg-grey-800 rounded-card flex items-center justify-center mb-4">
                <div className="p-6 bg-primary/20 rounded-avatar">
                  <Play className="size-12 text-primary" />
                </div>
              </div>
              <Body className="font-weight-medium">Watch a 2-minute overview</Body>
              <Body size="sm" className="text-grey-400">See the key features in action</Body>
            </Card>
          </Grid>

          <SectionHeader title="What You'll See" description="Key features we'll cover in your demo" />
          <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3 mt-6">
            {FEATURES.map((feature, idx) => (
              <Card key={idx} className="p-6">
                <div className="p-3 bg-primary/20 rounded-card text-primary w-fit mb-4">{feature.icon}</div>
                <Body className="font-weight-bold font-weight-medium mb-2">{feature.title}</Body>
                <Body className="text-grey-400">{feature.description}</Body>
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
    {
      id: "video",
      label: "Video Tour",
      icon: <Video className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Product Video Tour" description="Watch our product walkthrough videos" />
          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2 mt-6">
            {["Getting Started", "Production Planning", "Team Collaboration", "Reporting & Analytics"].map((title, idx) => (
              <Card key={idx} className="p-6 cursor-pointer hover:border-primary transition-colors">
                <div className="aspect-video bg-grey-800 rounded-card flex items-center justify-center mb-4">
                  <Play className="size-8 text-grey-400" />
                </div>
                <Body className="font-weight-medium">{title}</Body>
                <Body size="sm" className="text-grey-400">5 min video</Body>
              </Card>
            ))}
          </Grid>

          <Card className="p-8 mt-8 text-center">
            <Body className="font-weight-bold font-weight-bold mb-2">Ready for a personalized demo?</Body>
            <Body className="text-grey-400 mb-4">Get a live walkthrough tailored to your needs</Body>
            <Button variant="solid" onClick={() => router.push("/demo/request")}>Schedule a Demo</Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Get Started",
        title: "Request a Demo",
        description: "See how ATLVS can transform your production management",
      }}
      tabs={tabs}
    />
  );
}
