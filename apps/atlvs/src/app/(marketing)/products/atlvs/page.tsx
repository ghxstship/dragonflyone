"use client";

/**
 * ATLVS Product Page
 * Product overview and features
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Zap, Calendar, Users, FileText, BarChart3, Shield, Check, ArrowRight, List, Star } from "lucide-react";
import {
  Body, Button, Card, Grid, Stack, DetailPage, Section, SectionHeader} from "@ghxstship/ui";

const FEATURES = [
  { icon: <Calendar className="size-6" />, title: "Production Planning", description: "Plan and manage every aspect of your productions from start to finish" },
  { icon: <Users className="size-6" />, title: "Team Collaboration", description: "Work together in real-time with your entire production team" },
  { icon: <FileText className="size-6" />, title: "Document Management", description: "Keep all your production documents organized and accessible" },
  { icon: <BarChart3 className="size-6" />, title: "Analytics & Reporting", description: "Get insights into your production performance" },
  { icon: <Shield className="size-6" />, title: "Enterprise Security", description: "Bank-level security for your sensitive production data" },
  { icon: <Zap className="size-6" />, title: "Automation", description: "Automate repetitive tasks and streamline workflows" },
];

const BENEFITS = [
  "Reduce production planning time by 50%",
  "Improve team collaboration and communication",
  "Centralize all production documents",
  "Track budgets and expenses in real-time",
  "Generate reports with one click",
  "Scale from small events to major productions",
];

export default function ATLVSProductPage() {
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
              ATLVS is the complete production management platform for live events, entertainment, and experiential marketing. 
              From planning to wrap, ATLVS helps you manage every aspect of your productions in one place.
            </Body>
          </Card>

          <SectionHeader title="Key Features" description="Everything you need to manage productions at scale" />
          <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3 mt-6">
            {FEATURES.map((feature, idx) => (
              <Card key={idx} className="p-6">
                <div className="p-3 bg-primary/20 rounded-card text-primary w-fit mb-4">{feature.icon}</div>
                <Body className="font-weight-bold font-weight-medium mb-2">{feature.title}</Body>
                <Body className="text-grey-400">{feature.description}</Body>
              </Card>
            ))}
          </Grid>

          <Card className="p-8 mt-8">
            <Grid cols={2} gap={8} className="grid-cols-1 lg:grid-cols-2">
              <div>
                <Body className="font-weight-bold font-weight-bold mb-4">Why ATLVS?</Body>
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
                <Body className="text-grey-400 mb-6">See ATLVS in action with a personalized demo</Body>
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
          <SectionHeader title="What Our Customers Say" description="Hear from production teams using ATLVS" />
          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2 mt-6">
            {[
              { quote: "ATLVS transformed how we manage our festival productions. We've cut planning time in half.", author: "Sarah M.", role: "Production Director, Festival Corp" },
              { quote: "The collaboration features are incredible. Our team is more aligned than ever.", author: "John D.", role: "Event Manager, TechGiant Inc" },
              { quote: "Finally, a platform that understands the complexity of live event production.", author: "Emily R.", role: "CEO, Broadway Stars" },
              { quote: "The ROI was immediate. We saw improvements from day one.", author: "Michael B.", role: "Operations Lead, Championship League" },
            ].map((testimonial, idx) => (
              <Card key={idx} className="p-6">
                <Body className="text-grey-300 italic mb-4">&quot;{testimonial.quote}&quot;</Body>
                <div>
                  <Body className="font-weight-medium">{testimonial.author}</Body>
                  <Body size="sm" className="text-grey-400">{testimonial.role}</Body>
                </div>
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Products",
        title: "ATLVS Production Platform",
        description: "The complete solution for production management",
      }}
      tabs={tabs}
      actions={<Button variant="solid" onClick={() => router.push("/demo")}>Get Started</Button>}
    />
  );
}
