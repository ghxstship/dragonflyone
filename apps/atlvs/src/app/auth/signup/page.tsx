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
  Label,
  ScrollReveal,
  AuthPage,
} from "@ghxstship/ui";
import NextLink from "next/link";
import { UserPlus, ArrowRight } from "lucide-react";
import { CreatorNavigationPublic } from "@/components/navigation";

// =============================================================================
// SIGN UP PAGE - ATLVS Account Registration
// Bold Contemporary Pop Art Adventure Design System - Light Theme
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
    <AuthPage header={<CreatorNavigationPublic />}>
          <ScrollReveal animation="slide-up" duration={600}>
            {/* Auth Card - Pop Art Style */}
            <Card className="border-2 border-black/10 bg-white p-6 shadow-md sm:p-8">
              <Stack gap={6} className="sm:gap-8">
                {/* Header */}
                <Stack gap={3} className="text-center sm:gap-4">
                  <div className="mx-auto flex size-12 items-center justify-center border-2 border-black/10 bg-grey-100 sm:size-16">
                    <UserPlus className="size-6 text-black sm:size-8" />
                  </div>
                  <H2 className="text-black">CREATE ACCOUNT</H2>
                  <Body size="sm" className="text-muted">
                    Join ATLVS to manage your projects and resources.
                  </Body>
                </Stack>

                {/* Error Alert */}
                {error && <Alert variant="error">{error}</Alert>}

                {/* Form */}
                <form onSubmit={handleSignUp}>
                  <Stack gap={4} className="sm:gap-6">
                    {/* Name Fields - Responsive Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    </div>

                    <Field label="Email Address">
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                      />
                    </Field>

                    <Field label="Password" hint="Minimum 8 characters">
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Create a strong password"
                        required
                      />
                    </Field>

                    <Field label="Confirm Password">
                      <Input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        placeholder="Re-enter your password"
                        required
                      />
                    </Field>

                    {/* Terms Checkbox */}
                    <Stack direction="horizontal" gap={3} className="items-start">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onChange={(e) =>
                          setFormData({ ...formData, agreeToTerms: e.target.checked })
                        }
                      />
                      <Body size="sm" className="text-muted">
                        I agree to the{" "}
                        <NextLink href="/legal/terms" className="font-weight-medium text-black underline">
                          Terms of Service
                        </NextLink>{" "}
                        and{" "}
                        <NextLink
                          href="/legal/privacy"
                          className="font-weight-medium text-black underline"
                        >
                          Privacy Policy
                        </NextLink>
                      </Body>
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
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </Stack>
                </form>

                {/* Divider */}
                <Stack direction="horizontal" className="items-center gap-4">
                  <Divider className="flex-1" />
                  <Label size="xs" className="text-muted whitespace-nowrap">
                    Or sign up with
                  </Label>
                  <Divider className="flex-1" />
                </Stack>

                {/* OAuth Buttons */}
                <Stack gap={3}>
                  <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    onClick={() => handleOAuthSignUp("google")}
                    disabled={loading}
                  >
                    Sign up with Google
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    onClick={() => handleOAuthSignUp("apple")}
                    disabled={loading}
                  >
                    Sign up with Apple
                  </Button>
                </Stack>

                {/* Sign In Link */}
                <Stack gap={3} className="border-t border-black/10 pt-6 text-center sm:gap-4">
                  <Body size="sm" className="text-muted">
                    Already have an account?
                  </Body>
                  <NextLink href="/auth/signin">
                    <Button variant="ghost" size="sm">
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
