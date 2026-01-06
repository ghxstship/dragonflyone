"use client";

/**
 * ATLVS Product Page
 * Marketing product overview - NO TABS, scrollable marketing layout
 */

import { useRouter } from "next/navigation";
import { Zap, Calendar, Users, FileText, BarChart3, Shield, Check, ArrowRight } from "lucide-react";
import {
  Body, Button, Card, Grid, Stack, Container, Display, H1, H3, Label, Text, Article, Box
} from "@ghxstship/ui";
import { useCallback } from 'react';

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

const TESTIMONIALS = [
  { quote: "ATLVS transformed how we manage our festival productions. We've cut planning time in half.", author: "Sarah M.", role: "Production Director, Festival Corp" },
  { quote: "The collaboration features are incredible. Our team is more aligned than ever.", author: "John D.", role: "Event Manager, TechGiant Inc" },
  { quote: "Finally, a platform that understands the complexity of live event production.", author: "Emily R.", role: "CEO, Broadway Stars" },
  { quote: "The ROI was immediate. We saw improvements from day one.", author: "Michael B.", role: "Operations Lead, Championship League" },
];

export default function ATLVSProductPage() {
  const router = useRouter();

  const handleRequestDemo = useCallback(() => {
    router.push("/demo");
  }, [router]);

  const handleViewPricing = useCallback(() => {
    router.push("/pricing");
  }, [router]);

  const handleContactSales = useCallback(() => {
    router.push("/contact");
  }, [router]);

  return (
    <>
      {/* Hero Section */}
      <Container className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <Stack gap={6} className="items-center text-text-primary sm:gap-8">
          <Label size="xs" className="text-brand-pink">PRODUCTS</Label>
          <Display className="text-text-primary text-display-sm sm:text-display-md lg:text-display-lg">ATLVS</Display>
          <Body size="lg" className="max-w-3xl text-text-secondary">
            The complete production management platform for live events, entertainment, and experiential marketing.
          </Body>
          <Stack direction="horizontal" gap={4} className="flex-wrap justify-center">
            <Button variant="primary" size="lg" onClick={handleRequestDemo} icon={<ArrowRight />} iconPosition="right">
              Request Demo
            </Button>
            <Button variant="outline" size="lg" onClick={handleViewPricing}>
              View Pricing
            </Button>
          </Stack>
        </Stack>
      </Container>

      {/* Overview Section */}
      <Box className="bg-text-text-primary">
        <Container className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <Article className="border-2 border-border bg-muted p-6 sm:p-8 lg:p-12 pop-card-atlvs">
            <Body size="lg" className="text-text-secondary leading-relaxed">
              From planning to wrap, ATLVS helps you manage every aspect of your productions in one place. 
              Budgets, schedules, documents, team communication — everything your production needs, unified.
            </Body>
          </Article>
        </Container>
      </Box>

      {/* Features Section */}
      <Box className="bg-text-text-primary">
        <Container className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <Stack gap={4} className="text-text-primary mb-12">
            <Label size="xs" className="text-text-muted">CAPABILITIES</Label>
            <H1 className="text-text-primary">KEY FEATURES</H1>
            <Body size="lg" className="text-text-muted max-w-2xl mx-auto">Everything you need to manage productions at scale</Body>
          </Stack>
          <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, idx) => (
              <Article key={idx} className="border-2 border-border bg-text-text-primary p-6 pop-card-atlvs">
                <Box className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-border bg-muted">
                  <Box className="text-brand-pink">{feature.icon}</Box>
                </Box>
                <H3 className="font-display text-h6-md uppercase tracking-label text-text-primary">{feature.title}</H3>
                <Body className="mt-2 text-text-muted">{feature.description}</Body>
              </Article>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <Grid cols={2} gap={8} className="grid-cols-1 lg:grid-cols-2 items-center">
          <Stack gap={6}>
            <Stack gap={2}>
              <Label size="xs" className="text-brand-pink">WHY ATLVS</Label>
              <H1 className="text-text-primary">THE PRODUCTION ADVANTAGE</H1>
            </Stack>
            <Stack gap={3}>
              {BENEFITS.map((benefit, idx) => (
                <Stack key={idx} direction="horizontal" gap={3} className="items-center">
                  <Check className="size-5 text-brand-pink flex-shrink-0" />
                  <Body className="text-text-secondary">{benefit}</Body>
                </Stack>
              ))}
            </Stack>
          </Stack>
          <Card className="border-2 border-border bg-surface-inverse p-8 text-text-primary">
            <Stack gap={4} className="items-center">
              <Display className="text-text-primary text-display-sm">Ready to get started?</Display>
              <Body className="text-text-muted">See ATLVS in action with a personalized demo</Body>
              <Stack direction="horizontal" gap={4} className="flex-wrap justify-center">
                <Button variant="primary" size="md" onClick={() => router.push("/demo")}>Request Demo</Button>
                <Button variant="outline" size="md" onClick={() => router.push("/pricing")}>View Pricing</Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box className="bg-text-text-primary">
        <Container className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <Stack gap={4} className="text-text-primary mb-12">
            <Label size="xs" className="text-text-muted">TESTIMONIALS</Label>
            <H1 className="text-text-primary">WHAT OUR CUSTOMERS SAY</H1>
            <Body size="lg" className="text-text-muted max-w-2xl mx-auto">Hear from production teams using ATLVS</Body>
          </Stack>
          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2">
            {TESTIMONIALS.map((testimonial, idx) => (
              <Article key={idx} className="border-2 border-border bg-text-text-primary p-6 pop-card">
                <Body className="text-text-secondary italic mb-4">&ldquo;{testimonial.quote}&rdquo;</Body>
                <Box>
                  <Text className="font-weight-medium text-text-primary">{testimonial.author}</Text>
                  <Text size="sm" className="text-text-muted">{testimonial.role}</Text>
                </Box>
              </Article>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container className="mx-auto max-w-container-4xl px-4 text-text-primary sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <Display size="md" className="text-text-primary">START YOUR PRODUCTION JOURNEY</Display>
        <Body size="lg" className="mx-auto mt-4 max-w-xl text-text-muted">
          Join thousands of production teams already using ATLVS to deliver exceptional events.
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
