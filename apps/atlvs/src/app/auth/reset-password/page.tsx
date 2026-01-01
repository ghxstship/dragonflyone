"use client";

/**
 * Reset Password Page
 * Set new password after reset
 * Uses AuthPage template for consistent layout
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  Body, Button, Input, Form, AuthPage, useToast, Box, Stack } from "@ghxstship/ui";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const toast = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const resetMutation = useMutation({
    mutationFn: async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
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
      <AuthPage title="Password Reset Complete" subtitle="Your password has been updated successfully">
        <Stack gap={6} className="text-center">
          <Box className="p-4 bg-success/20 rounded-avatar w-fit mx-auto">
            <Check className="size-8 text-success" />
          </Box>
          <Body className="text-on-dark-muted">You can now sign in with your new password.</Body>
          <Button variant="solid" onClick={() => router.push("/auth/signin")} className="w-full">Sign In</Button>
        </Stack>
      </AuthPage>
    );
  }

  return (
    <AuthPage title="Reset Password" subtitle="Enter your new password">
      <Form onSubmit={handleSubmit}>
        <Box>
          <Body size="sm" className="text-on-dark-muted mb-1">New Password</Body>
          <Box className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" />
            <Input type={showPassword ? "text" : "password"} placeholder="Enter new password" value={password} onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((prev) => ({ ...prev, password: "" })); }} className={`pl-10 pr-10 ${errors.password ? "border-error" : ""}`} />
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-dark-muted hover:text-on-dark-secondary">
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </Box>
          {errors.password && <Body size="sm" className="text-error mt-1">{errors.password}</Body>}
        </Box>

        <Box>
          <Body size="sm" className="text-on-dark-muted mb-1">Confirm Password</Body>
          <Box className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" />
            <Input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" })); }} className={`pl-10 ${errors.confirmPassword ? "border-error" : ""}`} />
          </Box>
          {errors.confirmPassword && <Body size="sm" className="text-error mt-1">{errors.confirmPassword}</Body>}
        </Box>

        <Button type="submit" variant="solid" className="w-full" disabled={resetMutation.isPending}>
          {resetMutation.isPending ? "Resetting..." : "Reset Password"}
        </Button>
      </Form>
    </AuthPage>
  );
}
