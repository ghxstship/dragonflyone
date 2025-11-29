"use client";

import { useState } from "react";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import {
  H2,
  Body,
  Button,
  Input,
  Alert,
  Stack,
  Card,
  Field,
  ScrollReveal,
  AuthPage,
} from "@ghxstship/ui";
import NextLink from "next/link";
import { CreatorNavigationPublic } from "@/components/navigation";

// =============================================================================
// FORGOT PASSWORD PAGE - ATLVS Password Reset Request
// Bold Contemporary Pop Art Adventure Design System - Light Theme
// =============================================================================

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Failed to send reset email");
      setSubmitted(true);
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
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
                  <div className="mx-auto flex size-12 items-center justify-center border-2 border-black/10 bg-grey-100 sm:size-16">
                    <Mail className="size-6 text-success sm:size-8" />
                  </div>

                  <Stack gap={3} className="sm:gap-4">
                    <H2 className="text-black">CHECK YOUR EMAIL</H2>
                    <Body size="sm" className="text-muted">
                      If an account exists with{" "}
                      <strong className="text-black">{email}</strong>, you will receive a
                      password reset link shortly.
                    </Body>
                  </Stack>

                  <NextLink href="/auth/signin" className="w-full">
                    <Button variant="solid" size="lg" fullWidth>
                      Back to Sign In
                    </Button>
                  </NextLink>
                </Stack>
              ) : (
                /* Form State */
                <Stack gap={6} className="sm:gap-8">
                  {/* Header */}
                  <Stack gap={3} className="text-center sm:gap-4">
                    <div className="mx-auto flex size-12 items-center justify-center border-2 border-black/10 bg-grey-100 sm:size-16">
                      <Mail className="size-6 text-black sm:size-8" />
                    </div>
                    <H2 className="text-black">RESET PASSWORD</H2>
                    <Body size="sm" className="text-muted">
                      Enter your email address and we&apos;ll send you a link to reset your
                      password.
                    </Body>
                  </Stack>

                  {/* Error Alert */}
                  {error && <Alert variant="error">{error}</Alert>}

                  {/* Form */}
                  <form onSubmit={handleSubmit}>
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
                        {loading ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </Stack>
                  </form>

                  {/* Back Link */}
                  <Stack className="border-t border-black/10 pt-6 text-center">
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
              )}
            </Card>
          </ScrollReveal>
    </AuthPage>
  );
}
