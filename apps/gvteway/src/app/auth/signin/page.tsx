"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@ghxstship/ui";
import { useAuthContext } from "@ghxstship/config";
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
  Checkbox,
  Section,
  Container,
  Divider,
  Label,
} from "@ghxstship/ui";
import NextLink from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuthContext();
  const { addNotification } = useNotifications();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/oauth/${provider}`, { method: 'POST' });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        addNotification({ type: 'info', title: 'Coming Soon', message: `${provider} sign-in will be available once OAuth is configured` });
        setLoading(false);
      }
    } catch (err) {
      setError('OAuth sign-in failed. Please try again.');
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
            <Stack gap={8}>
              {/* Header */}
              <Stack gap={4} className="text-center">
                <H2 className="text-white">Sign In</H2>
                <Body className="text-on-dark-muted">
                  Access your GVTEWAY account to manage events, tickets, and experiences.
                </Body>
              </Stack>

              {/* Error Alert */}
              {error && <Alert variant="error">{error}</Alert>}

              {/* Form */}
              <form onSubmit={handleSignIn}>
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

                  {/* Password Field */}
                  <Field label="Password" inverted>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      inverted
                    />
                  </Field>

                  {/* Remember Me & Forgot Password */}
                  <Stack direction="horizontal" className="items-center justify-between">
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        inverted
                      />
                      <Label size="xs" className="text-on-dark-muted">Remember me</Label>
                    </Stack>
                    <NextLink href="/auth/forgot-password">
                      <Button variant="ghost" size="sm" inverted>
                        Forgot password?
                      </Button>
                    </NextLink>
                  </Stack>

                  {/* Primary CTA */}
                  <Button
                    type="submit"
                    variant="solid"
                    size="lg"
                    fullWidth
                    inverted
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </Stack>
              </form>

              {/* Sign Up Link */}
              <Stack className="text-center">
                <Body size="sm" className="text-on-dark-muted">
                  Don&apos;t have an account?{" "}
                  <NextLink href="/auth/signup">
                    <Button variant="ghost" size="sm" inverted className="inline">
                      Sign up
                    </Button>
                  </NextLink>
                </Body>
              </Stack>

              {/* Divider with text */}
              <Stack direction="horizontal" className="items-center gap-4">
                <Divider inverted className="flex-1" />
                <Label size="xs" className="text-on-dark-muted">Or</Label>
                <Divider inverted className="flex-1" />
              </Stack>

              {/* OAuth Buttons */}
              <Stack gap={3}>
                <Button
                  variant="outlineInk"
                  size="lg"
                  fullWidth
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={loading}
                >
                  Continue with Google
                </Button>
                <Button
                  variant="outlineInk"
                  size="lg"
                  fullWidth
                  onClick={() => handleOAuthSignIn('apple')}
                  disabled={loading}
                >
                  Continue with Apple
                </Button>
              </Stack>

              {/* Magic Link Option */}
              <Stack className="pt-6 text-center" style={{ borderTop: '2px solid var(--ink-700)' }}>
                <NextLink href="/auth/magic-link">
                  <Button variant="ghost" size="sm" inverted className="text-on-dark-muted hover:text-white">
                    Sign in with Magic Link
                  </Button>
                </NextLink>
              </Stack>
            </Stack>
          </Card>
        </Container>
      </Section>
    </PageLayout>
  );
}
