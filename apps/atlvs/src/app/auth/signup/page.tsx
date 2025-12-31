"use client";

/**
 * Sign Up Page
 * User registration
 * Uses AuthPage template for consistent layout
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  Body, Button, Input, Checkbox, Label, Form, Link, AuthPage, useToast, Box} from "@ghxstship/ui";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const router = useRouter();
  const toast = useToast();

  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const signUpMutation = useMutation({
    mutationFn: async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Account Created", "Please check your email to verify your account");
      router.push("/auth/verify-email");
    },
    onError: (error: Error) => {
      toast.error("Sign Up Failed", error.message);
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) signUpMutation.mutate({ name: formData.name, email: formData.email, password: formData.password });
  };

  return (
    <AuthPage
      title="Create Account"
      subtitle="Get started with your free account"
      footer={{ text: "Already have an account?", linkText: "Sign in", linkHref: "/auth/signin" }}
    >
      <Form onSubmit={handleSubmit} className="space-y-4">
        <Box>
          <Body size="sm" className="text-on-dark-muted mb-1">Full Name</Body>
          <Box className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" />
            <Input placeholder="John Smith" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} className={`pl-10 ${errors.name ? "border-error" : ""}`} />
          </Box>
          {errors.name && <Body size="sm" className="text-error mt-1">{errors.name}</Body>}
        </Box>

        <Box>
          <Body size="sm" className="text-on-dark-muted mb-1">Email</Body>
          <Box className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" />
            <Input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className={`pl-10 ${errors.email ? "border-error" : ""}`} />
          </Box>
          {errors.email && <Body size="sm" className="text-error mt-1">{errors.email}</Body>}
        </Box>

        <Box>
          <Body size="sm" className="text-on-dark-muted mb-1">Password</Body>
          <Box className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" />
            <Input type={showPassword ? "text" : "password"} placeholder="Create a password" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} className={`pl-10 pr-10 ${errors.password ? "border-error" : ""}`} />
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 min-w-0 text-on-dark-muted hover:text-white" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </Box>
          {errors.password && <Body size="sm" className="text-error mt-1">{errors.password}</Body>}
        </Box>

        <Box>
          <Body size="sm" className="text-on-dark-muted mb-1">Confirm Password</Body>
          <Box className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" />
            <Input type="password" placeholder="Confirm your password" value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} className={`pl-10 ${errors.confirmPassword ? "border-error" : ""}`} />
          </Box>
          {errors.confirmPassword && <Body size="sm" className="text-error mt-1">{errors.confirmPassword}</Body>}
        </Box>

        <Label className="flex items-start gap-2 cursor-pointer">
          <Checkbox className="mt-1" required />
          <Body size="sm" className="text-on-dark-muted">I agree to the <Link href="/legal/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link></Body>
        </Label>

        <Button type="submit" variant="solid" className="w-full" disabled={signUpMutation.isPending}>
          {signUpMutation.isPending ? "Creating account..." : "Create Account"}
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
