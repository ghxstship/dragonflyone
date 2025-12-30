"use client";

/**
 * COMPVSS Product Page
 * Crew management product overview
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Users, Calendar, Clock, DollarSign, Check, ArrowRight, List, Star } from "lucide-react";
import {
  Body, Button, Card, Grid, Stack, DetailPage, Section, SectionHeader} from "@ghxstship/ui";

const FEATURES = [
  { icon: <Users className="size-6" />, title: "Crew Database", description: "Comprehensive database of crew members and their skills" },
  { icon: <Calendar className="size-6" />, title: "Scheduling", description: "Advanced scheduling with availability tracking" },
  { icon: <Clock className="size-6" />, title: "Time Tracking", description: "Accurate time tracking and timesheet management" },
  { icon: <DollarSign className="size-6" />, title: "Payroll", description: "Integrated payroll processing and reporting" },
];

const BENEFITS = [
  "Reduce scheduling conflicts by 80%",
  "Streamline crew communication",
  "Automate timesheet collection",
  "Simplify payroll processing",
  "Track certifications and skills",
  "Manage availability in real-time",
];

export default function COMPVSSProductPage() {
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
              COMPVSS is the complete crew management solution for live events. From scheduling to payroll, 
              manage your entire crew workflow in one platform.
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
                <Body className="font-weight-bold font-weight-bold mb-4">Why COMPVSS?</Body>
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
                <Body className="font-weight-bold font-weight-bold mb-2">Ready to get started?</Body>
                <Body className="text-grey-400 mb-6">See COMPVSS in action</Body>
                <div className="flex gap-4">
                  <Button variant="solid" onClick={() => router.push("/demo")} icon={<ArrowRight className="size-4" />} iconPosition="right">Request Demo</Button>
                  <Button variant="outline" onClick={() => router.push("/pricing")}>View Pricing</Button>
                </div>
              </div>
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
              { quote: "COMPVSS has completely transformed how we manage our crew.", author: "Production Manager" },
              { quote: "Scheduling used to take hours. Now it takes minutes.", author: "Event Coordinator" },
            ].map((testimonial, idx) => (
              <Card key={idx} className="p-6">
                <Body className="text-grey-300 italic mb-4">&quot;{testimonial.quote}&quot;</Body>
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
      header={{ kicker: "Products", title: "COMPVSS", description: "Complete crew management for live events" }}
      backButton={{ label: "Products", href: "/products" }}
      tabs={tabs}
      actions={<Button variant="solid" onClick={() => router.push("/demo")}>Get Started</Button>}
    />
  );
}
