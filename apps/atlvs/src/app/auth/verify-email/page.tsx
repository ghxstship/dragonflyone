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
  Body, Button, AuthPage, H2, useToast, Box, Stack } from "@ghxstship/ui";
import { supabase } from "@/lib/supabase";

export default function VerifyEmailPage() {
  const router = useRouter();
  const toast = useToast();

  const resendMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No email found");
      const { error } = await supabase.auth.resend({ type: "signup", email: user.email });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Email Sent", "Verification email has been resent");
    },
    onError: (err: Error) => {
      toast.error("Error", err.message);
    },
  });

  return (
    <AuthPage>
      <Stack gap={6} className="text-center">
        <H2>Verify Your Email</H2>
        <Body className="text-on-dark-muted">We&apos;ve sent a verification link to your email address</Body>
        <Box className="p-4 bg-primary/20 rounded-avatar w-fit mx-auto">
          <Mail className="size-8 text-primary" />
        </Box>

        <Body className="text-on-dark-muted">
          Please check your inbox and click the verification link to activate your account. 
          If you don&apos;t see the email, check your spam folder.
        </Body>

        <Stack gap={3}>
          <Button variant="outline" className="w-full" onClick={() => resendMutation.mutate()} disabled={resendMutation.isPending} icon={<RefreshCw className={`size-4 ${resendMutation.isPending ? "animate-spin" : ""}`} />} iconPosition="left">
            {resendMutation.isPending ? "Sending..." : "Resend Verification Email"}
          </Button>

          <Button variant="ghost" className="w-full" onClick={() => router.push("/auth/signin")}>
            Back to Sign In
          </Button>
        </Stack>
      </Stack>
    </AuthPage>
  );
}
