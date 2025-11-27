"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Checkbox,
  SectionLayout,
  Alert,
  Stack,
  Field,
  Grid,
} from "@ghxstship/ui";

export default function SignUpPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/auth/verify-email?email=' + encodeURIComponent(formData.email));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/oauth/${provider}`, { method: 'POST' });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        addNotification({ type: 'info', title: 'Coming Soon', message: `${provider} sign-up will be available once OAuth is configured` });
        setLoading(false);
      }
    } catch (err) {
      setError('OAuth sign-up failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <PageLayout
      background="black"
      header={
        <Navigation
          logo={
            <Display size="md" className="text-display-md">
              GVTEWAY
            </Display>
          }
          cta={<></>}
        />
      }
      footer={
        <Footer
          logo={
            <Display size="md" className="text-white text-display-md">
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
            <H2 className="text-white">Create Account</H2>
            <Body className="text-grey-400">
              Join GVTEWAY to discover and experience unforgettable live events.
            </Body>
          </Stack>

          {error && <Alert variant="error">{error}</Alert>}

          <Stack gap={6}>
              <Grid cols={2} gap={4}>
                <Field label="First Name" className="text-white">
                  <Input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="John"
                    required
                    className="border-grey-700 bg-black text-white"
                  />
                </Field>
                <Field label="Last Name" className="text-white">
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Doe"
                    required
                    className="border-grey-700 bg-black text-white"
                  />
                </Field>
              </Grid>

              <Field label="Email Address" className="text-white">
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  className="border-grey-700 bg-black text-white"
                />
              </Field>

              <Field label="Password" className="text-white">
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a strong password"
                  required
                  className="border-grey-700 bg-black text-white"
                />
              </Field>

              <Field label="Confirm Password" className="text-white">
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter your password"
                  required
                  className="border-grey-700 bg-black text-white"
                />
              </Field>

              <Stack direction="horizontal" gap={3} className="items-start">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                />
                <Body size="sm" className="cursor-pointer text-grey-400">
                  I agree to the{" "}
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/legal/terms'} className="text-white hover:text-grey-400 inline p-0">
                    Terms of Service
                  </Button>{" "}
                  and{" "}
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/legal/privacy'} className="text-white hover:text-grey-400 inline p-0">
                    Privacy Policy
                  </Button>
                </Body>
              </Stack>

              <Button variant="solid" className="w-full" disabled={loading} onClick={handleSignUp}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <Stack className="text-center">
                <Body size="sm" className="text-grey-400">
                  Already have an account?{" "}
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/auth/signin'} className="text-white hover:text-grey-400 inline">
                    Sign in
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
            <Button variant="outline" className="w-full border-grey-700 text-grey-400 hover:border-white hover:text-white" onClick={() => handleOAuthSignUp('google')} disabled={loading}>
              Sign up with Google
            </Button>
            <Button variant="outline" className="w-full border-grey-700 text-grey-400 hover:border-white hover:text-white" onClick={() => handleOAuthSignUp('apple')} disabled={loading}>
              Sign up with Apple
            </Button>
          </Stack>
        </Stack>
      </SectionLayout>
    </PageLayout>
  );
}
