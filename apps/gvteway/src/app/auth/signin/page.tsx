"use client";

/**
 * Sign In Page - GVTEWAY Member Authentication
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
import { useAuthData } from "@/hooks/useAuth";

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuthContext();
  const { oauthSignIn } = useAuthData();
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
      router.push("/experiences");
    } catch (error) {
      toast.error("Sign In Failed", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    setSocialLoading(provider);
    try {
      const data = await oauthSignIn(provider as "google" | "apple");
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
      appName="GVTEWAY"
      title="Member Sign In"
      subtitle="Access your exclusive experiences and member benefits"
      footer={{
        text: "Not a member yet?",
        linkText: "Apply for Membership",
        linkHref: "/apply"
      }}
      background="black"
      copyright={`© ${new Date().getFullYear()} GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED.`}
    >
      <Form onSubmit={handleSubmit}>
        <Stack gap={4}>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
            <AuthPasswordInput
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
              }}
              errorMessage={errors.password}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-text-primary">Remember me</span>
            </label>
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

          <div className="text-center">
            <span className="text-text-primary">or</span>
          </div>

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
            className="text-text-muted hover:text-text-primary"
          >
            Sign in with magic link instead
          </Button>
        </Stack>
      </Form>
    </AuthPage>
  );
}
