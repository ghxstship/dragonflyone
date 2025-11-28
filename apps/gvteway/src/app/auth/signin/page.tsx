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
import { Lock, ArrowRight } from "lucide-react";

// =============================================================================
// SIGN IN PAGE - Member Authentication
// =============================================================================

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
      router.push("/experiences");
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
          cta={
            <NextLink href="/apply">
              <Button variant="outline" size="sm" className="border-ink-700 text-on-dark-secondary hover:border-white hover:text-white">
                Apply for Membership
              </Button>
            </NextLink>
          }
        />
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-white">GVTEWAY</Display>}
          copyright="© 2025 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Membership">
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="/membership">Learn More</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="relative flex min-h-[80vh] items-center justify-center overflow-hidden py-12">
        {/* Halftone pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <Container className="relative z-10 w-full max-w-md">
          {/* Auth Card */}
          <Card inverted className="border-2 border-ink-800 bg-ink-950 p-8">
            <Stack gap={8}>
              {/* Header */}
              <Stack gap={4} className="text-center">
                <div className="mx-auto flex size-16 items-center justify-center border-2 border-ink-700 bg-ink-900">
                  <Lock className="size-8 text-warning" />
                </div>
                <H2 className="text-white">MEMBER SIGN IN</H2>
                <Body className="text-on-dark-muted">
                  Access your exclusive experiences and member benefits.
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
                    disabled={loading}
                    icon={<ArrowRight className="size-4" />}
                    iconPosition="right"
                    className="bg-warning text-black hover:bg-warning/90"
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </Stack>
              </form>

              {/* Divider with text */}
              <Stack direction="horizontal" className="items-center gap-4">
                <Divider inverted className="flex-1" />
                <Label size="xs" className="text-on-dark-muted">Or continue with</Label>
                <Divider inverted className="flex-1" />
              </Stack>

              {/* OAuth Buttons */}
              <Stack gap={3}>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={loading}
                  className="border-ink-700 text-on-dark-secondary hover:border-white hover:text-white"
                >
                  Continue with Google
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => handleOAuthSignIn('apple')}
                  disabled={loading}
                  className="border-ink-700 text-on-dark-secondary hover:border-white hover:text-white"
                >
                  Continue with Apple
                </Button>
              </Stack>

              {/* Not a member */}
              <Stack gap={4} className="border-t border-ink-800 pt-6 text-center">
                <Body size="sm" className="text-on-dark-muted">
                  Not a member yet?
                </Body>
                <NextLink href="/apply">
                  <Button variant="outline" size="sm" className="border-warning text-warning hover:bg-warning hover:text-black">
                    Apply for Membership
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
