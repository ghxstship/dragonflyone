"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, RefreshCw, ArrowLeft } from "lucide-react";
import {
  H2,
  Body,
  Button,
  Stack,
  Card,
  Label,
  ScrollReveal,
  LoadingSpinner,
  AuthPage,
} from "@ghxstship/ui";
import NextLink from "next/link";
import { CreatorNavigationPublic } from "@/components/navigation";

// =============================================================================
// VERIFY EMAIL PAGE - ATLVS Email Verification
// Bold Contemporary Pop Art Adventure Design System - Light Theme
// =============================================================================

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <Card className="border-2 border-black/10 bg-white p-6 shadow-md sm:p-8">
      <Stack gap={6} className="text-center sm:gap-8">
        <div className="mx-auto flex size-12 items-center justify-center border-2 border-black/10 bg-grey-100 sm:size-16">
          <Mail className="size-6 text-black sm:size-8" />
        </div>

        <Stack gap={3} className="sm:gap-4">
          <H2 className="text-black">VERIFY YOUR EMAIL</H2>
          <Body size="sm" className="text-muted">
            We&apos;ve sent a verification email to{" "}
            {email && <strong className="text-black">{email}</strong>}
            {!email && "your email address"}. Please click the link in the email to verify
            your account.
          </Body>
        </Stack>

        <Stack gap={3}>
          <Label size="xs" className="text-muted">
            Didn&apos;t receive the email?
          </Label>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => alert("Verification email resent!")}
            icon={<RefreshCw className="size-4" />}
            iconPosition="left"
          >
            Resend Verification Email
          </Button>
        </Stack>

        <Stack className="border-t border-black/10 pt-6">
          <NextLink href="/auth/signin">
            <Button
              variant="ghost"
              size="sm"
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
    <AuthPage header={<CreatorNavigationPublic />}>
          <ScrollReveal animation="slide-up" duration={600}>
            <Suspense
              fallback={
                <Card className="border-2 border-black/10 bg-white p-8">
                  <Stack gap={6} className="items-center text-center">
                    <LoadingSpinner size="lg" />
                    <Body size="sm" className="text-muted">
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
