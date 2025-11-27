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
  SectionLayout,
  Alert,
  Stack,
  Field,
  Checkbox,
} from "@ghxstship/ui";

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuthContext();
  const { addNotification } = useNotifications();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          logo={
            <Display size="md" className="text-display-md text-black">
              ATLVS
            </Display>
          }
          cta={<></>}
        />
      }
      footer={
        <Footer
          logo={
            <Display size="md" className="text-black text-display-md">
              ATLVS
            </Display>
          }
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
          <Stack gap={4} className="text-center">
            <H2>Sign In</H2>
            <Body className="text-grey-600">
              Access your ATLVS account to manage projects and resources.
            </Body>
          </Stack>

          {error && (
            <Alert variant="error">{error}</Alert>
          )}

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

            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </Field>

            <Stack direction="horizontal" className="justify-between items-center text-sm">
              <Stack direction="horizontal" gap={2} className="items-center">
                <Checkbox id="remember" />
                <Body size="sm" className="text-grey-600">Remember me</Body>
              </Stack>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/auth/forgot-password'} className="text-grey-600 hover:text-black">
                Forgot password?
              </Button>
            </Stack>

            <Button
              variant="solid"
              className="w-full"
              disabled={loading}
              onClick={handleSignIn}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>

            <Stack className="text-center text-sm">
              <Body size="sm" className="text-grey-600">
                Don&apos;t have an account?{" "}
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/auth/signup'} className="text-black hover:text-grey-600 inline">
                  Sign up
                </Button>
              </Body>
            </Stack>
          </Stack>

          <Stack className="relative">
            <Stack className="absolute inset-0 items-center justify-center">
              <Stack className="w-full border-t border-grey-300" />
            </Stack>
            <Stack className="relative justify-center">
              <Body size="sm" className="bg-white px-4 text-grey-500 text-center">OR</Body>
            </Stack>
          </Stack>

          <Stack gap={3}>
            <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn('google')} disabled={loading}>
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn('apple')} disabled={loading}>
              Continue with Apple
            </Button>
          </Stack>

          <Stack className="text-center">
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/auth/magic-link'} className="text-grey-600 hover:text-black">
              Sign in with Magic Link
            </Button>
          </Stack>
        </Stack>
      </SectionLayout>
    </PageLayout>
  );
}
