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
  AuthPage,
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
    <AuthPage appName="COMPVSS">
          <Card variant="elevated" className="p-8">
            <Stack gap={8}>
              {/* Header */}
              <Stack gap={4} className="text-center">
                <H2 className="text-black">Sign In</H2>
                <Body className="text-muted">
                  Access your COMPVSS account to manage crew and resources.
                </Body>
              </Stack>

              {/* Error Alert */}
              {error && <Alert variant="error">{error}</Alert>}

              {/* Form */}
              <form onSubmit={handleSignIn}>
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

                  {/* Remember Me & Forgot Password */}
                  <Stack direction="horizontal" className="items-center justify-between">
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <Body className="text-body-sm">Remember me</Body>
                    </Stack>
                    <NextLink href="/auth/forgot-password">
                      <Button variant="ghost" size="sm" className="text-black">
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
                    <Button variant="ghost" size="sm" className="inline">Sign up</Button>
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
              <Stack className="border-t-2 border-grey-300 pt-6 text-center">
                <NextLink href="/auth/magic-link">
                  <Button variant="ghost" size="sm" className="text-muted hover:text-black">
                    Sign in with Magic Link
                  </Button>
                </NextLink>
              </Stack>
            </Stack>
          </Card>
    </AuthPage>
  );
}
