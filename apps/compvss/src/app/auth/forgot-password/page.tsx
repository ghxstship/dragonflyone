"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import {
  H2,
  Body,
  Button,
  Input,
  Alert,
  Stack,
  Card,
  Field,
  AuthPage,
} from "@ghxstship/ui";
import NextLink from "next/link";
import { CreatorNavigationPublic } from "@/components/navigation";

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
      const response = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Failed to send reset email');
      setSubmitted(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPage header={<CreatorNavigationPublic />}>
          <Card variant="elevated" className="p-8">
            {submitted ? (
              /* Success State */
              <Stack gap={6} className="text-center">
                <Card className="mx-auto flex size-16 items-center justify-center">
                  <Mail className="size-8" />
                </Card>
                
                <Stack gap={4}>
                  <H2 className="text-black">Check Your Email</H2>
                  <Body className="text-muted">
                    If an account exists with <strong className="text-black">{email}</strong>, you will receive a password reset link shortly.
                  </Body>
                </Stack>
                
                <NextLink href="/auth/signin">
                  <Button variant="solid" size="lg" fullWidth>
                    Back to Sign In
                  </Button>
                </NextLink>
              </Stack>
            ) : (
              /* Form State */
              <Stack gap={8}>
                {/* Header */}
                <Stack gap={4} className="text-center">
                  <H2 className="text-black">Reset Password</H2>
                  <Body className="text-muted">
                    Enter your email address and we&apos;ll send you a link to reset your password.
                  </Body>
                </Stack>

                {/* Error Alert */}
                {error && <Alert variant="error">{error}</Alert>}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <Stack gap={6}>
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
                    >
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </Stack>
                </form>

                {/* Back Link */}
                <Stack className="text-center">
                  <NextLink href="/auth/signin">
                    <Button variant="ghost" size="sm" className="text-muted hover:text-black">
                      Back to Sign In
                    </Button>
                  </NextLink>
                </Stack>
              </Stack>
            )}
          </Card>
    </AuthPage>
  );
}
