"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  H2,
  Body,
  Button,
  Stack,
  Card,
  Label,
  Spinner,
  ScrollReveal,
  AuthPage,
  IconBox,
  Alert,
  useNotifications,
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
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");
  const { addNotification } = useNotifications();

  const handleResendVerification = async () => {
    if (!email) {
      addNotification({
        type: "error",
        title: "Error",
        message: "No email address provided",
      });
      return;
    }

    setIsResending(true);
    setResendError("");
    setResendSuccess(false);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to resend verification email");
      }

      setResendSuccess(true);
      addNotification({
        type: "success",
        title: "Email Sent",
        message: "Verification email has been resent",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to resend verification email";
      setResendError(message);
      addNotification({
        type: "error",
        title: "Error",
        message,
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card inverted className="border-2 border-white/20 bg-black p-6 shadow-md sm:p-8">
      <Stack gap={6} className="text-center sm:gap-8">
        {/* Icon */}
        <IconBox size="lg" variant="warning" inverted className="mx-auto">
          <Mail className="size-6 text-warning sm:size-8" />
        </IconBox>

        <Stack gap={3} className="sm:gap-4">
          <H2 className="text-white">VERIFY YOUR EMAIL</H2>
          <Body size="sm" className="text-on-dark-muted">
            We&apos;ve sent a verification email to{" "}
            {email && <strong className="text-white">{email}</strong>}
            {!email && "your email address"}. Please click the link in the email to verify
            your account.
          </Body>
        </Stack>

        {resendError && <Alert variant="error">{resendError}</Alert>}
        {resendSuccess && <Alert variant="success">Verification email has been resent!</Alert>}

        <Stack gap={3}>
          <Label size="xs" className="text-on-dark-disabled">
            Didn&apos;t receive the email?
          </Label>

          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={handleResendVerification}
            disabled={isResending}
            icon={<RefreshCw className={`size-4 ${isResending ? "animate-spin" : ""}`} />}
            iconPosition="left"
          >
            {isResending ? "Sending..." : "Resend Verification Email"}
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
                <Spinner variant="grey" size="lg" />
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
