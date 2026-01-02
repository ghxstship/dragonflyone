"use client";

/**
 * COMPVSS Product Page
 * Marketing product overview - NO TABS, scrollable marketing layout
 */

import { useRouter } from "next/navigation";
import { Users, Calendar, Clock, DollarSign, Check, ArrowRight, ClipboardList, Shield } from "lucide-react";
import {
  Body, Button, Card, Grid, Stack, Container, Display, H1, H3, Label, Text, Article, Box
} from "@ghxstship/ui";

const FEATURES = [
  { icon: <Users className="size-6" />, title: "Crew Database", description: "Comprehensive database of crew members, skills, certifications, and contact info" },
  { icon: <Calendar className="size-6" />, title: "Scheduling", description: "Advanced scheduling with availability tracking and conflict detection" },
  { icon: <Clock className="size-6" />, title: "Time Tracking", description: "Accurate time tracking, timesheet management, and overtime calculations" },
  { icon: <DollarSign className="size-6" />, title: "Payroll", description: "Integrated payroll processing, rate management, and reporting" },
  { icon: <ClipboardList className="size-6" />, title: "Task Management", description: "Assign tasks, track progress, and manage crew responsibilities" },
  { icon: <Shield className="size-6" />, title: "Compliance", description: "Track certifications, licenses, and ensure regulatory compliance" },
];

const BENEFITS = [
  "Reduce scheduling conflicts by 80%",
  "Streamline crew communication",
  "Automate timesheet collection",
  "Simplify payroll processing",
  "Track certifications and skills",
  "Manage availability in real-time",
];

const TESTIMONIALS = [
  { quote: "COMPVSS has completely transformed how we manage our crew. No more spreadsheets!", author: "Mike T.", role: "Production Manager, Festival Productions" },
  { quote: "Scheduling used to take hours. Now it takes minutes. Our crew loves the mobile app.", author: "Lisa K.", role: "Event Coordinator, Stadium Events" },
  { quote: "The payroll integration alone saved us 20 hours per event. Game changer.", author: "David R.", role: "Operations Director, Concert Tours Inc" },
  { quote: "Finally, a crew management tool built by people who understand live events.", author: "Sarah J.", role: "Head of Production, Theatre Group" },
];

export default function COMPVSSProductPage() {
  const router = useRouter();

  return (
    <>
      {/* Hero Section */}
      <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <Stack gap={6} className="items-center text-center sm:gap-8">
          <Label size="xs" className="text-brand-cyan">PRODUCTS</Label>
          <Display className="text-white text-display-sm sm:text-display-md lg:text-display-lg">COMPVSS</Display>
          <Body size="lg" className="max-w-3xl text-on-dark-secondary">
            The complete crew management solution for live events. From scheduling to payroll, manage your entire crew workflow in one platform.
          </Body>
          <Stack direction="horizontal" gap={4} className="flex-wrap justify-center">
            <Button variant="primary" size="lg" onClick={() => router.push("/demo")} icon={<ArrowRight />} iconPosition="right">
              Request Demo
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/pricing")}>
              View Pricing
            </Button>
          </Stack>
        </Stack>
      </Container>

      {/* Overview Section */}
      <Box className="bg-white">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <Article className="border-2 border-ink-950 bg-grey-100 p-6 sm:p-8 lg:p-12 pop-card-compvss">
            <Body size="lg" className="text-on-light-secondary leading-relaxed">
              Your crew is the backbone of every production. COMPVSS gives you the tools to find, schedule, 
              track, and pay your team — all in one place. No more spreadsheets, no more missed calls, no more payroll headaches.
            </Body>
          </Article>
        </Container>
      </Box>

      {/* Features Section */}
      <Box className="bg-white">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <Stack gap={4} className="text-center mb-12">
            <Label size="xs" className="text-on-light-muted">CAPABILITIES</Label>
            <H1 className="text-ink-950">KEY FEATURES</H1>
            <Body size="lg" className="text-on-light-muted max-w-2xl mx-auto">Everything you need to manage crews at scale</Body>
          </Stack>
          <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, idx) => (
              <Article key={idx} className="border-2 border-ink-950 bg-white p-6 pop-card-compvss">
                <Box className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                  <Box className="text-brand-cyan">{feature.icon}</Box>
                </Box>
                <H3 className="font-display text-h6-md uppercase tracking-label text-ink-950">{feature.title}</H3>
                <Body className="mt-2 text-on-light-muted">{feature.description}</Body>
              </Article>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <Grid cols={2} gap={8} className="grid-cols-1 lg:grid-cols-2 items-center">
          <Stack gap={6}>
            <Stack gap={2}>
              <Label size="xs" className="text-brand-cyan">WHY COMPVSS</Label>
              <H1 className="text-white">THE CREW ADVANTAGE</H1>
            </Stack>
            <Stack gap={3}>
              {BENEFITS.map((benefit, idx) => (
                <Stack key={idx} direction="horizontal" gap={3} className="items-center">
                  <Check className="size-5 text-brand-cyan flex-shrink-0" />
                  <Body className="text-on-dark-secondary">{benefit}</Body>
                </Stack>
              ))}
            </Stack>
          </Stack>
          <Card className="border-2 border-ink-800 bg-ink-900 p-8 text-center">
            <Stack gap={4} className="items-center">
              <Display className="text-white text-display-sm">Ready to get started?</Display>
              <Body className="text-on-dark-muted">See COMPVSS in action with a personalized demo</Body>
              <Stack direction="horizontal" gap={4} className="flex-wrap justify-center">
                <Button variant="primary" size="md" onClick={() => router.push("/demo")}>Request Demo</Button>
                <Button variant="outline" size="md" onClick={() => router.push("/pricing")}>View Pricing</Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box className="bg-white">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <Stack gap={4} className="text-center mb-12">
            <Label size="xs" className="text-on-light-muted">TESTIMONIALS</Label>
            <H1 className="text-ink-950">WHAT OUR CUSTOMERS SAY</H1>
            <Body size="lg" className="text-on-light-muted max-w-2xl mx-auto">Hear from production teams using COMPVSS</Body>
          </Stack>
          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2">
            {TESTIMONIALS.map((testimonial, idx) => (
              <Article key={idx} className="border-2 border-ink-950 bg-white p-6 pop-card">
                <Body className="text-on-light-secondary italic mb-4">&ldquo;{testimonial.quote}&rdquo;</Body>
                <Box>
                  <Text className="font-weight-medium text-ink-950">{testimonial.author}</Text>
                  <Text size="sm" className="text-on-light-muted">{testimonial.role}</Text>
                </Box>
              </Article>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <Display size="md" className="text-white">BUILD YOUR DREAM CREW</Display>
        <Body size="lg" className="mx-auto mt-4 max-w-xl text-on-dark-muted">
          Join thousands of production teams already using COMPVSS to manage their crews.
        </Body>
        <Stack direction="horizontal" gap={4} className="mt-8 flex-wrap justify-center">
          <Button variant="primary" size="lg" onClick={() => router.push("/demo")} icon={<ArrowRight />} iconPosition="right">
            Request Demo
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push("/contact")}>
            Contact Sales
          </Button>
        </Stack>
      </Container>
    </>
  );
}
