"use client";

import { useState } from "react";
import {
  PageLayout,
  Navigation,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  H2,
  Body,
  Button,
  Input,
  Alert,
  Stack,
  Card,
  Field,
  Section,
  Container,
} from "@ghxstship/ui";
import { Mail } from "lucide-react";
import NextLink from "next/link";

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
    <PageLayout
      background="black"
      header={
        <Navigation
          logo={<Display size="md" className="text-white">GVTEWAY</Display>}
          cta={<></>}
        />
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-white">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="flex min-h-[80vh] items-center justify-center py-12">
        <Container className="w-full max-w-md">
          {/* Auth Card - Pop Art Style */}
          <Card inverted variant="elevated" className="p-8">
            {submitted ? (
              /* Success State */
              <Stack gap={8} className="text-center">
                {/* Icon */}
                <Card inverted className="mx-auto flex size-16 items-center justify-center">
                  <Mail className="size-8 text-white" />
                </Card>
                
                <Stack gap={4}>
                  <H2 className="text-white">Check Your Email</H2>
                  <Body className="text-on-dark-muted">
                    If an account exists with <strong className="text-white">{email}</strong>, you will receive a password reset link shortly.
                  </Body>
                </Stack>
                
                <NextLink href="/auth/signin">
                  <Button variant="solid" size="lg" fullWidth inverted>
                    Back to Sign In
                  </Button>
                </NextLink>
              </Stack>
            ) : (
              /* Form State */
              <Stack gap={8}>
                {/* Header */}
                <Stack gap={4} className="text-center">
                  <H2 className="text-white">Reset Password</H2>
                  <Body className="text-on-dark-muted">
                    Enter your email address and we&apos;ll send you a link to reset your password.
                  </Body>
                </Stack>

                {/* Error Alert */}
                {error && <Alert variant="error">{error}</Alert>}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <Stack gap={6}>
                    {/* Email Field */}
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

                    {/* Primary CTA */}
                    <Button
                      type="submit"
                      variant="solid"
                      size="lg"
                      fullWidth
                      inverted
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </Stack>
                </form>

                {/* Back Link */}
                <Stack className="text-center">
                  <NextLink href="/auth/signin">
                    <Button variant="ghost" size="sm" inverted className="text-on-dark-muted hover:text-white">
                      Back to Sign In
                    </Button>
                  </NextLink>
                </Stack>
              </Stack>
            )}
          </Card>
        </Container>
      </Section>
    </PageLayout>
  );
}
