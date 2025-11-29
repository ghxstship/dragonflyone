"use client";

import { useNotifications, AuthPage, SignInForm, Button } from "@ghxstship/ui";
import { useAuthContext } from "@ghxstship/config";
import NextLink from "next/link";

// =============================================================================
// SIGN IN PAGE - ATLVS Authentication
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export default function SignInPage() {
  const { login } = useAuthContext();
  const { addNotification } = useNotifications();

  const handleSubmit = async (email: string, password: string) => {
    await login(email, password);
    // Use full page reload to ensure cookies are set for middleware
    window.location.href = "/dashboard";
  };

  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    const response = await fetch(`/api/auth/oauth/${provider}`, { method: "POST" });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      addNotification({
        type: "info",
        title: "Coming Soon",
        message: `${provider} sign-in will be available once OAuth is configured`,
      });
    }
  };

  return (
    <AuthPage
      appName="ATLVS"
      headerAction={
        <NextLink href="/auth/signup" className="hidden sm:block">
          <Button variant="outline" size="sm">
            Sign Up
          </Button>
        </NextLink>
      }
    >
      <SignInForm
        appName="ATLVS"
        onSubmit={handleSubmit}
        onOAuthSignIn={handleOAuthSignIn}
        signUpHref="/auth/signup"
        LinkComponent={NextLink}
      />
    </AuthPage>
  );
}
