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
  SectionLayout,
  Alert,
  Stack,
  Field,
} from "@ghxstship/ui";

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
      background="white"
      header={
        <Navigation
          logo={
            <Display size="md" className="text-display-md text-black">
              COMPVSS
            </Display>
          }
          cta={<></>}
        />
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-black text-display-md">COMPVSS</Display>}
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
        <Stack gap={8} className="mx-auto max-w-md bg-white p-8 border border-grey-200">
          {submitted ? (
            <Stack gap={6} className="text-center">
              <Stack className="w-16 h-16 mx-auto bg-grey-200 rounded-full items-center justify-center">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </Stack>
              <H2>Check Your Email</H2>
              <Body className="text-grey-600">
                If an account exists with <strong className="text-black">{email}</strong>, you will receive a password reset link shortly.
              </Body>
              <Button variant="solid" onClick={() => window.location.href = '/auth/signin'}>
                Back to Sign In
              </Button>
            </Stack>
          ) : (
            <>
              <Stack gap={4} className="text-center">
                <H2>Reset Password</H2>
                <Body className="text-grey-600">
                  Enter your email address and we&apos;ll send you a link to reset your password.
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
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <Stack className="text-center">
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/auth/signin'} className="text-grey-600 hover:text-black">
                    Back to Sign In
                  </Button>
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </SectionLayout>
    </PageLayout>
  );
}
