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
  Body, Button, Input, Checkbox, Label, Form, AuthPage, H2, useNotifications} from "@ghxstship/ui";
import { supabase } from "@/lib/supabase";

export default function SignInPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();

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
      addNotification({ type: "success", title: "Welcome back!", message: "You have been signed in successfully" });
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      addNotification({ type: "error", title: "Sign In Failed", message: error.message });
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
    <AuthPage>
      <div className="text-center mb-6">
        <H2>Sign In</H2>
        <Body className="text-grey-400">Welcome back! Sign in to your account</Body>
      </div>
      <Form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Body size="sm" className="text-grey-400 mb-1">Email</Body>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-grey-400" />
            <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((prev) => ({ ...prev, email: "" })); }} className={`pl-10 ${errors.email ? "border-error" : ""}`} />
          </div>
          {errors.email && <Body size="sm" className="text-error mt-1">{errors.email}</Body>}
        </div>

        <div>
          <Body size="sm" className="text-grey-400 mb-1">Password</Body>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-grey-400" />
            <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((prev) => ({ ...prev, password: "" })); }} className={`pl-10 pr-10 ${errors.password ? "border-error" : ""}`} />
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-grey-400 hover:text-grey-300">
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </div>
          {errors.password && <Body size="sm" className="text-error mt-1">{errors.password}</Body>}
        </div>

        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 cursor-pointer">
            <Checkbox />
            <Body size="sm" className="text-grey-400">Remember me</Body>
          </Label>
          <Button variant="ghost" size="sm" onClick={() => router.push("/auth/forgot-password")}>Forgot password?</Button>
        </div>

        <Button type="submit" variant="solid" className="w-full" disabled={signInMutation.isPending}>
          {signInMutation.isPending ? "Signing in..." : "Sign In"}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-grey-700" /></div>
          <div className="relative flex justify-center"><Body size="sm" className="bg-grey-900 px-2 text-grey-500">Or continue with</Body></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" type="button">Google</Button>
          <Button variant="outline" type="button">Microsoft</Button>
        </div>
      </Form>
      <div className="text-center mt-4">
        <Body size="sm" className="text-grey-400">
          Don&apos;t have an account?{" "}
          <Button variant="ghost" size="sm" onClick={() => router.push("/auth/signup")} className="text-primary p-0">Sign up</Button>
        </Body>
      </div>
    </AuthPage>
  );
}
