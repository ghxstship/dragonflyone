"use client";

/**
 * Verify Email Page
 * Email verification confirmation
 * Uses AuthPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Mail, RefreshCw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  Body, Button, AuthPage, H2, useNotifications} from "@ghxstship/ui";
import { supabase } from "@/lib/supabase";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();

  const resendMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No email found");
      const { error } = await supabase.auth.resend({ type: "signup", email: user.email });
      if (error) throw error;
    },
    onSuccess: () => {
      addNotification({ type: "success", title: "Email Sent", message: "Verification email has been resent" });
    },
    onError: (err: Error) => {
      addNotification({ type: "error", title: "Error", message: err.message });
    },
  });

  return (
    <AuthPage>
      <div className="text-center space-y-6">
        <H2>Verify Your Email</H2>
        <Body className="text-grey-400">We&apos;ve sent a verification link to your email address</Body>
        <div className="p-4 bg-primary/20 rounded-avatar w-fit mx-auto">
          <Mail className="size-8 text-primary" />
        </div>

        <Body className="text-grey-400">
          Please check your inbox and click the verification link to activate your account. 
          If you don&apos;t see the email, check your spam folder.
        </Body>

        <div className="space-y-3">
          <Button variant="outline" className="w-full" onClick={() => resendMutation.mutate()} disabled={resendMutation.isPending} icon={<RefreshCw className={`size-4 ${resendMutation.isPending ? "animate-spin" : ""}`} />} iconPosition="left">
            {resendMutation.isPending ? "Sending..." : "Resend Verification Email"}
          </Button>

          <Button variant="ghost" className="w-full" onClick={() => router.push("/auth/signin")}>
            Back to Sign In
          </Button>
        </div>
      </div>
    </AuthPage>
  );
}
