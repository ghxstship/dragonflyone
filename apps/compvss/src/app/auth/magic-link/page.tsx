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
  Field,
  Card,
  AuthPage,
} from "@ghxstship/ui";
import NextLink from "next/link";
import { CreatorNavigationPublic } from "@/components/navigation";

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
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Failed to send magic link');
      setSubmitted(true);
    } catch (err) {
      setError('Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPage header={<CreatorNavigationPublic />}>
          <Card variant="elevated" className="p-8">
            {submitted ? (
              <Stack gap={6} className="text-center">
                <Card className="mx-auto flex size-16 items-center justify-center">
                  <Mail className="size-8" />
                </Card>
                <H2 className="text-black">Check Your Email</H2>
                <Body className="text-muted">
                  We&apos;ve sent a magic link to <strong className="text-black">{email}</strong>. Click the link in the email to sign in.
                </Body>
                <Body size="sm" className="text-muted">Link expires in 1 hour</Body>
                <Button variant="ghost" onClick={() => setSubmitted(false)}>
                  Use a different email
                </Button>
              </Stack>
            ) : (
              <Stack gap={8}>
                <Stack gap={4} className="text-center">
                  <H2 className="text-black">Magic Link</H2>
                  <Body className="text-muted">
                    Sign in without a password. We&apos;ll email you a magic link.
                  </Body>
                </Stack>

                {error && <Alert variant="error">{error}</Alert>}

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

                    <Button type="submit" variant="solid" size="lg" fullWidth disabled={loading}>
                      {loading ? "Sending..." : "Send Magic Link"}
                    </Button>

                    <Stack gap={3} className="text-center">
                      <NextLink href="/auth/signin">
                        <Button variant="ghost" size="sm">
                          Sign in with password instead
                        </Button>
                      </NextLink>
                      <Body size="sm" className="text-muted">
                        Don&apos;t have an account?{" "}
                        <NextLink href="/auth/signup">
                          <Button variant="ghost" size="sm" className="inline">Sign up</Button>
                        </NextLink>
                      </Body>
                    </Stack>
                  </Stack>
                </form>
              </Stack>
            )}
          </Card>
    </AuthPage>
  );
}
