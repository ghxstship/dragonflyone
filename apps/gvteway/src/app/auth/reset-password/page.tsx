"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  H2,
  Body,
  Button,
  Input,
  Alert,
  Stack,
  Card,
  Field,
  ScrollReveal,
  AuthPage,
} from "@ghxstship/ui";
import { KeyRound, Check, ArrowRight, ArrowLeft } from "lucide-react";
import NextLink from "next/link";

// =============================================================================
// RESET PASSWORD PAGE - Set New Password
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/password/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
      setTimeout(() => router.push("/auth/signin"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPage appName="GVTEWAY" background="black">
          <ScrollReveal animation="slide-up" duration={600}>
            {/* Auth Card - Pop Art Style */}
            <Card inverted className="border-2 border-white/20 bg-black p-6 shadow-md sm:p-8">
              {success ? (
                /* Success State */
                <Stack gap={6} className="text-center sm:gap-8">
                  <div className="mx-auto flex size-12 items-center justify-center border-2 border-white/20 bg-white/5 sm:size-16">
                    <Check className="size-6 text-success sm:size-8" />
                  </div>

                  <Stack gap={3} className="sm:gap-4">
                    <H2 className="text-white">PASSWORD RESET</H2>
                    <Body size="sm" className="text-on-dark-muted">
                      Your password has been successfully reset. Redirecting to sign in...
                    </Body>
                  </Stack>
                </Stack>
              ) : (
                /* Form State */
                <Stack gap={6} className="sm:gap-8">
                  {/* Header */}
                  <Stack gap={3} className="text-center sm:gap-4">
                    <div className="mx-auto flex size-12 items-center justify-center border-2 border-white/20 bg-white/5 sm:size-16">
                      <KeyRound className="size-6 text-warning sm:size-8" />
                    </div>
                    <H2 className="text-white">NEW PASSWORD</H2>
                    <Body size="sm" className="text-on-dark-muted">
                      Enter your new password below.
                    </Body>
                  </Stack>

                  {/* Error Alert */}
                  {error && <Alert variant="error">{error}</Alert>}

                  {/* Form */}
                  <form onSubmit={handleSubmit}>
                    <Stack gap={4} className="sm:gap-6">
                      <Field label="New Password" hint="Minimum 8 characters" inverted>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter new password"
                          required
                          inverted
                        />
                      </Field>

                      <Field label="Confirm Password" inverted>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          required
                          inverted
                        />
                      </Field>

                      <Button
                        type="submit"
                        variant="pop"
                        size="lg"
                        fullWidth
                        disabled={loading}
                        icon={<ArrowRight className="size-4" />}
                        iconPosition="right"
                      >
                        {loading ? "Resetting..." : "Reset Password"}
                      </Button>
                    </Stack>
                  </form>

                  {/* Back Link */}
                  <Stack className="border-t border-white/10 pt-6 text-center">
                    <NextLink href="/auth/signin">
                      <Button
                        variant="ghost"
                        size="sm"
                        inverted
                        icon={<ArrowLeft className="size-4" />}
                        iconPosition="left"
                      >
                        Back to Sign In
                      </Button>
                    </NextLink>
                  </Stack>
                </Stack>
              )}
            </Card>
          </ScrollReveal>
    </AuthPage>
  );
}
