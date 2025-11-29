"use client";

import { useRouter } from "next/navigation";
import { useNotifications, AuthPage, SignInForm, Button } from "@ghxstship/ui";
import { useAuthContext } from "@ghxstship/config";
import NextLink from "next/link";

// =============================================================================
// SIGN IN PAGE - GVTEWAY Member Authentication
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuthContext();
  const { addNotification } = useNotifications();

  const handleSubmit = async (email: string, password: string) => {
    await login(email, password);
    router.push("/experiences");
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
      appName="GVTEWAY"
      background="black"
      headerAction={
        <NextLink href="/apply" className="hidden sm:block">
          <Button variant="outlineInk" size="sm">
            Apply for Membership
          </Button>
        </NextLink>
      }
    >
      <SignInForm
        appName="GVTEWAY"
        title="MEMBER SIGN IN"
        description="Access your exclusive experiences and member benefits."
        inverted
        onSubmit={handleSubmit}
        onOAuthSignIn={handleOAuthSignIn}
        signUpHref="/apply"
        signUpText="Apply for Membership"
        signUpPrompt="Not a member yet?"
        LinkComponent={NextLink}
      />
    </AuthPage>
  );
}
