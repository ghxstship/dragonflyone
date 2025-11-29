"use client";

import { useRouter } from "next/navigation";
import { useNotifications, AuthPage, SignInForm } from "@ghxstship/ui";
import { useAuthContext } from "@ghxstship/config";
import NextLink from "next/link";
import { CreatorNavigationPublic } from "@/components/navigation";

// =============================================================================
// SIGN IN PAGE - COMPVSS Authentication
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuthContext();
  const { addNotification } = useNotifications();

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
      addNotification({
        type: "info",
        title: "Coming Soon",
        message: `${provider} sign-in will be available once OAuth is configured`,
      });
    }
  };

  return (
    <AuthPage header={<CreatorNavigationPublic />}>
      <SignInForm
        appName="COMPVSS"
        onSubmit={handleSubmit}
        onOAuthSignIn={handleOAuthSignIn}
        signUpHref="/auth/signup"
        LinkComponent={NextLink}
      />
    </AuthPage>
  );
}
