"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, RefreshCw } from "lucide-react";
import {
  H2, Body, Button, Stack, Card, AuthPage, Alert, useToast} from "@ghxstship/ui";
import NextLink from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");
  const toast = useToast();

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Error", "No email address provided");
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
      toast.success("Email Sent", "Verification email has been resent");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to resend verification email";
      setResendError(message);
      toast.error("Error", message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Stack gap={8} className="mx-auto max-w-md">
      <Card variant="elevated" className="p-8 text-center">
        <Stack gap={6}>
          <Card className="mx-auto flex size-16 items-center justify-center">
            <Mail className="size-8" />
          </Card>
          <H2 className="text-black">Verify Your Email</H2>
          <Body className="text-muted">
            We&apos;ve sent a verification email to{" "}
            {email && <strong className="text-black">{email}</strong>}
            {!email && "your email address"}.
            Please click the link in the email to verify your account.
          </Body>
          {resendError && <Alert variant="error">{resendError}</Alert>}
          {resendSuccess && <Alert variant="success">Verification email has been resent!</Alert>}
          <Stack gap={4}>
            <Body size="sm" className="text-muted">Didn&apos;t receive the email?</Body>
            <Button
              variant="ghost"
              onClick={handleResendVerification}
              disabled={isResending}
              icon={<RefreshCw className={`size-4 ${isResending ? "animate-spin" : ""}`} />}
              iconPosition="left"
            >
              {isResending ? "Sending..." : "Resend Verification Email"}
            </Button>
          </Stack>
          <NextLink href="/auth/signin">
            <Button variant="ghost" size="sm">
              Back to Sign In
            </Button>
          </NextLink>
        </Stack>
      </Card>
    </Stack>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthPage appName="COMPVSS">
      <Suspense fallback={
        <Card variant="elevated" className="p-8 text-center">
          <Stack gap={6}>
            <Card className="mx-auto flex size-16 items-center justify-center">
              <Mail className="size-8" />
            </Card>
            <H2 className="text-black">Verify Your Email</H2>
            <Body className="text-muted">Loading...</Body>
          </Stack>
        </Card>
      }>
        <VerifyEmailContent />
      </Suspense>
    </AuthPage>
  );
}
