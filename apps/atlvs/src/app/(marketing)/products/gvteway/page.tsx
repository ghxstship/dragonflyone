"use client";

/**
 * GVTEWAY Product Page
 * Ticketing product overview
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Ticket, QrCode, BarChart3, Shield, Check, List, Star } from "lucide-react";
import {
  Body, Button, Card, Grid, Stack, DetailPage, Section, SectionHeader, Box} from "@ghxstship/ui";

const FEATURES = [
  { icon: <Ticket className="size-6" />, title: "Ticket Sales", description: "Flexible ticketing with multiple tiers and pricing" },
  { icon: <QrCode className="size-6" />, title: "Access Control", description: "Secure QR-based entry and credential management" },
  { icon: <BarChart3 className="size-6" />, title: "Analytics", description: "Real-time sales and attendance analytics" },
  { icon: <Shield className="size-6" />, title: "Security", description: "Fraud prevention and secure transactions" },
];

const BENEFITS = [
  "Increase ticket sales with smart pricing",
  "Reduce entry wait times by 70%",
  "Real-time attendance tracking",
  "Integrated marketing tools",
  "Mobile-first experience",
  "Comprehensive reporting",
];

export default function GVTEWAYProductPage() {
  const router = useRouter();

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-8 mb-8">
            <Body className="font-weight-bold text-on-dark-secondary leading-relaxed">
              GVTEWAY is the modern ticketing and access control platform for live events. 
              From ticket sales to entry management, deliver seamless experiences for your attendees.
            </Body>
          </Card>

          <SectionHeader title="Key Features" />
          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2 mt-6">
            {FEATURES.map((feature, idx) => (
              <Card key={idx} className="p-6">
                <Box className="flex items-start gap-4">
                  <Box className="p-3 bg-primary/20 rounded-card text-primary">{feature.icon}</Box>
                  <Box>
                    <Body className="font-weight-bold font-weight-medium mb-2">{feature.title}</Body>
                    <Body className="text-on-dark-muted">{feature.description}</Body>
                  </Box>
                </Box>
              </Card>
            ))}
          </Grid>

          <Card className="p-8 mt-8">
            <Grid cols={2} gap={8} className="grid-cols-1 lg:grid-cols-2">
              <Box>
                <Body className="font-weight-bold font-weight-bold mb-4">Why GVTEWAY?</Body>
                <Stack gap={3}>
                  {BENEFITS.map((benefit, idx) => (
                    <Stack key={idx} direction="horizontal" gap={3} className="items-center">
                      <Check className="size-5 text-success" />
                      <Body>{benefit}</Body>
                    </Stack>
                  ))}
                </Stack>
              </Box>
              <Box className="flex flex-col justify-center items-center text-center">
                <Body className="font-weight-bold font-weight-bold mb-2">Ready to get started?</Body>
                <Body className="text-on-dark-muted mb-6">See GVTEWAY in action</Body>
                <Box className="flex gap-4">
                  <Button variant="solid" onClick={() => router.push("/demo")}>Request Demo</Button>
                  <Button variant="outline" onClick={() => router.push("/pricing")}>View Pricing</Button>
                </Box>
              </Box>
            </Grid>
          </Card>
        </Section>
      ),
    },
    {
      id: "testimonials",
      label: "Testimonials",
      icon: <Star className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="What Our Customers Say" />
          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2 mt-6">
            {[
              { quote: "GVTEWAY made our ticketing process seamless and increased sales.", author: "Festival Director" },
              { quote: "Entry management has never been easier or faster.", author: "Venue Manager" },
            ].map((testimonial, idx) => (
              <Card key={idx} className="p-6">
                <Body className="text-on-dark-secondary italic mb-4">&quot;{testimonial.quote}&quot;</Body>
                <Body className="font-weight-medium">{testimonial.author}</Body>
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Products", title: "GVTEWAY", description: "Modern ticketing and access control" }}
      backButton={{ label: "Products", href: "/products" }}
      tabs={tabs}
      actions={<Button variant="solid" onClick={() => router.push("/demo")}>Get Started</Button>}
    />
  );
}
