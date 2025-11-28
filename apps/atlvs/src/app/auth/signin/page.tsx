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
  SectionLayout,
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
      background="white"
      header={
        <Navigation
          logo={<Display size="md" className="text-black">ATLVS</Display>}
          cta={<></>}
        />
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-black">ATLVS</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <SectionLayout background="grey">
        <Stack gap={8} className="mx-auto max-w-md">
          {/* Auth Card - Pop Art Style */}
          <Card variant="elevated" className="p-8">
            <Stack gap={8}>
              {/* Header */}
              <Stack gap={4} className="text-center">
                <H2 className="text-black">Sign In</H2>
                <Body className="text-muted">
                  Access your ATLVS account to manage projects and resources.
                </Body>
              </Stack>

              {/* Error Alert */}
              {error && <Alert variant="error">{error}</Alert>}

              {/* Form */}
              <form onSubmit={handleSignIn}>
                <Stack gap={6}>
                  {/* Email Field */}
                  <Field label="Email Address">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </Field>

                  {/* Password Field */}
                  <Field label="Password">
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </Field>

                  {/* Remember Me & Forgot Password */}
                  <Stack direction="horizontal" className="items-center justify-between">
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <Label size="xs" className="text-muted">Remember me</Label>
                    </Stack>
                    <NextLink href="/auth/forgot-password">
                      <Button variant="ghost" size="sm">
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
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </Stack>
              </form>

              {/* Sign Up Link */}
              <Stack className="text-center">
                <Body size="sm" className="text-muted">
                  Don&apos;t have an account?{" "}
                  <NextLink href="/auth/signup">
                    <Button variant="ghost" size="sm" className="inline">
                      Sign up
                    </Button>
                  </NextLink>
                </Body>
              </Stack>

              {/* Divider with text */}
              <Stack direction="horizontal" className="items-center gap-4">
                <Divider className="flex-1" />
                <Label size="xs" className="text-muted">Or</Label>
                <Divider className="flex-1" />
              </Stack>

              {/* OAuth Buttons */}
              <Stack gap={3}>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={loading}
                >
                  Continue with Google
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => handleOAuthSignIn('apple')}
                  disabled={loading}
                >
                  Continue with Apple
                </Button>
              </Stack>

              {/* Magic Link Option */}
              <Stack className="border-t-2 border-muted pt-6 text-center">
                <NextLink href="/auth/magic-link">
                  <Button variant="ghost" size="sm" className="text-muted hover:text-black">
                    Sign in with Magic Link
                  </Button>
                </NextLink>
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </SectionLayout>
    </PageLayout>
  );
}
