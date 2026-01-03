"use client";

/**
 * Sign Up Page
 * User registration with modern split-screen layout
 * Bold Contemporary Pop Art Adventure Design System
 */

export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Calendar, Users, BarChart3 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Form,
  Link,
  Text,
  AuthSplitLayout,
  AuthFormField,
  AuthPasswordInput,
  PasswordRequirements,
  AuthCheckbox,
  AuthDivider,
  SocialAuthButtonGroup,
  useToast,
  Stack,
  H1,
} from "@ghxstship/ui";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const router = useRouter();
  const toast = useToast();

  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [socialLoading, setSocialLoading] = useState<string | undefined>();

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
    if (!agreedToTerms) newErrors.terms = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) signUpMutation.mutate({ name: formData.name, email: formData.email, password: formData.password });
  };

  const handleSocialAuth = async (provider: string) => {
    setSocialLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as "google" | "azure",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      toast.error("Authentication Failed", (error as Error).message);
      setSocialLoading(undefined);
    }
  };

  return (
    <AuthSplitLayout
      title="Create Your Account"
      subtitle="Start managing experiences like a pro"
      footer={{ text: "Already have an account?", linkText: "Sign in", linkHref: "/auth/signin" }}
      brandLogo={
        <H1 className="text-white text-h2-md">ATLVS</H1>
      }
      brandTagline="Everything You Need to Create Unforgettable Experiences"
      brandFeatures={[
        {
          icon: <Calendar className="size-5 text-white" />,
          title: "Event Planning",
          description: "Comprehensive tools for any event size",
        },
        {
          icon: <Users className="size-5 text-white" />,
          title: "Team Collaboration",
          description: "Work together in real-time",
        },
        {
          icon: <BarChart3 className="size-5 text-white" />,
          title: "Analytics Dashboard",
          description: "Data-driven insights for success",
        },
      ]}
      formMaxWidth="md"
    >
      <Form onSubmit={handleSubmit}>
        <Stack gap={3}>
          <AuthFormField
            label="Full Name"
            placeholder="John Smith"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("name", e.target.value)}
            errorMessage={errors.name}
            icon={<User className="size-5" />}
            autoComplete="name"
            required
          />

          <AuthFormField
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("email", e.target.value)}
            errorMessage={errors.email}
            icon={<Mail className="size-5" />}
            autoComplete="email"
            required
          />

          <Stack gap={2}>
            <AuthPasswordInput
              label="Password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("password", e.target.value)}
              errorMessage={errors.password}
              icon={<Lock className="size-5" />}
              autoComplete="new-password"
              showStrength
              required
            />
            {formData.password && (
              <PasswordRequirements requirements={passwordRequirements} />
            )}
          </Stack>

          <AuthPasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("confirmPassword", e.target.value)}
            errorMessage={errors.confirmPassword}
            icon={<Lock className="size-5" />}
            autoComplete="new-password"
            required
          />

          <AuthCheckbox
            label={
              <Text size="sm">
                I agree to the{" "}
                <Link href="/legal/terms" className="text-primary-400 hover:text-primary-300 underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/legal/privacy" className="text-primary-400 hover:text-primary-300 underline">
                  Privacy Policy
                </Link>
              </Text>
            }
            checked={agreedToTerms}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgreedToTerms(e.target.checked)}
            required
          />

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

          <AuthDivider />

          <SocialAuthButtonGroup
            providers={["google", "microsoft"]}
            onProviderClick={handleSocialAuth}
            loadingProvider={socialLoading}
            direction="vertical"
          />
        </Stack>
      </Form>
    </AuthSplitLayout>
  );
}
