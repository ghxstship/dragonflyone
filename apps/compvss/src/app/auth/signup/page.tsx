"use client";

/**
 * Sign Up Page - COMPVSS Registration
 * Modern split-screen layout with brand showcase
 * Bold Contemporary Pop Art Adventure Design System
 */

export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Form,
  Link,
  Text,
  AuthDivider,
  SocialAuthButtonGroup,
  Stack,
  AuthPage,
} from "@ghxstship/ui";
import { useAuthContext } from "@ghxstship/config";

export default function SignUpPage() {
  const router = useRouter();
  const { signup } = useAuthContext();

  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await signup(formData.name, formData.email, formData.password);
      router.push("/auth/verify-email");
    } catch (error) {
      // Error handled via toast notification
    }
  };

  const handleSocialAuth = async (provider: string) => {
    try {
      const response = await fetch(`/api/auth/oauth/${provider}`, { method: "POST" });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // OAuth not yet configured for this provider
      }
    } catch (error) {
      // Error handled via toast notification
    }
  };

  return (
    <AuthPage
      appName="COMPVSS"
      title="Create Your Account"
      subtitle="Join COMPVSS and streamline your crew management"
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
          <AuthFormField
            label="Full Name"
            type="text"
            placeholder="John Smith"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            errorMessage={errors.name}
            required
          />

          <AuthFormField
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            errorMessage={errors.email}
            required
          />

          <AuthPasswordInput
            label="Password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            errorMessage={errors.password}
            required
          />

          {formData.password && (
            <div className="mt-2 space-y-1">
              {passwordRequirements.map((req, i) => (
                <div key={i} className={`text-xs ${req.met ? 'text-green-500' : 'text-gray-400'}`}>
                  {req.met ? '✓' : '○'} {req.label}
                </div>
              ))}
            </div>
          )}

          <AuthPasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            errorMessage={errors.confirmPassword}
            required
          />

          <AuthCheckbox
            label={
              <Text size="sm" className="text-white">
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
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            errorMessage={errors.terms}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loadingText="Creating account..."
          >
            Create Account
          </Button>

          <div className="text-center">
            <span className="text-white">or</span>
          </div>

          <SocialAuthButtonGroup
            providers={["google", "apple"]}
            onProviderClick={handleSocialAuth}
            direction="vertical"
          />
        </Stack>
      </Form>
    </AuthPage>
  );
}
