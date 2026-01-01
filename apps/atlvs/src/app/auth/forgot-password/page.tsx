"use client";

/**
 * Forgot Password Page
 * Password reset request
 * Uses AuthPage template for consistent layout
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  Body, Button, Input, Form, AuthPage, useToast, Box, Stack } from "@ghxstship/ui";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const resetMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
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
      <AuthPage title="Check Your Email" subtitle="We've sent password reset instructions to your email">
        <Stack gap={6} className="text-center">
          <Box className="p-4 bg-success/20 rounded-avatar w-fit mx-auto">
            <Mail className="size-8 text-success" />
          </Box>
          <Body className="text-on-dark-muted">
            If an account exists for {email}, you will receive an email with instructions to reset your password.
          </Body>
          <Button variant="outline" onClick={() => router.push("/auth/signin")} icon={<ArrowLeft className="size-4" />} iconPosition="left">
            Back to Sign In
          </Button>
        </Stack>
      </AuthPage>
    );
  }

  return (
    <AuthPage
      title="Forgot Password"
      subtitle="Enter your email and we'll send you reset instructions"
      footer={{ text: "Remember your password?", linkText: "Sign in", linkHref: "/auth/signin" }}
    >
      <Form onSubmit={handleSubmit}>
        <Box>
          <Body size="sm" className="text-on-dark-muted mb-1">Email</Body>
          <Box className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" />
            <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} className={`pl-10 ${error ? "border-error" : ""}`} />
          </Box>
          {error && <Body size="sm" className="text-error mt-1">{error}</Body>}
        </Box>

        <Button type="submit" variant="solid" className="w-full" disabled={resetMutation.isPending}>
          {resetMutation.isPending ? "Sending..." : "Send Reset Link"}
        </Button>

        <Button variant="ghost" className="w-full" onClick={() => router.push("/auth/signin")} icon={<ArrowLeft className="size-4" />} iconPosition="left">
          Back to Sign In
        </Button>
      </Form>
    </AuthPage>
  );
}
