"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import {
  Alert,
  AuthPage,
  Body,
  Button,
  Card,
  Field,
  Form,
  H2,
  IconBox,
  Input,
  Label,
  ScrollReveal,
  Stack,
} from '@ghxstship/ui';
import NextLink from "next/link";
import { CreatorNavigationPublic } from "@/components/navigation";

// =============================================================================
// MAGIC LINK PAGE - ATLVS Passwordless Authentication
// Bold Contemporary Pop Art Adventure Design System - Light Theme
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
    } catch (err) {
      setError("Failed to send magic link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPage header={<CreatorNavigationPublic />}>
          <ScrollReveal animation="slide-up" duration={600}>
            {/* Auth Card - Pop Art Style */}
            <Card className="border-2 border-black/10 bg-white p-6 shadow-md sm:p-8">
              {submitted ? (
                /* Success State */
                <Stack gap={6} className="text-center sm:gap-8">
                  <IconBox size="lg" variant="success" className="mx-auto">
                    <Sparkles className="size-6 text-success sm:size-8" />
                  </IconBox>

                  <Stack gap={3} className="sm:gap-4">
                    <H2 className="text-black">CHECK YOUR EMAIL</H2>
                    <Body size="sm" className="text-muted">
                      We&apos;ve sent a magic link to{" "}
                      <strong className="text-black">{email}</strong>. Click the link in the
                      email to sign in.
                    </Body>
                    <Label size="xs" className="text-muted">
                      Link expires in 1 hour
                    </Label>
                  </Stack>

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
              ) : (
                /* Form State */
                <Stack gap={6} className="sm:gap-8">
                  {/* Header */}
                  <Stack gap={3} className="text-center sm:gap-4">
                    <IconBox size="lg" className="mx-auto">
                      <Sparkles className="size-6 text-black sm:size-8" />
                    </IconBox>
                    <H2 className="text-black">MAGIC LINK</H2>
                    <Body size="sm" className="text-muted">
                      Sign in without a password. We&apos;ll email you a magic link.
                    </Body>
                  </Stack>

                  {/* Error Alert */}
                  {error && <Alert variant="error">{error}</Alert>}

                  {/* Form */}
                  <Form onSubmit={handleSubmit}>
                    <Stack gap={4} className="sm:gap-6">
                      <Field label="Email Address">
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                        />
                      </Field>

                      <Button
                        type="submit"
                        variant="solid"
                        size="lg"
                        fullWidth
                        disabled={loading}
                        icon={<ArrowRight className="size-4" />}
                        iconPosition="right"
                      >
                        {loading ? "Sending..." : "Send Magic Link"}
                      </Button>
                    </Stack>
                  </Form>

                  {/* Links */}
                  <Stack gap={3} className="border-t border-black/10 pt-6 text-center">
                    <NextLink href="/auth/signin">
                      <Button variant="ghost" size="sm">
                        Sign in with password instead
                      </Button>
                    </NextLink>

                    <Body size="sm" className="text-muted">
                      Don&apos;t have an account?{" "}
                      <NextLink href="/auth/signup">
                        <Button variant="ghost" size="sm" className="inline">
                          Sign up
                        </Button>
                      </NextLink>
                    </Body>
                  </Stack>
                </Stack>
              )}
            </Card>
          </ScrollReveal>
    </AuthPage>
  );
}
