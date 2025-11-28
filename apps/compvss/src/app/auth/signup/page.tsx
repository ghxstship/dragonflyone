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
  Grid,
  Divider,
} from "@ghxstship/ui";
import NextLink from "next/link";

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
      background="white"
      header={
        <Navigation
          logo={<Body className="font-display">COMPVSS</Body>}
          cta={<></>}
        />
      }
      footer={
        <Footer
          logo={<Body className="font-display">COMPVSS</Body>}
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
        <Stack gap={8} className="mx-auto max-w-lg">
          <Card variant="elevated" className="p-8">
            <Stack gap={8}>
              {/* Header */}
              <Stack gap={4} className="text-center">
                <H2 className="text-black">Create Account</H2>
                <Body className="text-muted">
                  Join COMPVSS to manage your crew and resources.
                </Body>
              </Stack>

              {/* Error Alert */}
              {error && <Alert variant="error">{error}</Alert>}

              {/* Form */}
              <form onSubmit={handleSignUp}>
                <Stack gap={6}>
                  {/* Name Fields - Grid */}
                  <Grid cols={2} gap={4}>
                    <Field label="First Name">
                      <Input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="John"
                        required
                      />
                    </Field>
                    <Field label="Last Name">
                      <Input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Doe"
                        required
                      />
                    </Field>
                  </Grid>

                  {/* Email Field */}
                  <Field label="Email Address">
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </Field>

                  {/* Password Field */}
                  <Field label="Password">
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Create a strong password"
                      required
                    />
                  </Field>

                  {/* Confirm Password Field */}
                  <Field label="Confirm Password">
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Re-enter your password"
                      required
                    />
                  </Field>

                  {/* Terms Checkbox */}
                  <Stack direction="horizontal" gap={3} className="items-start">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                    />
                    <Body size="sm" className="text-muted">
                      I agree to the{" "}
                      <NextLink href="/legal/terms">
                        <Button variant="ghost" size="sm" className="inline p-0">Terms of Service</Button>
                      </NextLink>{" "}
                      and{" "}
                      <NextLink href="/legal/privacy">
                        <Button variant="ghost" size="sm" className="inline p-0">Privacy Policy</Button>
                      </NextLink>
                    </Body>
                  </Stack>

                  {/* Primary CTA */}
                  <Button
                    type="submit"
                    variant="solid"
                    size="lg"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </Stack>
              </form>

              {/* Sign In Link */}
              <Stack className="text-center">
                <Body size="sm" className="text-muted">
                  Already have an account?{" "}
                  <NextLink href="/auth/signin">
                    <Button variant="ghost" size="sm" className="inline">Sign in</Button>
                  </NextLink>
                </Body>
              </Stack>

              {/* Divider with text */}
              <Stack direction="horizontal" className="items-center gap-4">
                <Divider className="flex-1" />
                <Body className="text-body-sm">Or</Body>
                <Divider className="flex-1" />
              </Stack>

              {/* OAuth Buttons */}
              <Stack gap={3}>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => handleOAuthSignUp('google')}
                  disabled={loading}
                >
                  Sign up with Google
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => handleOAuthSignUp('apple')}
                  disabled={loading}
                >
                  Sign up with Apple
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </SectionLayout>
    </PageLayout>
  );
}
