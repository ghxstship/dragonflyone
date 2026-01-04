"use client";

/**
 * Magic Link Page - COMPVSS
 * Passwordless authentication with clean single-column layout
 * Bold Contemporary Pop Art Adventure Design System
 */

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Sparkles, ArrowRight, RefreshCw, Mail, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Body,
  Box,
  Button,
  Form,
  AuthSplitLayout,
  AuthFormField,
  Stack,
  Text,
  H2,
  Label,
} from "@ghxstship/ui";

export default function MagicLinkPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Failed to send magic link");
      setSubmitted(true);
    } catch {
      setError("Failed to send magic link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthSplitLayout
        singleColumn
        brandLogo={<Text className="font-display text-white text-h2-md uppercase tracking-display">COMPVSS</Text>}
      >
        <Stack gap={8} className="text-center items-center">
          <Box className="p-6 bg-primary-500/20 rounded-avatar border-2 border-primary-500/30">
            <Sparkles className="size-12 text-primary-400" />
          </Box>
          
          <Stack gap={3} className="items-center">
            <H2 className="text-white">Check Your Email</H2>
            <Body className="text-text-secondary max-w-sm">
              We&apos;ve sent a magic link to <strong className="text-white">{email}</strong>. Click the link in the email to sign in.
            </Body>
            <Label size="xs" className="text-text-disabled">Link expires in 1 hour</Label>
          </Stack>

          <Stack gap={3} className="w-full max-w-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSubmitted(false)}
              icon={<RefreshCw className="size-4" />}
              iconPosition="left"
            >
              Use a different email
            </Button>
          </Stack>
        </Stack>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      title="Magic Link"
      subtitle="Sign in without a password. We'll email you a secure link."
      footer={{ text: "Don't have an account?", linkText: "Sign up", linkHref: "/auth/signup" }}
      singleColumn
      brandLogo={<Text className="font-display text-white text-h2-md uppercase tracking-display">COMPVSS</Text>}
    >
      <Form onSubmit={handleSubmit}>
        <Stack gap={5}>
          {error && <Alert variant="error">{error}</Alert>}

          <AuthFormField
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            icon={<Mail className="size-5" />}
            autoComplete="email"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            loadingText="Sending..."
            icon={<ArrowRight className="size-4" />}
            iconPosition="right"
          >
            Send Magic Link
          </Button>

          <Button
            variant="ghost"
            fullWidth
            type="button"
            onClick={() => router.push("/auth/signin")}
            icon={<ArrowLeft className="size-4" />}
            iconPosition="left"
          >
            Sign in with password instead
          </Button>
        </Stack>
      </Form>
    </AuthSplitLayout>
  );
}
