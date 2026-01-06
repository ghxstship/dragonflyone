"use client";

/**
 * Sign Up Page - GVTEWAY Registration
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
      console.error("Signup error:", error);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    try {
      const response = await fetch(`/api/auth/oauth/${provider}`, { method: "POST" });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.info("Coming Soon", `${provider} signup will be available once OAuth is configured`);
      }
    } catch {
      console.error("Social auth failed");
    }
  };

  return (
    <AuthPage
      appName="GVTEWAY"
      title="Create Your Account"
      subtitle="Join GVTEWAY and unlock exclusive experiences"
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
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Full Name</label>
            <input
              type="text"
              placeholder="John Smith"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
            <input
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <div>
            <label className="flex items-start">
              <input
                type="checkbox"
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
            </label>
            {errors.terms && <p className="text-red-500 text-sm mt-1">{errors.terms}</p>}
          </div>

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
            <span className="text-text-primary">or</span>
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
