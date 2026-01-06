"use client";

/**
 * Sign Up Page
 * User registration with modern split-screen layout
 * Bold Contemporary Pop Art Adventure Design System
 */

export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Form,
  Link,
  Text,
  Box,
  Label,
  Input,
  Checkbox,
  SocialAuthButtonGroup,
  Stack,
  AuthPage,
} from "@ghxstship/ui";
import { useBrand } from "@ghxstship/config";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const router = useRouter();
  const { name: brandName, poweredByText } = useBrand();

  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordRequirements = useMemo(() => [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(formData.password) },
    { label: "Contains a number", met: /[0-9]/.test(formData.password) },
  ], [formData.password]);

  const signUpMutation = useMutation({
    mutationFn: async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      router.push("/auth/verify-email");
    },
    onError: (error: Error) => {
      // Error logged via toast notification
      console.error("Sign up error:", error);
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
    if (!agreedToTerms) newErrors.terms = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) signUpMutation.mutate({ name: formData.name, email: formData.email, password: formData.password });
  };

  const handleSocialAuth = async (provider: string) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as "google" | "azure",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      // Error handled via toast notification
    }
  };

  return (
    <AuthPage
      appName={brandName}
      title="Create Your Account"
      subtitle={`Start managing experiences like a pro with ${poweredByText}`}
      footer={{
        text: "Already have an account?",
        linkText: "Sign in",
        linkHref: "/auth/signin"
      }}
      background="black"
      copyright={`© ${new Date().getFullYear()} GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED.`}
      contentMaxWidth="md"
    >
      <Form onSubmit={handleSubmit}>
        <Stack gap={3}>
          <Box>
            <Label size="sm" className="font-weight-medium text-text-primary">Full Name</Label>
            <Input
              type="text"
              placeholder="John Smith"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={!!errors.name}
              required
            />
            {errors.name && <Text size="sm" className="text-error-500 mt-1">{errors.name}</Text>}
          </Box>

          <Box>
            <Label size="sm" className="font-weight-medium text-text-primary">Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={!!errors.email}
              required
            />
            {errors.email && <Text size="sm" className="text-error-500 mt-1">{errors.email}</Text>}
          </Box>

          <Box>
            <Label size="sm" className="font-weight-medium text-text-primary">Password</Label>
            <Input
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              error={!!errors.password}
              required
            />
            {formData.password && (
              <Stack gap={1} className="mt-2">
                {passwordRequirements.map((req, i) => (
                  <Text key={i} size="xs" className={req.met ? "text-success-500" : "text-text-muted"}>
                    {req.met ? "✓" : "○"} {req.label}
                  </Text>
                ))}
              </Stack>
            )}
            {errors.password && <Text size="sm" className="text-error-500 mt-1">{errors.password}</Text>}
          </Box>

          <Box>
            <Label size="sm" className="font-weight-medium text-text-primary">Confirm Password</Label>
            <Input
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              error={!!errors.confirmPassword}
              required
            />
            {errors.confirmPassword && <Text size="sm" className="text-error-500 mt-1">{errors.confirmPassword}</Text>}
          </Box>

          <Box>
            <Label className="flex items-start">
              <Checkbox
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mr-2 mt-1"
                required
              />
              <Text size="sm" className="text-text-primary">
                I agree to the{" "}
                <Link href="/legal/terms" className="text-primary-400 hover:text-primary-300 underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/legal/privacy" className="text-primary-400 hover:text-primary-300 underline">
                  Privacy Policy
                </Link>
              </Text>
            </Label>
            {errors.terms && <Text size="sm" className="text-error-500 mt-1">{errors.terms}</Text>}
          </Box>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={signUpMutation.isPending}
            loadingText="Creating account..."
          >
            Create Account
          </Button>

          <Text className="text-center">or</Text>

          <SocialAuthButtonGroup
            providers={["google", "microsoft"]}
            onProviderClick={handleSocialAuth}
            direction="vertical"
          />
        </Stack>
      </Form>
    </AuthPage>
  );
}
