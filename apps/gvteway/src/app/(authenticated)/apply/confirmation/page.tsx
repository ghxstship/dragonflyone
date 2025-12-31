"use client";

import {
  Body,
  Button,
  Card,
  H1,
  H2,
  IconBox,
  Label,
  MarketingPage,
  ScrollReveal,
  Stack,
  type MarketingSection,
Box} from "@ghxstship/ui";
import NextLink from "next/link";
import {
  CheckCircle,
  Clock,
  Mail,
  Calendar,
  ArrowRight,
  Home,
} from "lucide-react";

export const runtime = "edge";

// =============================================================================
// APPLICATION CONFIRMATION PAGE
// Displayed after successful membership application submission
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

function ConfirmationContent() {
  return (
    <Stack className="py-16 sm:py-24">
      <ScrollReveal animation="slide-up" duration={600}>
        <Card inverted className="mx-auto max-w-2xl border-2 border-white/20 bg-black p-8 text-center shadow-md sm:p-12">
          <Stack gap={8} className="items-center">
            {/* Success Icon */}
            <IconBox size="xl" variant="success" inverted>
              <CheckCircle className="size-12 text-success" />
            </IconBox>

            {/* Header */}
            <Stack gap={4}>
              <H1 size="md" className="text-white">APPLICATION RECEIVED</H1>
              <Body size="lg" className="text-on-dark-secondary">
                Welcome to the waitlist. We are excited to review your application.
              </Body>
            </Stack>

            {/* What Happens Next */}
            <Card inverted className="w-full border-2 border-ink-800 bg-ink-950 p-6 text-left">
              <Stack gap={6}>
                <H2 size="sm" className="text-white">WHAT HAPPENS NEXT</H2>
                
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={4} className="items-start">
                    <IconBox size="sm" inverted>
                      <Mail className="size-4 text-accent" />
                    </IconBox>
                    <Stack gap={1}>
                      <Label size="sm" className="text-white">Check Your Email</Label>
                      <Body size="sm" className="text-on-dark-muted">
                        We have sent a confirmation to your email address with your application details.
                      </Body>
                    </Stack>
                  </Stack>

                  <Stack direction="horizontal" gap={4} className="items-start">
                    <IconBox size="sm" inverted>
                      <Clock className="size-4 text-accent" />
                    </IconBox>
                    <Stack gap={1}>
                      <Label size="sm" className="text-white">Review Period</Label>
                      <Body size="sm" className="text-on-dark-muted">
                        Our team reviews applications within 24-48 hours. We will notify you of our decision.
                      </Body>
                    </Stack>
                  </Stack>

                  <Stack direction="horizontal" gap={4} className="items-start">
                    <IconBox size="sm" inverted>
                      <Calendar className="size-4 text-accent" />
                    </IconBox>
                    <Stack gap={1}>
                      <Label size="sm" className="text-white">Get Started</Label>
                      <Body size="sm" className="text-on-dark-muted">
                        Once approved, you will receive instructions to complete your membership setup and start exploring.
                      </Body>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Card>

            {/* Status Note */}
            <Stack gap={2} className="text-center">
              <Label size="xs" className="tracking-label text-on-dark-disabled">
                APPLICATION STATUS
              </Label>
              <Stack direction="horizontal" gap={2} className="items-center justify-center">
                <Box className="size-2 animate-pulse rounded-avatar bg-warning" />
                <Label size="sm" className="text-warning">PENDING REVIEW</Label>
              </Stack>
            </Stack>

            {/* Actions */}
            <Stack gap={4} className="w-full">
              <NextLink href="/events" className="w-full">
                <Button
                  variant="solid"
                  size="lg"
                  fullWidth
                  icon={<ArrowRight className="size-4" />}
                  iconPosition="right"
                >
                  Browse Events While You Wait
                </Button>
              </NextLink>
              
              <NextLink href="/" className="w-full">
                <Button
                  variant="ghost"
                  size="lg"
                  fullWidth
                  inverted
                  icon={<Home className="size-4" />}
                >
                  Return Home
                </Button>
              </NextLink>
            </Stack>

            {/* Support Note */}
            <Body size="sm" className="text-on-dark-disabled">
              Questions? Contact us at{" "}
              <NextLink href="mailto:membership@gvteway.com" className="text-white underline">
                membership@gvteway.com
              </NextLink>
            </Body>
          </Stack>
        </Card>
      </ScrollReveal>
    </Stack>
  );
}

// =============================================================================
// MARKETING SECTIONS CONFIGURATION
// =============================================================================

const marketingSections: MarketingSection[] = [
  { id: "confirmation", background: "black", content: <ConfirmationContent /> },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ApplicationConfirmationPage() {
  return (
    <MarketingPage
      sections={marketingSections}
      inverted={true}
    />
  );
}
