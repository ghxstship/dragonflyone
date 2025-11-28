"use client";

import { useState } from "react";
import {
  H2,
  Body,
  Button,
  Input,
  Alert,
  Stack,
  Card,
  Field,
  Label,
  ScrollReveal,
  AuthPage,
} from "@ghxstship/ui";
import { Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import NextLink from "next/link";

// =============================================================================
// MAGIC LINK PAGE - Passwordless Authentication
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
    } catch (err) {
      setError("Failed to send magic link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPage
      appName="GVTEWAY"
      background="black"
      headerAction={
        <NextLink href="/auth/signin" className="hidden sm:block">
          <Button variant="outlineInk" size="sm">
            Sign In
          </Button>
        </NextLink>
      }
    >
          <ScrollReveal animation="slide-up" duration={600}>
            {/* Auth Card - Pop Art Style */}
            <Card inverted className="border-2 border-white/20 bg-black p-6 shadow-md sm:p-8">
              {submitted ? (
                /* Success State */
                <Stack gap={6} className="text-center sm:gap-8">
                  <div className="mx-auto flex size-12 items-center justify-center border-2 border-white/20 bg-white/5 sm:size-16">
                    <Sparkles className="size-6 text-success sm:size-8" />
                  </div>

                  <Stack gap={3} className="sm:gap-4">
                    <H2 className="text-white">CHECK YOUR EMAIL</H2>
                    <Body size="sm" className="text-on-dark-muted">
                      We&apos;ve sent a magic link to{" "}
                      <strong className="text-white">{email}</strong>. Click the link in the
                      email to sign in.
                    </Body>
                    <Label size="xs" className="text-on-dark-disabled">
                      Link expires in 1 hour
                    </Label>
                  </Stack>

                  <Button
                    variant="ghost"
                    size="sm"
                    inverted
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
                    <div className="mx-auto flex size-12 items-center justify-center border-2 border-white/20 bg-white/5 sm:size-16">
                      <Sparkles className="size-6 text-warning sm:size-8" />
                    </div>
                    <H2 className="text-white">MAGIC LINK</H2>
                    <Body size="sm" className="text-on-dark-muted">
                      Sign in without a password. We&apos;ll email you a magic link.
                    </Body>
                  </Stack>

                  {/* Error Alert */}
                  {error && <Alert variant="error">{error}</Alert>}

                  {/* Form */}
                  <form onSubmit={handleSubmit}>
                    <Stack gap={4} className="sm:gap-6">
                      <Field label="Email Address" inverted>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          inverted
                        />
                      </Field>

                      <Button
                        type="submit"
                        variant="pop"
                        size="lg"
                        fullWidth
                        disabled={loading}
                        icon={<ArrowRight className="size-4" />}
                        iconPosition="right"
                      >
                        {loading ? "Sending..." : "Send Magic Link"}
                      </Button>
                    </Stack>
                  </form>

                  {/* Links */}
                  <Stack gap={3} className="border-t border-white/10 pt-6 text-center">
                    <NextLink href="/auth/signin">
                      <Button variant="ghost" size="sm" inverted>
                        Sign in with password instead
                      </Button>
                    </NextLink>

                    <Body size="sm" className="text-on-dark-muted">
                      Don&apos;t have an account?{" "}
                      <NextLink href="/auth/signup">
                        <Button variant="ghost" size="sm" inverted className="inline">
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
