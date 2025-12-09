"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import {
  H2,
  Body,
  Button,
  Input,
  Alert,
  Stack,
  Field,
  Card,
  AuthPage,
} from "@ghxstship/ui";
import NextLink from "next/link";

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
      const response = await fetch('/api/auth/password/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => router.push('/auth/signin'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPage appName="COMPVSS">
          <Card variant="elevated" className="p-8">
            {success ? (
              <Stack gap={6} className="text-center">
                <Card className="mx-auto flex size-16 items-center justify-center">
                  <Check className="size-8" />
                </Card>
                <H2 className="text-black">Password Reset</H2>
                <Body className="text-muted">Your password has been successfully reset. Redirecting to sign in...</Body>
              </Stack>
            ) : (
              <Stack gap={8}>
                <Stack gap={4} className="text-center">
                  <H2 className="text-black">New Password</H2>
                  <Body className="text-muted">Enter your new password below.</Body>
                </Stack>

                {error && <Alert variant="error">{error}</Alert>}

                <form onSubmit={handleSubmit}>
                  <Stack gap={6}>
                    <Field label="New Password" hint="Minimum 8 characters">
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                      />
                    </Field>

                    <Field label="Confirm Password">
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                      />
                    </Field>

                    <Button type="submit" variant="solid" size="lg" fullWidth disabled={loading}>
                      {loading ? "Resetting..." : "Reset Password"}
                    </Button>

                    <Stack className="text-center">
                      <NextLink href="/auth/signin">
                        <Button variant="ghost" size="sm">
                          Back to Sign In
                        </Button>
                      </NextLink>
                    </Stack>
                  </Stack>
                </form>
              </Stack>
            )}
          </Card>
    </AuthPage>
  );
}
