"use client";

/**
 * Sign In Page - GVTEWAY Member Authentication
 * Modern split-screen layout with brand showcase
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Ticket, Star, Shield } from "lucide-react";
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
import { useAuthData } from "@/hooks/useAuth";

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuthContext();
  const toast = useToast();
  const { oauthSignIn } = useAuthData();

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
    <AuthSplitLayout
      title="Member Sign In"
      subtitle="Access your exclusive experiences and member benefits"
      footer={{ text: "Not a member yet?", linkText: "Apply for Membership", linkHref: "/apply" }}
      brandLogo={<H1 className="text-white text-h2-md">GVTEWAY</H1>}
      brandTagline="Your Gateway to Unforgettable Experiences"
      brandFeatures={[
        {
          icon: <Ticket className="size-5 text-white" />,
          title: "Exclusive Access",
          description: "Priority tickets to sold-out events",
        },
        {
          icon: <Star className="size-5 text-white" />,
          title: "VIP Experiences",
          description: "Behind-the-scenes and meet & greets",
        },
        {
          icon: <Shield className="size-5 text-white" />,
          title: "Member Benefits",
          description: "Special discounts and early access",
        },
      ]}
      testimonial={{
        quote: "GVTEWAY gave me access to experiences I never thought possible.",
        author: "Sarah Chen",
        role: "Premium Member",
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
