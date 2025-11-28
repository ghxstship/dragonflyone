"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@ghxstship/ui";
import { useAuthContext } from "@ghxstship/config";
import {
  H2,
  Body,
  Button,
  Input,
  Alert,
  Stack,
  Card,
  Field,
  Checkbox,
  Divider,
  Label,
  ScrollReveal,
  AuthPage,
} from "@ghxstship/ui";
import NextLink from "next/link";
import { Lock, ArrowRight } from "lucide-react";

// =============================================================================
// SIGN IN PAGE - Member Authentication
// Bold Contemporary Pop Art Adventure Design System
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

  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/oauth/${provider}`, { method: "POST" });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        addNotification({
          type: "info",
          title: "Coming Soon",
          message: `${provider} sign-in will be available once OAuth is configured`,
        });
        setLoading(false);
      }
    } catch (err) {
      setError("OAuth sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthPage
      appName="GVTEWAY"
      background="black"
      headerAction={
        <NextLink href="/apply" className="hidden sm:block">
          <Button variant="outlineInk" size="sm">
            Apply for Membership
          </Button>
        </NextLink>
      }
    >
          <ScrollReveal animation="slide-up" duration={600}>
            {/* Auth Card - Pop Art Style with hard offset shadow */}
            <Card
              inverted
              className="border-2 border-white/20 bg-black p-6 shadow-md sm:p-8"
            >
              <Stack gap={6} className="sm:gap-8">
                {/* Header */}
                <Stack gap={3} className="text-center sm:gap-4">
                  <div className="mx-auto flex size-12 items-center justify-center border-2 border-white/20 bg-white/5 sm:size-16">
                    <Lock className="size-6 text-warning sm:size-8" />
                  </div>
                  <H2 className="text-white">MEMBER SIGN IN</H2>
                  <Body size="sm" className="text-on-dark-muted">
                    Access your exclusive experiences and member benefits.
                  </Body>
                </Stack>

                {/* Error Alert */}
                {error && <Alert variant="error">{error}</Alert>}

                {/* Form */}
                <form onSubmit={handleSignIn}>
                  <Stack gap={4} className="sm:gap-6">
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

                    {/* Remember Me & Forgot Password - Stack on mobile */}
                    <Stack
                      direction="horizontal"
                      className="flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          inverted
                        />
                        <Label size="xs" className="text-on-dark-muted">
                          Remember me
                        </Label>
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
                      variant="pop"
                      size="lg"
                      fullWidth
                      disabled={loading}
                      icon={<ArrowRight className="size-4" />}
                      iconPosition="right"
                    >
                      {loading ? "Signing In..." : "Sign In"}
                    </Button>
                  </Stack>
                </form>

                {/* Divider */}
                <Stack direction="horizontal" className="items-center gap-4">
                  <Divider inverted className="flex-1" />
                  <Label size="xs" className="text-on-dark-muted whitespace-nowrap">
                    Or continue with
                  </Label>
                  <Divider inverted className="flex-1" />
                </Stack>

                {/* OAuth Buttons */}
                <Stack gap={3}>
                  <Button
                    variant="outlineInk"
                    size="lg"
                    fullWidth
                    onClick={() => handleOAuthSignIn("google")}
                    disabled={loading}
                  >
                    Continue with Google
                  </Button>
                  <Button
                    variant="outlineInk"
                    size="lg"
                    fullWidth
                    onClick={() => handleOAuthSignIn("apple")}
                    disabled={loading}
                  >
                    Continue with Apple
                  </Button>
                </Stack>

                {/* Not a member */}
                <Stack gap={3} className="border-t border-white/10 pt-6 text-center sm:gap-4">
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
          </ScrollReveal>
    </AuthPage>
  );
}
