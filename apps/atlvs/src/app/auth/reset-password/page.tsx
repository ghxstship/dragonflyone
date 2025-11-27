"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
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
  SectionLayout,
  Alert,
  Stack,
  Field,
} from "@ghxstship/ui";

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
    <PageLayout
      background="white"
      header={
        <Navigation
          logo={<Display size="md" className="text-display-md text-black">ATLVS</Display>}
          cta={<></>}
        />
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-black text-display-md">ATLVS</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Legal">
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <SectionLayout background="grey">
        <Stack gap={8} className="mx-auto max-w-md bg-white p-8 border border-grey-200">
          {success ? (
            <Stack gap={6} className="text-center">
              <Stack className="w-16 h-16 mx-auto bg-grey-200 rounded-full items-center justify-center">
                <Check className="w-8 h-8" />
              </Stack>
              <H2>Password Reset</H2>
              <Body className="text-grey-600">Your password has been successfully reset. Redirecting to sign in...</Body>
            </Stack>
          ) : (
            <>
              <Stack gap={4} className="text-center">
                <H2>New Password</H2>
                <Body className="text-grey-600">Enter your new password below.</Body>
              </Stack>

              {error && <Alert variant="error">{error}</Alert>}

              <Stack gap={6}>
                <Field label="New Password">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                  <Body size="sm" className="text-grey-500 mt-1">Minimum 8 characters</Body>
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

                <Button variant="solid" className="w-full" disabled={loading} onClick={handleSubmit}>
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>

                <Stack className="text-center">
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/auth/signin'} className="text-grey-600 hover:text-black">
                    Back to Sign In
                  </Button>
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </SectionLayout>
    </PageLayout>
  );
}
