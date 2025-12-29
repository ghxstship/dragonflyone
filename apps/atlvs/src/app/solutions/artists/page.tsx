"use client";

/**
 * Artists Solution Page
 * Solution for artists and performers
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Music, Calendar, DollarSign, Star, Check, ArrowRight, List } from "lucide-react";
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
  { icon: <Calendar className="size-6" />, title: "Booking Management", description: "Track all your bookings in one place" },
  { icon: <DollarSign className="size-6" />, title: "Payment Tracking", description: "Monitor payments and invoices" },
  { icon: <Music className="size-6" />, title: "Rider Management", description: "Manage technical and hospitality riders" },
  { icon: <Star className="size-6" />, title: "Profile & Portfolio", description: "Showcase your work to promoters" },
];

const BENEFITS = ["Centralized booking calendar", "Automated payment reminders", "Digital rider sharing", "Professional portfolio", "Direct promoter connections", "Performance analytics"];

export default function ArtistsSolutionPage() {
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
              ATLVS helps artists manage their bookings, payments, and professional presence. 
              Focus on your craft while we handle the business side.
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
                <Body className="font-weight-bold font-weight-bold mb-2">Join thousands of artists</Body>
                <Body className="text-grey-400 mb-6">Start managing your career professionally</Body>
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
      header={{ kicker: "Solutions", title: "For Artists", description: "Manage your bookings and grow your career" }}
      backButton={{ label: "Solutions", href: "/solutions" }}
      tabs={tabs}
      actions={<Button variant="solid" onClick={() => router.push("/auth/signup")}>Sign Up Free</Button>}
    />
  );
}
