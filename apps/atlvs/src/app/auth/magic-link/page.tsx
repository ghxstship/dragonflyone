"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
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
  SectionLayout,
  Alert,
  Stack,
  Field,
} from "@ghxstship/ui";

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
      background="white"
      header={
        <Navigation
          logo={<Display size="md" className="text-display-md text-black">ATLVS</Display>}
          cta={<></>}
        />
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-black text-display-md">ATLVS</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Legal">
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <SectionLayout background="grey">
        <Stack gap={8} className="mx-auto max-w-md bg-white p-8 border border-ink-200">
          {submitted ? (
            <Stack gap={6} className="text-center">
              <Stack className="w-16 h-16 mx-auto bg-ink-200 rounded-full items-center justify-center">
                <Mail className="w-8 h-8" />
              </Stack>
              <H2>Check Your Email</H2>
              <Body className="text-ink-600">
                We&apos;ve sent a magic link to <strong className="text-black">{email}</strong>. Click the link in the email to sign in.
              </Body>
              <Body size="sm" className="text-ink-500">Link expires in 1 hour</Body>
              <Button variant="ghost" onClick={() => setSubmitted(false)} className="text-ink-600 hover:text-black">
                Use a different email
              </Button>
            </Stack>
          ) : (
            <>
              <Stack gap={4} className="text-center">
                <H2>Magic Link</H2>
                <Body className="text-ink-600">
                  Sign in without a password. We&apos;ll email you a magic link.
                </Body>
              </Stack>

              {error && <Alert variant="error">{error}</Alert>}

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

                <Button variant="solid" className="w-full" disabled={loading} onClick={handleSubmit}>
                  {loading ? "Sending..." : "Send Magic Link"}
                </Button>

                <Stack gap={3} className="text-center">
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/auth/signin'} className="text-ink-600 hover:text-black">
                    Sign in with password instead
                  </Button>
                  <Body size="sm" className="text-ink-600">
                    Don&apos;t have an account?{" "}
                    <Button variant="ghost" size="sm" onClick={() => window.location.href = '/auth/signup'} className="text-black hover:text-ink-600 inline">
                      Sign up
                    </Button>
                  </Body>
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </SectionLayout>
    </PageLayout>
  );
}
