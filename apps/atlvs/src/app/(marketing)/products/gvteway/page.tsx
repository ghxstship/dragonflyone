"use client";

/**
 * GVTEWAY Product Page
 * Marketing product overview - NO TABS, scrollable marketing layout
 */

import { useRouter } from "next/navigation";
import { Ticket, QrCode, BarChart3, Shield, Check, ArrowRight, CreditCard, Smartphone } from "lucide-react";
import {
  Body, Button, Card, Grid, Stack, Container, Display, H1, H3, Label, Text, Article, Box
} from "@ghxstship/ui";

const FEATURES = [
  { icon: <Ticket className="size-6" />, title: "Ticket Sales", description: "Flexible ticketing with multiple tiers, dynamic pricing, and promotional codes" },
  { icon: <QrCode className="size-6" />, title: "Access Control", description: "Secure QR-based entry, credential management, and real-time validation" },
  { icon: <BarChart3 className="size-6" />, title: "Analytics", description: "Real-time sales dashboards, attendance tracking, and revenue reporting" },
  { icon: <Shield className="size-6" />, title: "Security", description: "Fraud prevention, secure transactions, and PCI compliance" },
  { icon: <CreditCard className="size-6" />, title: "Payments", description: "Multiple payment methods, instant payouts, and transparent fees" },
  { icon: <Smartphone className="size-6" />, title: "Mobile Experience", description: "Mobile tickets, Apple Wallet, and seamless attendee experience" },
];

const BENEFITS = [
  "Increase ticket sales with smart pricing",
  "Reduce entry wait times by 70%",
  "Real-time attendance tracking",
  "Integrated marketing tools",
  "Mobile-first experience",
  "Comprehensive reporting",
];

const TESTIMONIALS = [
  { quote: "GVTEWAY made our ticketing process seamless and increased sales by 40%.", author: "James P.", role: "Festival Director, Summer Sounds" },
  { quote: "Entry management has never been easier. Lines move faster than ever.", author: "Rachel M.", role: "Venue Manager, The Arena" },
  { quote: "The analytics alone are worth it. We finally understand our audience.", author: "Tom H.", role: "Marketing Director, Concert Series" },
  { quote: "Switching from our old system was painless. Support was incredible.", author: "Nina S.", role: "Operations Manager, Theatre District" },
];

export default function GVTEWAYProductPage() {
  const router = useRouter();

  return (
    <>
      {/* Hero Section */}
      <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <Stack gap={6} className="items-center text-center sm:gap-8">
          <Label size="xs" className="text-brand-yellow">PRODUCTS</Label>
          <Display className="text-white text-display-sm sm:text-display-md lg:text-display-lg">GVTEWAY</Display>
          <Body size="lg" className="max-w-3xl text-on-dark-secondary">
            The modern ticketing and access control platform for live events. From ticket sales to entry management, deliver seamless experiences.
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
          <Article className="border-2 border-ink-950 bg-grey-100 p-6 sm:p-8 lg:p-12 pop-card-gvteway">
            <Body size="lg" className="text-on-light-secondary leading-relaxed">
              Your attendees deserve a seamless experience from purchase to entry. GVTEWAY handles ticketing, 
              access control, and analytics — so you can focus on creating unforgettable events.
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
            <Body size="lg" className="text-on-light-muted max-w-2xl mx-auto">Everything you need to sell tickets and manage access</Body>
          </Stack>
          <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, idx) => (
              <Article key={idx} className="border-2 border-ink-950 bg-white p-6 pop-card-gvteway">
                <Box className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                  <Box className="text-brand-yellow">{feature.icon}</Box>
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
              <Label size="xs" className="text-brand-yellow">WHY GVTEWAY</Label>
              <H1 className="text-white">THE TICKETING ADVANTAGE</H1>
            </Stack>
            <Stack gap={3}>
              {BENEFITS.map((benefit, idx) => (
                <Stack key={idx} direction="horizontal" gap={3} className="items-center">
                  <Check className="size-5 text-brand-yellow flex-shrink-0" />
                  <Body className="text-on-dark-secondary">{benefit}</Body>
                </Stack>
              ))}
            </Stack>
          </Stack>
          <Card className="border-2 border-ink-800 bg-ink-900 p-8 text-center">
            <Stack gap={4} className="items-center">
              <Display className="text-white text-display-sm">Ready to get started?</Display>
              <Body className="text-on-dark-muted">See GVTEWAY in action with a personalized demo</Body>
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
            <Body size="lg" className="text-on-light-muted max-w-2xl mx-auto">Hear from event organizers using GVTEWAY</Body>
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
        <Display size="md" className="text-white">SELL MORE TICKETS</Display>
        <Body size="lg" className="mx-auto mt-4 max-w-xl text-on-dark-muted">
          Join thousands of event organizers already using GVTEWAY to power their ticketing.
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
