"use client";

/**
 * Sign In Page
 * User authentication with modern split-screen layout
 * Bold Contemporary Pop Art Adventure Design System
 */

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Form,
  AuthInput,
  AuthPasswordInput,
  AuthCheckbox,
  SocialAuthButtonGroup,
  Stack,
  Text,
  AuthPage,
} from "@ghxstship/ui";
import { useBrand } from "@ghxstship/config";
import { supabase } from "@/lib/supabase";

export default function SignInPage() {
  const router = useRouter();
  const { name: brandName, poweredByText } = useBrand();

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
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      // Error logged via toast notification
      console.error("Sign in error:", error);
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
      // Error handled via toast notification
      setSocialLoading(undefined);
    }
  };

  return (
    <AuthPage
      appName={brandName}
      title="Welcome Back"
      subtitle={`Sign in to continue to ${poweredByText}`}
      footer={{
        text: "Don't have an account?",
        linkText: "Create one",
        linkHref: "/auth/signup"
      }}
      background="black"
      copyright={`© ${new Date().getFullYear()} GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED.`}
    >
      <Form onSubmit={handleSubmit}>
        <Stack gap={4}>
          <AuthInput
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            error={!!errors.email}
            required
          />

          <AuthPasswordInput
            placeholder="Enter your password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
            }}
            required
          />

          <Stack direction="horizontal" justify="between" align="center">
            <AuthCheckbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            >
              Remember me
            </AuthCheckbox>
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

          <Stack direction="horizontal" justify="center">
            <Text>or</Text>
          </Stack>

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
            className="text-text-muted hover:text-text-primary"
          >
            Sign in with magic link instead
          </Button>
        </Stack>
      </Form>
    </AuthPage>
  );
}
