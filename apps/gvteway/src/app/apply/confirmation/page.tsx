"use client";

import { GvtewayAppLayout } from "@/components/app-layout";
import {
  Display,
  H2,
  Body,
  Button,
  Stack,
  Card,
  Label,
  ScrollReveal,
} from "@ghxstship/ui";
import { Check, Clock, Mail, ArrowRight } from "lucide-react";
import NextLink from "next/link";

export default function ApplicationConfirmationPage() {
  return (
    <GvtewayAppLayout variant="membership">
          <Stack gap={12} className="mx-auto max-w-xl text-center">
            <ScrollReveal animation="scale">
              {/* Success Icon */}
              <div className="mx-auto mb-8 flex size-24 items-center justify-center border-4 border-success bg-success/10">
                <Check className="size-12 text-success" />
              </div>

              <Stack gap={6}>
                <Display size="md" className="text-white">
                  APPLICATION RECEIVED
                </Display>
                <Body size="lg" className="text-on-dark-secondary">
                  Thank you for applying to GVTEWAY. Your application is now under review.
                </Body>
              </Stack>
            </ScrollReveal>

            {/* What's Next Card */}
            <ScrollReveal animation="slide-up" delay={200}>
              <Card inverted className="border-2 border-ink-800 bg-ink-950 p-8 text-left">
                <Stack gap={6}>
                  <H2 className="text-white">What Happens Next</H2>

                  <Stack gap={4}>
                    <Stack direction="horizontal" gap={4} className="items-start">
                      <div className="flex size-10 shrink-0 items-center justify-center border-2 border-ink-700 bg-ink-900">
                        <Mail className="size-5 text-warning" />
                      </div>
                      <Stack gap={1}>
                        <Label size="sm" className="text-white">Check Your Email</Label>
                        <Body size="sm" className="text-on-dark-muted">
                          We&apos;ve sent a confirmation to your email address with your application details.
                        </Body>
                      </Stack>
                    </Stack>

                    <Stack direction="horizontal" gap={4} className="items-start">
                      <div className="flex size-10 shrink-0 items-center justify-center border-2 border-ink-700 bg-ink-900">
                        <Clock className="size-5 text-warning" />
                      </div>
                      <Stack gap={1}>
                        <Label size="sm" className="text-white">Review Period</Label>
                        <Body size="sm" className="text-on-dark-muted">
                          Our membership team reviews applications within 24-48 hours. We&apos;ll notify you once a decision is made.
                        </Body>
                      </Stack>
                    </Stack>

                    <Stack direction="horizontal" gap={4} className="items-start">
                      <div className="flex size-10 shrink-0 items-center justify-center border-2 border-ink-700 bg-ink-900">
                        <Check className="size-5 text-warning" />
                      </div>
                      <Stack gap={1}>
                        <Label size="sm" className="text-white">Get Started</Label>
                        <Body size="sm" className="text-on-dark-muted">
                          Once approved, you&apos;ll receive instructions to complete your membership setup and start exploring experiences.
                        </Body>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            </ScrollReveal>

            {/* CTA */}
            <ScrollReveal animation="fade" delay={400}>
              <Stack gap={4}>
                <NextLink href="/">
                  <Button
                    variant="solid"
                    size="lg"
                    icon={<ArrowRight className="size-4" />}
                    iconPosition="right"
                    className="bg-warning text-black hover:bg-warning/90"
                  >
                    Return Home
                  </Button>
                </NextLink>
                <Label size="xs" className="text-on-dark-disabled">
                  Questions? Contact us at membership@gvteway.com
                </Label>
              </Stack>
            </ScrollReveal>
          </Stack>
    </GvtewayAppLayout>
  );
}
