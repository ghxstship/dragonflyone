"use client";

/**
 * Forgot Password Page
 * Password reset request with clean single-column layout
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  Body,
  Box,
  Button,
  Form,
  AuthSplitLayout,
  AuthFormField,
  useToast,
  Stack,
  H1,
  H2,
} from "@ghxstship/ui";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const resetMutation = useMutation({
    mutationFn: async (emailAddress: string) => {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(emailAddress, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (resetError) throw resetError;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Email Sent", "Check your inbox for password reset instructions");
    },
    onError: (err: Error) => {
      toast.error("Error", err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      return;
    }
    setError("");
    resetMutation.mutate(email);
  };

  if (submitted) {
    return (
      <AuthSplitLayout
        singleColumn
        brandLogo={<H1 className="text-white text-h2-md">ATLVS</H1>}
      >
        <Stack gap={8} className="text-center items-center">
          <Box className="p-6 bg-success-500/20 rounded-avatar border-2 border-success-500/30">
            <CheckCircle className="size-12 text-success-500" />
          </Box>
          
          <Stack gap={3} className="items-center">
            <H2 className="text-white">Check Your Email</H2>
            <Body className="text-on-dark-secondary max-w-sm">
              If an account exists for <strong className="text-white">{email}</strong>, you will receive an email with instructions to reset your password.
            </Body>
          </Stack>

          <Stack gap={3} className="w-full max-w-xs">
            <Button
              variant="solid"
              fullWidth
              onClick={() => router.push("/auth/signin")}
              icon={<ArrowLeft className="size-4" />}
              iconPosition="left"
            >
              Back to Sign In
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSubmitted(false)}
              className="text-on-dark-muted"
            >
              Try a different email
            </Button>
          </Stack>
        </Stack>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      title="Forgot Password?"
      subtitle="No worries, we'll send you reset instructions"
      footer={{ text: "Remember your password?", linkText: "Sign in", linkHref: "/auth/signin" }}
      singleColumn
      brandLogo={<H1 className="text-white text-h2-md">ATLVS</H1>}
    >
      <Form onSubmit={handleSubmit}>
        <Stack gap={5}>
          <AuthFormField
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setEmail(e.target.value);
              setError("");
            }}
            errorMessage={error}
            icon={<Mail className="size-5" />}
            autoComplete="email"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={resetMutation.isPending}
            loadingText="Sending..."
          >
            Send Reset Link
          </Button>

          <Button
            variant="ghost"
            fullWidth
            type="button"
            onClick={() => router.push("/auth/signin")}
            icon={<ArrowLeft className="size-4" />}
            iconPosition="left"
          >
            Back to Sign In
          </Button>
        </Stack>
      </Form>
    </AuthSplitLayout>
  );
}
