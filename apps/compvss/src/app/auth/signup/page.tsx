"use client";

/**
 * Sign Up Page - COMPVSS Registration
 * Modern split-screen layout with brand showcase
 * Bold Contemporary Pop Art Adventure Design System
 */

export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Users, Calendar, ClipboardList } from "lucide-react";
import {
  Alert,
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
} from "@ghxstship/ui";

export default function SignUpPage() {
  const router = useRouter();
  const toast = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | undefined>();

  const passwordRequirements = useMemo(() => [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(formData.password) },
    { label: "Contains a number", met: /[0-9]/.test(formData.password) },
  ], [formData.password]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!agreedToTerms) newErrors.terms = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed");

      router.push("/auth/verify-email?email=" + encodeURIComponent(formData.email));
    } catch (err) {
      toast.error("Registration Failed", err instanceof Error ? err.message : "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    setSocialLoading(provider);
    try {
      const response = await fetch(`/api/auth/oauth/${provider}`, { method: "POST" });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.info("Coming Soon", `${provider} sign-up will be available once OAuth is configured`);
        setSocialLoading(undefined);
      }
    } catch {
      toast.error("Authentication Failed", "OAuth sign-up failed");
      setSocialLoading(undefined);
    }
  };

  return (
    <AuthSplitLayout
      title="Create Your Account"
      subtitle="Join COMPVSS to manage your crew and resources"
      footer={{ text: "Already have an account?", linkText: "Sign in", linkHref: "/auth/signin" }}
      brandLogo={<Text className="font-display text-white text-h2-md uppercase tracking-display">COMPVSS</Text>}
      brandTagline="Everything You Need to Manage Your Crew"
      brandFeatures={[
        {
          icon: <Users className="size-5 text-white" />,
          title: "Crew Management",
          description: "Organize and schedule your team effortlessly",
        },
        {
          icon: <Calendar className="size-5 text-white" />,
          title: "Smart Scheduling",
          description: "AI-powered shift optimization",
        },
        {
          icon: <ClipboardList className="size-5 text-white" />,
          title: "Resource Tracking",
          description: "Real-time inventory and equipment status",
        },
      ]}
      formMaxWidth="md"
    >
      <Form onSubmit={handleSubmit}>
        <Stack gap={3}>
          {errors.terms && <Alert variant="error">{errors.terms}</Alert>}

          <Stack direction="horizontal" gap={4}>
            <AuthFormField
              label="First Name"
              placeholder="John"
              value={formData.firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("firstName", e.target.value)}
              errorMessage={errors.firstName}
              icon={<User className="size-5" />}
              autoComplete="given-name"
              required
            />
            <AuthFormField
              label="Last Name"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("lastName", e.target.value)}
              errorMessage={errors.lastName}
              icon={<User className="size-5" />}
              autoComplete="family-name"
              required
            />
          </Stack>

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
            {formData.password && <PasswordRequirements requirements={passwordRequirements} />}
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
              <Text size="sm" className="text-text-secondary">
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
            isLoading={loading}
            loadingText="Creating account..."
          >
            Create Account
          </Button>

          <AuthDivider />

          <SocialAuthButtonGroup
            providers={["google", "apple"]}
            onProviderClick={handleSocialAuth}
            loadingProvider={socialLoading}
            direction="vertical"
          />
        </Stack>
      </Form>
    </AuthSplitLayout>
  );
}
