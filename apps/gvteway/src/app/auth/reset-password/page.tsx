"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Check } from "lucide-react";
import NextLink from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/password/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => router.push('/auth/signin'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
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
            {success ? (
              /* Success State */
              <Stack gap={8} className="text-center">
                {/* Icon */}
                <Card inverted className="mx-auto flex size-16 items-center justify-center">
                  <Check className="size-8 text-white" />
                </Card>
                
                <Stack gap={4}>
                  <H2 className="text-white">Password Reset</H2>
                  <Body className="text-on-dark-muted">
                    Your password has been successfully reset. Redirecting to sign in...
                  </Body>
                </Stack>
              </Stack>
            ) : (
              /* Form State */
              <Stack gap={8}>
                {/* Header */}
                <Stack gap={4} className="text-center">
                  <H2 className="text-white">New Password</H2>
                  <Body className="text-on-dark-muted">
                    Enter your new password below.
                  </Body>
                </Stack>

                {/* Error Alert */}
                {error && <Alert variant="error">{error}</Alert>}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <Stack gap={6}>
                    {/* New Password Field */}
                    <Field label="New Password" inverted>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        inverted
                      />
                      <Label size="xs" className="text-on-dark-disabled mt-2">
                        Minimum 8 characters
                      </Label>
                    </Field>

                    {/* Confirm Password Field */}
                    <Field label="Confirm Password" inverted>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
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
                      {loading ? "Resetting..." : "Reset Password"}
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
