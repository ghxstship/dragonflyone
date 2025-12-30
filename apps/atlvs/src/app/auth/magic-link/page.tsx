"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, RefreshCw, Mail } from "lucide-react";
import {
  Alert, AuthPage, Body, Button, Form, Input, Label, Stack} from '@ghxstship/ui';

// =============================================================================
// MAGIC LINK PAGE - ATLVS Passwordless Authentication
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export default function MagicLinkPage() {
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
      <AuthPage title="Check Your Email" subtitle="We've sent a magic link to your inbox">
        <Stack gap={6} className="text-center">
          <div className="p-4 bg-success/20 rounded-avatar w-fit mx-auto">
            <Sparkles className="size-8 text-success" />
          </div>
          <Body className="text-on-dark-muted">
            We&apos;ve sent a magic link to <strong className="text-white">{email}</strong>. Click the link in the email to sign in.
          </Body>
          <Label size="xs" className="text-on-dark-disabled">Link expires in 1 hour</Label>
          <Button variant="ghost" size="sm" onClick={() => setSubmitted(false)} icon={<RefreshCw className="size-4" />} iconPosition="left">
            Use a different email
          </Button>
        </Stack>
      </AuthPage>
    );
  }

  return (
    <AuthPage
      title="Magic Link"
      subtitle="Sign in without a password. We'll email you a magic link."
      footer={{ text: "Don't have an account?", linkText: "Sign up", linkHref: "/auth/signup" }}
    >
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      
      <Form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Body size="sm" className="text-on-dark-muted mb-1">Email Address</Body>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="pl-10"
            />
          </div>
        </div>

        <Button type="submit" variant="solid" size="lg" fullWidth disabled={loading} icon={<ArrowRight className="size-4" />} iconPosition="right">
          {loading ? "Sending..." : "Send Magic Link"}
        </Button>
      </Form>

      <div className="text-center mt-6 pt-6 border-t border-grey-700">
        <Button variant="ghost" size="sm" onClick={() => window.location.href = "/auth/signin"}>
          Sign in with password instead
        </Button>
      </div>
    </AuthPage>
  );
}
