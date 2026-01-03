"use client";

/**
 * Verify Email Page - GVTEWAY
 * Email verification confirmation with clean single-column layout
 * Bold Contemporary Pop Art Adventure Design System
 */

export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mail, RefreshCw, ArrowLeft } from "lucide-react";
import {
  Body,
  Box,
  Button,
  AuthSplitLayout,
  Alert,
  useToast,
  Stack,
  H1,
  H2,
  Spinner,
} from "@ghxstship/ui";

function VerifyEmailContent() {
  const router = useRouter();
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
    <AuthSplitLayout
      singleColumn
      brandLogo={<H1 className="text-white text-h2-md">GVTEWAY</H1>}
    >
      <Stack gap={8} className="text-center items-center">
        <Box className="p-6 bg-primary-500/20 rounded-avatar border-2 border-primary-500/30">
          <Mail className="size-12 text-primary-400" />
        </Box>
        
        <Stack gap={3} className="items-center">
          <H2 className="text-white">Verify Your Email</H2>
          <Body className="text-on-dark-secondary max-w-sm">
            We&apos;ve sent a verification link to{" "}
            {email ? <strong className="text-white">{email}</strong> : "your email address"}.
            Please check your inbox and click the link to activate your account.
          </Body>
          <Body size="sm" className="text-on-dark-disabled max-w-sm">
            If you don&apos;t see the email, check your spam folder.
          </Body>
        </Stack>

        {resendError && <Alert variant="error" className="max-w-xs">{resendError}</Alert>}
        {resendSuccess && <Alert variant="success" className="max-w-xs">Verification email has been resent!</Alert>}

        <Stack gap={3} className="w-full max-w-xs">
          <Button
            variant="outline"
            fullWidth
            onClick={handleResendVerification}
            disabled={isResending}
            icon={<RefreshCw className={`size-4 ${isResending ? "animate-spin" : ""}`} />}
            iconPosition="left"
          >
            {isResending ? "Sending..." : "Resend Verification Email"}
          </Button>

          <Button
            variant="ghost"
            fullWidth
            onClick={() => router.push("/auth/signin")}
            icon={<ArrowLeft className="size-4" />}
            iconPosition="left"
          >
            Back to Sign In
          </Button>
        </Stack>
      </Stack>
    </AuthSplitLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <AuthSplitLayout
        singleColumn
        brandLogo={<H1 className="text-white text-h2-md">GVTEWAY</H1>}
      >
        <Stack gap={8} className="text-center items-center">
          <Box className="p-6 bg-primary-500/20 rounded-avatar border-2 border-primary-500/30">
            <Mail className="size-12 text-primary-400" />
          </Box>
          <Stack gap={3} className="items-center">
            <H2 className="text-white">Verify Your Email</H2>
            <Spinner size="md" />
          </Stack>
        </Stack>
      </AuthSplitLayout>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
