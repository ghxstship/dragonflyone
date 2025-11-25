"use client";

import { useState } from "react";
import { useNotifications } from "@ghxstship/ui";
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
  Card,
  Field,
  Checkbox,
} from "@ghxstship/ui";

export default function SignInPage() {
  const { addNotification } = useNotifications();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulated authentication - replace with actual Supabase auth
    setTimeout(() => {
      if (email && password) {
        // Redirect to dashboard or home
        window.location.href = "/";
      } else {
        setError("Please enter both email and password");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <PageLayout
      background="black"
      header={
        <Navigation
          logo={
            <Display size="md" className="text-[3rem]">
              GVTEWAY
            </Display>
          }
          cta={<></>}
        />
      }
      footer={
        <Footer
          logo={
            <Display size="md" className="text-white text-[3rem]">
              GVTEWAY
            </Display>
          }
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Legal">
            <FooterLink href="#">Privacy</FooterLink>
            <FooterLink href="#">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <SectionLayout background="black">
        <Stack gap={8} className="mx-auto max-w-md">
          <Stack gap={4} className="text-center">
            <H2 className="text-white">Sign In</H2>
            <Body className="text-grey-400">
              Access your GVTEWAY account to manage events, tickets, and experiences.
            </Body>
          </Stack>

          {error && (
            <Alert variant="error">{error}</Alert>
          )}

          <Stack gap={6}>
              <Field label="Email Address" className="text-white">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="border-grey-700 bg-black text-white"
                />
              </Field>

              <Field label="Password" className="text-white">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="border-grey-700 bg-black text-white"
                />
              </Field>

              <Stack direction="horizontal" className="justify-between items-center text-sm">
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Checkbox id="remember" />
                  <Body size="sm" className="text-grey-400">Remember me</Body>
                </Stack>
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/auth/reset-password'} className="text-white hover:text-grey-400">
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

              <Stack className="text-center text-sm text-grey-400">
                <Body size="sm" className="text-grey-400">
                  Don&apos;t have an account?{" "}
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/auth/signup'} className="text-white hover:text-grey-400 inline">
                    Sign up
                  </Button>
                </Body>
              </Stack>
            </Stack>

          <Stack className="relative">
            <Stack className="absolute inset-0 items-center justify-center">
              <Stack className="w-full border-t-2 border-grey-800" />
            </Stack>
            <Stack className="relative justify-center">
              <Body size="sm" className="bg-black px-4 text-grey-500 text-center">OR</Body>
            </Stack>
          </Stack>

          <Stack gap={3}>
            <Button variant="outline" className="w-full border-grey-700 text-grey-400 hover:border-white hover:text-white" onClick={() => addNotification({ type: 'info', title: 'Coming Soon', message: 'Google sign-in will be available soon' })}>
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full border-grey-700 text-grey-400 hover:border-white hover:text-white" onClick={() => addNotification({ type: 'info', title: 'Coming Soon', message: 'Apple sign-in will be available soon' })}>
              Continue with Apple
            </Button>
          </Stack>
        </Stack>
      </SectionLayout>
    </PageLayout>
  );
}
