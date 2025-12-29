"use client";

/**
 * Destinations Solution Page
 * Solution for venues and destinations
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, BarChart3, Check, ArrowRight, List } from "lucide-react";
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
  { icon: <Calendar className="size-6" />, title: "Venue Booking", description: "Manage venue availability and bookings" },
  { icon: <Users className="size-6" />, title: "Event Coordination", description: "Coordinate with event organizers" },
  { icon: <MapPin className="size-6" />, title: "Space Management", description: "Manage multiple spaces and rooms" },
  { icon: <BarChart3 className="size-6" />, title: "Revenue Analytics", description: "Track revenue and utilization" },
];

const BENEFITS = ["Maximize venue utilization", "Streamlined booking process", "Better client communication", "Revenue optimization", "Reduced double-bookings", "Professional presentation"];

export default function DestinationsSolutionPage() {
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
              ATLVS helps venues and destinations manage bookings, coordinate events, 
              and maximize revenue with professional venue management tools.
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
                <Body className="font-weight-bold font-weight-bold mb-2">Maximize your venue potential</Body>
                <Body className="text-grey-400 mb-6">Professional venue management tools</Body>
                <Button variant="solid" onClick={() => router.push("/demo")} icon={<ArrowRight className="size-4" />} iconPosition="right">Request Demo</Button>
              </div>
            </Grid>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Solutions", title: "For Venues & Destinations", description: "Professional venue management" }}
      backButton={{ label: "Solutions", href: "/solutions" }}
      tabs={tabs}
      actions={<Button variant="solid" onClick={() => router.push("/demo")}>Request Demo</Button>}
    />
  );
}
