"use client";

/**
 * Reset Password Page
 * Set new password after reset with clean single-column layout
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  Body,
  Box,
  Button,
  Form,
  AuthSplitLayout,
  AuthPasswordInput,
  PasswordRequirements,
  useToast,
  Stack,
  H1,
  H2,
} from "@ghxstship/ui";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const toast = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const passwordRequirements = useMemo(() => [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains a number", met: /[0-9]/.test(password) },
  ], [password]);

  const resetMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      setSuccess(true);
      toast.success("Password Updated", "Your password has been reset successfully");
    },
    onError: (err: Error) => {
      toast.error("Error", err.message);
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) resetMutation.mutate(password);
  };

  if (success) {
    return (
      <AuthSplitLayout
        singleColumn
        brandLogo={<H1 className="text-white text-h2-md">ATLVS</H1>}
      >
        <Stack gap={8} className="text-center items-center">
          <Box className="p-6 bg-success-500/20 rounded-avatar border-2 border-success-500/30">
            <CheckCircle className="size-12 text-success-500" />
          </Box>
          
          <Stack gap={3} className="items-center">
            <H2 className="text-white">Password Reset Complete</H2>
            <Body className="text-on-dark-secondary max-w-sm">
              Your password has been updated successfully. You can now sign in with your new password.
            </Body>
          </Stack>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => router.push("/auth/signin")}
            className="max-w-xs"
          >
            Sign In
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
      brandLogo={<H1 className="text-white text-h2-md">ATLVS</H1>}
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
            {password && (
              <PasswordRequirements requirements={passwordRequirements} />
            )}
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
            isLoading={resetMutation.isPending}
            loadingText="Resetting..."
          >
            Reset Password
          </Button>
        </Stack>
      </Form>
    </AuthSplitLayout>
  );
}
