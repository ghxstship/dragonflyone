"use client";

/**
 * Verify Email Page
 * Email verification confirmation with clean single-column layout
 * Bold Contemporary Pop Art Adventure Design System
 */

export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { Mail, RefreshCw, ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  Body,
  Box,
  Button,
  AuthSplitLayout,
  useToast,
  Stack,
  H1,
  H2,
} from "@ghxstship/ui";
import { supabase } from "@/lib/supabase";

export default function VerifyEmailPage() {
  const router = useRouter();
  const toast = useToast();

  const resendMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No email found");
      const { error: resendError } = await supabase.auth.resend({ type: "signup", email: user.email });
      if (resendError) throw resendError;
    },
    onSuccess: () => {
      toast.success("Email Sent", "Verification email has been resent");
    },
    onError: (err: Error) => {
      toast.error("Error", err.message);
    },
  });

  return (
    <AuthSplitLayout
      singleColumn
      brandLogo={<H1 className="text-white text-h2-md">ATLVS</H1>}
    >
      <Stack gap={8} className="text-center items-center">
        <Box className="p-6 bg-primary-500/20 rounded-avatar border-2 border-primary-500/30">
          <Mail className="size-12 text-primary-400" />
        </Box>
        
        <Stack gap={3} className="items-center">
          <H2 className="text-white">Verify Your Email</H2>
          <Body className="text-text-secondary max-w-sm">
            We&apos;ve sent a verification link to your email address. Please check your inbox and click the link to activate your account.
          </Body>
          <Body size="sm" className="text-text-disabled max-w-sm">
            If you don&apos;t see the email, check your spam folder.
          </Body>
        </Stack>

        <Stack gap={3} className="w-full max-w-xs">
          <Button
            variant="outline"
            fullWidth
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
            icon={<RefreshCw className={`size-4 ${resendMutation.isPending ? "animate-spin" : ""}`} />}
            iconPosition="left"
          >
            {resendMutation.isPending ? "Sending..." : "Resend Verification Email"}
          </Button>

          <Button
            variant="ghost"
            fullWidth
            onClick={() => router.push("/auth/signin")}
            icon={<ArrowLeft className="size-4" />}
            iconPosition="left"
          >
            Back to Sign In
          </Button>
        </Stack>
      </Stack>
    </AuthSplitLayout>
  );
}
