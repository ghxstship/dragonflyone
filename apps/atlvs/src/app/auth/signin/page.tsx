"use client";

/**
 * Sign In Page
 * User authentication with modern split-screen layout
 * Bold Contemporary Pop Art Adventure Design System
 */

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Sparkles, Shield, Zap } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
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
import { supabase } from "@/lib/supabase";

export default function SignInPage() {
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [socialLoading, setSocialLoading] = useState<string | undefined>();

  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Welcome back!", "You have been signed in successfully");
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error("Sign In Failed", error.message);
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
      title="Welcome Back"
      subtitle="Sign in to continue to your account"
      footer={{ text: "Don't have an account?", linkText: "Create one", linkHref: "/auth/signup" }}
      brandLogo={
        <H1 className="text-white text-h2-md">ATLVS</H1>
      }
      brandTagline="Experience Management, Elevated"
      brandFeatures={[
        {
          icon: <Sparkles className="size-5 text-white" />,
          title: "AI-Powered Insights",
          description: "Smart recommendations for every event",
        },
        {
          icon: <Shield className="size-5 text-white" />,
          title: "Enterprise Security",
          description: "SOC 2 compliant infrastructure",
        },
        {
          icon: <Zap className="size-5 text-white" />,
          title: "Real-Time Collaboration",
          description: "Work together seamlessly",
        },
      ]}
      testimonial={{
        quote: "ATLVS transformed how we manage our events. The platform is intuitive and powerful.",
        author: "Sarah Chen",
        role: "Event Director, TechConf",
      }}
    >
      <Form onSubmit={handleSubmit}>
        <Stack gap={4}>
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
            isLoading={signInMutation.isPending}
            loadingText="Signing in..."
          >
            Sign In
          </Button>

          <AuthDivider />

          <SocialAuthButtonGroup
            providers={["google", "microsoft"]}
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
    </AuthSplitLayout>
  );
}
