"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@ghxstship/ui";
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
  Grid,
  Label,
  Link,
  ScrollReveal,
  AuthPage,
} from "@ghxstship/ui";
import NextLink from "next/link";
import { UserPlus, ArrowRight } from "lucide-react";

// =============================================================================
// SIGN UP PAGE - Member Registration
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

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
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/auth/verify-email?email=" + encodeURIComponent(formData.email));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: "google" | "apple") => {
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
          message: `${provider} sign-up will be available once OAuth is configured`,
        });
        setLoading(false);
      }
    } catch (err) {
      setError("OAuth sign-up failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthPage
      appName="GVTEWAY"
      background="black"
      headerAction={
        <NextLink href="/auth/signin" className="hidden sm:block">
          <Button variant="outlineInk" size="sm">
            Sign In
          </Button>
        </NextLink>
      }
    >
          <ScrollReveal animation="slide-up" duration={600}>
            {/* Auth Card - Pop Art Style */}
            <Card inverted className="border-2 border-white/20 bg-black p-6 shadow-md sm:p-8">
              <Stack gap={6} className="sm:gap-8">
                {/* Header */}
                <Stack gap={3} className="text-center sm:gap-4">
                  <div className="mx-auto flex size-12 items-center justify-center border-2 border-white/20 bg-white/5 sm:size-16">
                    <UserPlus className="size-6 text-warning sm:size-8" />
                  </div>
                  <H2 className="text-white">CREATE ACCOUNT</H2>
                  <Body size="sm" className="text-on-dark-muted">
                    Join GVTEWAY to discover and experience unforgettable live events.
                  </Body>
                </Stack>

                {/* Error Alert */}
                {error && <Alert variant="error">{error}</Alert>}

                {/* Form */}
                <form onSubmit={handleSignUp}>
                  <Stack gap={4} className="sm:gap-6">
                    {/* Name Fields - Stack on mobile, Grid on desktop */}
                    <Grid cols={1} gap={4} className="sm:grid-cols-2">
                      <Field label="First Name" inverted>
                        <Input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="John"
                          required
                          inverted
                        />
                      </Field>
                      <Field label="Last Name" inverted>
                        <Input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Doe"
                          required
                          inverted
                        />
                      </Field>
                    </Grid>

                    {/* Email Field */}
                    <Field label="Email Address" inverted>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                        inverted
                      />
                    </Field>

                    {/* Password Field */}
                    <Field label="Password" hint="Minimum 8 characters" inverted>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Create a strong password"
                        required
                        inverted
                      />
                    </Field>

                    {/* Confirm Password Field */}
                    <Field label="Confirm Password" inverted>
                      <Input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Re-enter your password"
                        required
                        inverted
                      />
                    </Field>

                    {/* Terms Checkbox */}
                    <Stack direction="horizontal" gap={3} className="items-start">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                        inverted
                      />
                      <Label size="xs" className="text-on-dark-muted">
                        I agree to the{" "}
                        <Link href="/legal/terms" className="text-white underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/legal/privacy" className="text-white underline">
                          Privacy Policy
                        </Link>
                      </Label>
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
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </Stack>
                </form>

                {/* Divider */}
                <Stack direction="horizontal" className="items-center gap-4">
                  <Divider inverted className="flex-1" />
                  <Label size="xs" className="text-on-dark-muted whitespace-nowrap">
                    Or sign up with
                  </Label>
                  <Divider inverted className="flex-1" />
                </Stack>

                {/* OAuth Buttons */}
                <Stack gap={3}>
                  <Button
                    variant="outlineInk"
                    size="lg"
                    fullWidth
                    onClick={() => handleOAuthSignUp("google")}
                    disabled={loading}
                  >
                    Sign up with Google
                  </Button>
                  <Button
                    variant="outlineInk"
                    size="lg"
                    fullWidth
                    onClick={() => handleOAuthSignUp("apple")}
                    disabled={loading}
                  >
                    Sign up with Apple
                  </Button>
                </Stack>

                {/* Sign In Link */}
                <Stack gap={2} className="border-t border-white/10 pt-6 text-center">
                  <Body size="sm" className="text-on-dark-muted">
                    Already have an account?
                  </Body>
                  <NextLink href="/auth/signin">
                    <Button variant="ghost" size="sm" inverted>
                      Sign In
                    </Button>
                  </NextLink>
                </Stack>
              </Stack>
            </Card>
          </ScrollReveal>
    </AuthPage>
  );
}
