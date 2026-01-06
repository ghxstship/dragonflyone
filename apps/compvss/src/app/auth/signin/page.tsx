"use client";

/**
 * Sign In Page - COMPVSS Authentication
 * Modern split-screen layout with brand showcase
 * Bold Contemporary Pop Art Adventure Design System
 */

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import {
  Button,
  Form,
  AuthFormField,
  AuthPasswordInput,
  AuthCheckbox,
  AuthDivider,
  SocialAuthButtonGroup,
  useToast,
  Stack,
  AuthPage,
} from "@ghxstship/ui";
import { useAuthContext } from "@ghxstship/config";

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuthContext();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | undefined>();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (error) {
      toast.error("Sign In Failed", (error as Error).message);
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
        toast.info("Coming Soon", `${provider} sign-in will be available once OAuth is configured`);
        setSocialLoading(undefined);
      }
    } catch {
      toast.error("Authentication Failed", "OAuth sign-in failed");
      setSocialLoading(undefined);
    }
  };

  return (
    <AuthPage
      appName="COMPVSS"
      title="Welcome Back"
      subtitle="Sign in to manage your crew and resources"
      footer={{
        text: "Don't have an account?",
        linkText: "Get started",
        linkHref: "/auth/signup"
      }}
      background="black"
      copyright={`© ${new Date().getFullYear()} GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED.`}
    >
      <Form onSubmit={handleSubmit}>
        <Stack gap={4}>
          <AuthFormField
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            errorMessage={errors.email}
            required
          />

          <AuthPasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
            }}
            errorMessage={errors.password}
            required
          />

          <div className="flex items-center justify-between">
            <AuthCheckbox
              label="Remember me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => router.push("/auth/forgot-password")}
              className="text-primary-400 hover:text-primary-300"
            >
              Forgot password?
            </Button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            loadingText="Signing in..."
          >
            Sign In
          </Button>

          <AuthDivider />

          <SocialAuthButtonGroup
            providers={["google", "apple"]}
            onProviderClick={handleSocialAuth}
            loadingProvider={socialLoading}
            direction="vertical"
          />

          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => router.push("/auth/magic-link")}
            className="text-text-muted hover:text-white"
          >
            Sign in with magic link instead
          </Button>
        </Stack>
      </Form>
    </AuthPage>
  );
}
