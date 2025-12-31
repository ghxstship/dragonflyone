"use client";

import { useRouter } from "next/navigation";
import { useToast, AuthPage, SignInForm, Button } from "@ghxstship/ui";
import { useAuthContext } from "@ghxstship/config";
import NextLink from "next/link";
import type { ReactNode } from "react";

// Wrapper to match expected LinkComponent type
const Link = ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
  <NextLink href={href} className={className}>{children}</NextLink>
);

// =============================================================================
// SIGN IN PAGE - COMPVSS Authentication
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuthContext();
  const toast = useToast();

  const handleSubmit = async (email: string, password: string) => {
    await login(email, password);
    router.push("/dashboard");
  };

  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    const response = await fetch(`/api/auth/oauth/${provider}`, { method: "POST" });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.info("Coming Soon", `${provider} sign-in will be available once OAuth is configured`);
    }
  };

  return (
    <AuthPage
      appName="COMPVSS"
      headerAction={
        <NextLink href="/auth/signup" className="hidden sm:block">
          <Button variant="outline" size="sm">
            Get Started
          </Button>
        </NextLink>
      }
    >
      <SignInForm
        appName="COMPVSS"
        onSubmit={handleSubmit}
        onOAuthSignIn={handleOAuthSignIn}
        signUpHref="/auth/signup"
        LinkComponent={Link}
      />
    </AuthPage>
  );
}
