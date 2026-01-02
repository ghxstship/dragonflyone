"use client";

/**
 * Sign In Page - COMPVSS Authentication
 * Modern split-screen layout with brand showcase
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Users, Calendar, ClipboardList } from "lucide-react";
import {
  Button,
  Form,
  AuthSplitLayout,
  AuthFormField,
  AuthPasswordInput,
  AuthCheckbox,
  AuthDivider,
  SocialAuthButtonGroup,
  useToast,
  Stack,
  H1,
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
    <AuthSplitLayout
      title="Welcome Back"
      subtitle="Sign in to manage your crew and resources"
      footer={{ text: "Don't have an account?", linkText: "Get started", linkHref: "/auth/signup" }}
      brandLogo={<H1 className="text-white text-h2-md">COMPVSS</H1>}
      brandTagline="Crew & Resource Management, Simplified"
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
      testimonial={{
        quote: "COMPVSS streamlined our crew scheduling and cut admin time in half.",
        author: "Marcus Johnson",
        role: "Operations Manager, StageWorks",
      }}
    >
      <Form onSubmit={handleSubmit}>
        <Stack gap={5}>
          <AuthFormField
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            errorMessage={errors.email}
            icon={<Mail className="size-5" />}
            autoComplete="email"
            required
          />

          <AuthPasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
            }}
            errorMessage={errors.password}
            icon={<Lock className="size-5" />}
            autoComplete="current-password"
            required
          />

          <Stack direction="horizontal" className="items-center justify-between">
            <AuthCheckbox
              label="Remember me"
              checked={rememberMe}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
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
          </Stack>

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
            className="text-on-dark-muted hover:text-white"
          >
            Sign in with magic link instead
          </Button>
        </Stack>
      </Form>
    </AuthSplitLayout>
  );
}
