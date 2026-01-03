"use client";

/**
 * Reset Password Page - GVTEWAY
 * Set new password after reset with clean single-column layout
 * Bold Contemporary Pop Art Adventure Design System
 */

export const dynamic = "force-dynamic";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, CheckCircle } from "lucide-react";
import {
  Body,
  Box,
  Button,
  Form,
  AuthSplitLayout,
  AuthPasswordInput,
  PasswordRequirements,
  Spinner,
  Stack,
  H1,
  H2,
} from "@ghxstship/ui";
import { useAuthData } from "@/hooks/useAuth";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const { resetPassword, isResetting: loading } = useAuthData();

  const passwordRequirements = useMemo(() => [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains a number", met: /[0-9]/.test(password) },
  ], [password]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await resetPassword({ token, password });
      setSuccess(true);
      setTimeout(() => router.push("/auth/signin"), 3000);
    } catch (err) {
      setErrors({ password: err instanceof Error ? err.message : "Failed to reset password" });
    }
  };

  if (success) {
    return (
      <AuthSplitLayout
        singleColumn
        brandLogo={<H1 className="text-white text-h2-md">GVTEWAY</H1>}
      >
        <Stack gap={8} className="text-center items-center">
          <Box className="p-6 bg-success-500/20 rounded-avatar border-2 border-success-500/30">
            <CheckCircle className="size-12 text-success-500" />
          </Box>
          
          <Stack gap={3} className="items-center">
            <H2 className="text-white">Password Reset Complete</H2>
            <Body className="text-on-dark-secondary max-w-sm">
              Your password has been updated successfully. Redirecting to sign in...
            </Body>
          </Stack>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => router.push("/auth/signin")}
            className="max-w-xs"
          >
            Sign In Now
          </Button>
        </Stack>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      title="Reset Your Password"
      subtitle="Create a new secure password for your account"
      singleColumn
      brandLogo={<H1 className="text-white text-h2-md">GVTEWAY</H1>}
    >
      <Form onSubmit={handleSubmit}>
        <Stack gap={5}>
          <Stack gap={3}>
            <AuthPasswordInput
              label="New Password"
              placeholder="Enter new password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
              }}
              errorMessage={errors.password}
              icon={<Lock className="size-5" />}
              autoComplete="new-password"
              showStrength
              required
            />
            {password && <PasswordRequirements requirements={passwordRequirements} />}
          </Stack>

          <AuthPasswordInput
            label="Confirm New Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            errorMessage={errors.confirmPassword}
            icon={<Lock className="size-5" />}
            autoComplete="new-password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            loadingText="Resetting..."
          >
            Reset Password
          </Button>
        </Stack>
      </Form>
    </AuthSplitLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <AuthSplitLayout
        singleColumn
        brandLogo={<H1 className="text-white text-h2-md">GVTEWAY</H1>}
      >
        <Stack gap={8} className="text-center items-center">
          <Spinner size="lg" />
        </Stack>
      </AuthSplitLayout>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
