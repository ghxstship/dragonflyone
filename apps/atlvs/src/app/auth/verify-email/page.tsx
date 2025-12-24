"use client";

import {
  AuthPage,
  Body,
  Button,
  Card,
  H2,
  IconBox,
  Label,
  ScrollReveal,
  Spinner,
  Stack,
  useNotifications,
} from '@ghxstship/ui';

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, RefreshCw, ArrowLeft } from "lucide-react";
import NextLink from "next/link";
import { CreatorNavigationPublic } from "@/components/navigation";

// =============================================================================
// VERIFY EMAIL PAGE - ATLVS Email Verification
// Bold Contemporary Pop Art Adventure Design System - Light Theme
// =============================================================================

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resending, setResending] = useState(false);
  const { addNotification } = useNotifications();

  const handleResend = async () => {
    if (!email) {
      addNotification({
        type: "error",
        title: "Error",
        message: "No email address provided. Please try signing up again.",
      });
      return;
    }

    setResending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to resend verification email");
      }

      addNotification({
        type: "success",
        title: "Email Sent",
        message: "Verification email has been resent. Please check your inbox.",
      });
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to resend verification email. Please try again.",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="border-2 border-black/10 bg-white p-6 shadow-md sm:p-8">
      <Stack gap={6} className="text-center sm:gap-8">
        <IconBox size="lg" className="mx-auto">
          <Mail className="size-6 text-black sm:size-8" />
        </IconBox>

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
            onClick={handleResend}
            disabled={resending}
            icon={<RefreshCw className={`size-4 ${resending ? "animate-spin" : ""}`} />}
            iconPosition="left"
          >
            {resending ? "Sending..." : "Resend Verification Email"}
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
                    <Spinner variant="grey" size="lg" />
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
