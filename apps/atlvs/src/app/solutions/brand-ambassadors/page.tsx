"use client";

/**
 * Brand Ambassadors Solution Page
 * Solution for brand ambassadors
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Users, MapPin, Calendar, BarChart3, Check, ArrowRight, List } from "lucide-react";
import {
  Stack,
  Body,
  Button,
  Card,
  Grid,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

const FEATURES = [
  { icon: <Calendar className="size-6" />, title: "Event Scheduling", description: "Manage your activation schedule" },
  { icon: <MapPin className="size-6" />, title: "Location Tracking", description: "Check-in at event locations" },
  { icon: <BarChart3 className="size-6" />, title: "Performance Metrics", description: "Track engagement and conversions" },
  { icon: <Users className="size-6" />, title: "Team Coordination", description: "Collaborate with your team" },
];

const BENEFITS = ["Easy shift management", "Real-time check-ins", "Photo and report uploads", "Performance tracking", "Direct brand communication", "Quick payments"];

export default function BrandAmbassadorsSolutionPage() {
  const router = useRouter();

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-8 mb-8">
            <Body className="font-weight-bold text-grey-300 leading-relaxed">
              ATLVS empowers brand ambassadors with tools to manage activations, track performance, 
              and communicate with brands seamlessly.
            </Body>
          </Card>

          <SectionHeader title="Key Features" />
          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2 mt-6">
            {FEATURES.map((feature, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/20 rounded-card text-primary">{feature.icon}</div>
                  <div>
                    <Body className="font-weight-bold font-weight-medium mb-2">{feature.title}</Body>
                    <Body className="text-grey-400">{feature.description}</Body>
                  </div>
                </div>
              </Card>
            ))}
          </Grid>

          <Card className="p-8 mt-8">
            <Grid cols={2} gap={8} className="grid-cols-1 lg:grid-cols-2">
              <div>
                <Body className="font-weight-bold font-weight-bold mb-4">Benefits</Body>
                <Stack gap={3}>
                  {BENEFITS.map((benefit, idx) => (
                    <Stack key={idx} direction="horizontal" gap={3} className="items-center">
                      <Check className="size-5 text-success" />
                      <Body>{benefit}</Body>
                    </Stack>
                  ))}
                </Stack>
              </div>
              <div className="flex flex-col justify-center items-center text-center">
                <Body className="font-weight-bold font-weight-bold mb-2">Elevate your ambassador work</Body>
                <Body className="text-grey-400 mb-6">Professional tools for professional ambassadors</Body>
                <Button variant="solid" onClick={() => router.push("/auth/signup")} icon={<ArrowRight className="size-4" />} iconPosition="right">Get Started Free</Button>
              </div>
            </Grid>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Solutions", title: "For Brand Ambassadors", description: "Manage activations and grow your career" }}
      backButton={{ label: "Solutions", href: "/solutions" }}
      tabs={tabs}
      actions={<Button variant="solid" onClick={() => router.push("/auth/signup")}>Sign Up Free</Button>}
    />
  );
}
