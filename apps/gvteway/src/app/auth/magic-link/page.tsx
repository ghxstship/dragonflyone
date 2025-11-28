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
  Label,
} from "@ghxstship/ui";
import { Mail } from "lucide-react";
import NextLink from "next/link";

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
                    We&apos;ve sent a magic link to <strong className="text-white">{email}</strong>. Click the link in the email to sign in.
                  </Body>
                  <Label size="xs" className="text-on-dark-disabled">
                    Link expires in 1 hour
                  </Label>
                </Stack>
                
                <Button variant="ghost" size="sm" inverted onClick={() => setSubmitted(false)}>
                  Use a different email
                </Button>
              </Stack>
            ) : (
              /* Form State */
              <Stack gap={8}>
                {/* Header */}
                <Stack gap={4} className="text-center">
                  <H2 className="text-white">Magic Link</H2>
                  <Body className="text-on-dark-muted">
                    Sign in without a password. We&apos;ll email you a magic link.
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
                      {loading ? "Sending..." : "Send Magic Link"}
                    </Button>
                  </Stack>
                </form>

                {/* Links */}
                <Stack gap={4} className="text-center">
                  <NextLink href="/auth/signin">
                    <Button variant="ghost" size="sm" inverted className="text-on-dark-muted hover:text-white">
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
        </Container>
      </Section>
    </PageLayout>
  );
}
