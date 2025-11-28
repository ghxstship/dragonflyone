"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  H2,
  Body,
  Button,
  Stack,
  Card,
  Label,
  LoadingSpinner,
  ScrollReveal,
  AuthPage,
} from "@ghxstship/ui";
import { Mail, RefreshCw, ArrowLeft } from "lucide-react";
import NextLink from "next/link";

// =============================================================================
// VERIFY EMAIL PAGE - Email Verification Confirmation
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <Card inverted className="border-2 border-white/20 bg-black p-6 shadow-md sm:p-8">
      <Stack gap={6} className="text-center sm:gap-8">
        {/* Icon */}
        <div className="mx-auto flex size-12 items-center justify-center border-2 border-white/20 bg-white/5 sm:size-16">
          <Mail className="size-6 text-warning sm:size-8" />
        </div>

        <Stack gap={3} className="sm:gap-4">
          <H2 className="text-white">VERIFY YOUR EMAIL</H2>
          <Body size="sm" className="text-on-dark-muted">
            We&apos;ve sent a verification email to{" "}
            {email && <strong className="text-white">{email}</strong>}
            {!email && "your email address"}. Please click the link in the email to verify
            your account.
          </Body>
        </Stack>

        <Stack gap={3}>
          <Label size="xs" className="text-on-dark-disabled">
            Didn&apos;t receive the email?
          </Label>

          <Button
            variant="outlineInk"
            size="lg"
            fullWidth
            onClick={() => alert("Verification email resent!")}
            icon={<RefreshCw className="size-4" />}
            iconPosition="left"
          >
            Resend Verification Email
          </Button>
        </Stack>

        <Stack className="border-t border-white/10 pt-6">
          <NextLink href="/auth/signin">
            <Button
              variant="ghost"
              size="sm"
              inverted
              icon={<ArrowLeft className="size-4" />}
              iconPosition="left"
            >
              Back to Sign In
            </Button>
          </NextLink>
        </Stack>
      </Stack>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthPage appName="GVTEWAY" background="black">
      <ScrollReveal animation="slide-up" duration={600}>
        <Suspense
          fallback={
            <Card inverted className="border-2 border-white/20 bg-black p-8">
              <Stack gap={6} className="items-center text-center">
                <LoadingSpinner size="lg" />
                <Body size="sm" className="text-on-dark-muted">
                  Loading...
                </Body>
              </Stack>
            </Card>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </ScrollReveal>
    </AuthPage>
  );
}
