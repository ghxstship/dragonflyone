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
// SIGN IN PAGE - ATLVS Authentication
// Bold Contemporary Pop Art Adventure Design System - Light Theme
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
      router.push("/dashboard");
    } catch {
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
    } catch {
      setError("OAuth sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthPage
      appName="ATLVS"
      headerAction={
        <NextLink href="/auth/signup" className="hidden sm:block">
          <Button variant="outline" size="sm">
            Sign Up
          </Button>
        </NextLink>
      }
    >
      <ScrollReveal animation="slide-up" duration={600}>
        <Card className="border-2 border-black/10 bg-white p-6 shadow-md sm:p-8">
          <Stack gap={6} className="sm:gap-8">
            {/* Header */}
            <Stack gap={3} className="text-center sm:gap-4">
              <div className="mx-auto flex size-12 items-center justify-center border-2 border-black/10 bg-grey-100 sm:size-16">
                <Lock className="size-6 text-black sm:size-8" />
              </div>
              <H2 className="text-black">SIGN IN</H2>
              <Body size="sm" className="text-muted">
                Access your ATLVS account to manage projects and resources.
              </Body>
            </Stack>

            {/* Error Alert */}
            {error && <Alert variant="error">{error}</Alert>}

            {/* Form */}
            <form onSubmit={handleSignIn}>
              <Stack gap={4} className="sm:gap-6">
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

                {/* Remember Me & Forgot Password */}
                <Stack
                  direction="horizontal"
                  className="flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <Label size="xs" className="text-muted">
                      Remember me
                    </Label>
                  </Stack>
                  <NextLink href="/auth/forgot-password">
                    <Button variant="ghost" size="sm">
                      Forgot password?
                    </Button>
                  </NextLink>
                </Stack>

                <Button
                  type="submit"
                  variant="solid"
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
              <Divider className="flex-1" />
              <Label size="xs" className="whitespace-nowrap text-muted">
                Or continue with
              </Label>
              <Divider className="flex-1" />
            </Stack>

            {/* OAuth Buttons */}
            <Stack gap={3}>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => handleOAuthSignIn("google")}
                disabled={loading}
              >
                Continue with Google
              </Button>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => handleOAuthSignIn("apple")}
                disabled={loading}
              >
                Continue with Apple
              </Button>
            </Stack>

            {/* Sign Up Link */}
            <Stack gap={3} className="border-t border-black/10 pt-6 text-center sm:gap-4">
              <Body size="sm" className="text-muted">
                Don&apos;t have an account?
              </Body>
              <NextLink href="/auth/signup">
                <Button variant="ghost" size="sm">
                  Sign Up
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Card>
      </ScrollReveal>
    </AuthPage>
  );
}
