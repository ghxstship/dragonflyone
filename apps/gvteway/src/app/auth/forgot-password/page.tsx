"use client";

import { useState } from "react";
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
  ScrollReveal,
  Stack,
} from '@ghxstship/ui';
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import NextLink from "next/link";
import { useAuthData } from "@/hooks/useAuth";

// =============================================================================
// FORGOT PASSWORD PAGE - Password Reset Request
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const { forgotPassword, isSendingReset: loading } = useAuthData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email. Please try again.");
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
                  <IconBox size="lg" variant="success" inverted className="mx-auto">
                    <Mail className="size-6 text-success sm:size-8" />
                  </IconBox>

                  <Stack gap={3} className="sm:gap-4">
                    <H2 className="text-white">CHECK YOUR EMAIL</H2>
                    <Body size="sm" className="text-on-dark-muted">
                      If an account exists with{" "}
                      <strong className="text-white">{email}</strong>, you will receive a
                      password reset link shortly.
                    </Body>
                  </Stack>

                  <NextLink href="/auth/signin" className="w-full">
                    <Button variant="pop" size="lg" fullWidth>
                      Back to Sign In
                    </Button>
                  </NextLink>
                </Stack>
              ) : (
                /* Form State */
                <Stack gap={6} className="sm:gap-8">
                  {/* Header */}
                  <Stack gap={3} className="text-center sm:gap-4">
                    <IconBox size="lg" variant="warning" inverted className="mx-auto">
                      <Mail className="size-6 text-warning sm:size-8" />
                    </IconBox>
                    <H2 className="text-white">RESET PASSWORD</H2>
                    <Body size="sm" className="text-on-dark-muted">
                      Enter your email address and we&apos;ll send you a link to reset your
                      password.
                    </Body>
                  </Stack>

                  {/* Error Alert */}
                  {error && <Alert variant="error">{error}</Alert>}

                  {/* Form */}
                  <Form onSubmit={handleSubmit}>
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
                        {loading ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </Stack>
                  </Form>

                  {/* Back Link */}
                  <Stack className="border-t border-white/10 pt-6 text-center">
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
              )}
            </Card>
          </ScrollReveal>
    </AuthPage>
  );
}
