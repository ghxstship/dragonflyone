"use client";

/**
 * Sign In Page
 * User authentication
 * Uses AuthPage template for consistent layout
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  Body, Button, Input, Checkbox, Label, Form, AuthPage, useToast, Box} from "@ghxstship/ui";
import { supabase } from "@/lib/supabase";

export default function SignInPage() {
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Welcome back!", "You have been signed in successfully");
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error("Sign In Failed", error.message);
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) signInMutation.mutate({ email, password });
  };

  return (
    <AuthPage
      title="Sign In"
      subtitle="Welcome back! Sign in to your account"
      footer={{ text: "Don't have an account?", linkText: "Sign up", linkHref: "/auth/signup" }}
    >
      <Form onSubmit={handleSubmit} className="space-y-4">
        <Box>
          <Body size="sm" className="text-on-dark-muted mb-1">Email</Body>
          <Box className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" />
            <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((prev) => ({ ...prev, email: "" })); }} className={`pl-10 ${errors.email ? "border-error" : ""}`} />
          </Box>
          {errors.email && <Body size="sm" className="text-error mt-1">{errors.email}</Body>}
        </Box>

        <Box>
          <Body size="sm" className="text-on-dark-muted mb-1">Password</Body>
          <Box className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" />
            <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((prev) => ({ ...prev, password: "" })); }} className={`pl-10 pr-10 ${errors.password ? "border-error" : ""}`} />
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 min-w-0 text-on-dark-muted hover:text-white" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </Box>
          {errors.password && <Body size="sm" className="text-error mt-1">{errors.password}</Body>}
        </Box>

        <Box className="flex items-center justify-between">
          <Label className="flex items-center gap-2 cursor-pointer">
            <Checkbox />
            <Body size="sm" className="text-on-dark-muted">Remember me</Body>
          </Label>
          <Button variant="ghost" size="sm" onClick={() => router.push("/auth/forgot-password")}>Forgot password?</Button>
        </Box>

        <Button type="submit" variant="solid" className="w-full" disabled={signInMutation.isPending}>
          {signInMutation.isPending ? "Signing in..." : "Sign In"}
        </Button>

        <Box className="relative my-6">
          <Box className="absolute inset-0 flex items-center"><Box className="w-full border-t border-grey-700" /></Box>
          <Box className="relative flex justify-center"><Body size="sm" className="bg-grey-900 px-2 text-on-dark-disabled">Or continue with</Body></Box>
        </Box>

        <Box className="grid grid-cols-2 gap-4">
          <Button variant="outline" type="button">Google</Button>
          <Button variant="outline" type="button">Microsoft</Button>
        </Box>
      </Form>
    </AuthPage>
  );
}
