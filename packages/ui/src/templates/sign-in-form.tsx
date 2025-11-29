"use client";

import { forwardRef, useState } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import { H2, Body, Label } from "../atoms/typography.js";
import { Button } from "../atoms/button.js";
import { Input } from "../atoms/input.js";
import { Checkbox } from "../atoms/checkbox.js";
import { Divider } from "../atoms/divider.js";
import { Card } from "../molecules/card.js";
import { Field } from "../molecules/field.js";
import { Alert } from "../molecules/alert.js";
import { Stack } from "../foundations/layout.js";
import { ScrollReveal } from "../molecules/scroll-reveal.js";
import { Lock, ArrowRight } from "lucide-react";

// =============================================================================
// SIGN IN FORM - Unified Authentication Form Component
// Bold Contemporary Pop Art Adventure Design System
// Standardized sign-in form for all apps
// =============================================================================

export type SignInFormProps = Omit<HTMLAttributes<HTMLDivElement>, "title" | "onSubmit"> & {
  /** App name for description text */
  appName: string;
  /** Custom description text (overrides default) */
  description?: string;
  /** Whether to use dark/inverted theme */
  inverted?: boolean;
  /** Show lock icon in header */
  showIcon?: boolean;
  /** Custom title (defaults to "SIGN IN") */
  title?: string;
  /** Form submission handler */
  onSubmit: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  /** OAuth sign-in handler */
  onOAuthSignIn?: (provider: "google" | "apple") => Promise<void>;
  /** Forgot password link href */
  forgotPasswordHref?: string;
  /** Sign up link href */
  signUpHref?: string;
  /** Sign up link text (defaults to "Sign Up") */
  signUpText?: string;
  /** Sign up prompt text (defaults to "Don't have an account?") */
  signUpPrompt?: string;
  /** Show OAuth buttons */
  showOAuth?: boolean;
  /** OAuth providers to show */
  oauthProviders?: Array<"google" | "apple">;
  /** Loading state (controlled externally) */
  loading?: boolean;
  /** Error message (controlled externally) */
  error?: string;
  /** Link component for routing (e.g., Next.js Link) */
  LinkComponent?: React.ComponentType<{ href: string; children: ReactNode; className?: string }>;
};

/**
 * SignInForm - Unified sign-in form component
 * 
 * Features:
 * - Consistent visual design across all apps
 * - Light and dark theme support
 * - OAuth integration
 * - Responsive layout
 * - Pop Art Adventure aesthetic
 */
export const SignInForm = forwardRef<HTMLDivElement, SignInFormProps>(
  function SignInForm(
    {
      appName,
      description,
      inverted = false,
      showIcon = true,
      title = "SIGN IN",
      onSubmit,
      onOAuthSignIn,
      forgotPasswordHref = "/auth/forgot-password",
      signUpHref = "/auth/signup",
      signUpText = "Sign Up",
      signUpPrompt = "Don't have an account?",
      showOAuth = true,
      oauthProviders = ["google", "apple"],
      loading: externalLoading,
      error: externalError,
      LinkComponent,
      className,
      ...props
    },
    ref
  ) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [internalError, setInternalError] = useState("");
    const [internalLoading, setInternalLoading] = useState(false);

    // Use external state if provided, otherwise use internal
    const loading = externalLoading ?? internalLoading;
    const error = externalError ?? internalError;

    const defaultDescription = `Access your ${appName} account to manage ${
      appName === "GVTEWAY" ? "exclusive experiences and member benefits" :
      appName === "COMPVSS" ? "crew and resources" :
      "projects and resources"
    }.`;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setInternalError("");
      setInternalLoading(true);

      try {
        await onSubmit(email, password, rememberMe);
      } catch {
        setInternalError("Invalid email or password. Please try again.");
      } finally {
        setInternalLoading(false);
      }
    };

    const handleOAuthSignIn = async (provider: "google" | "apple") => {
      if (!onOAuthSignIn) return;
      setInternalLoading(true);
      try {
        await onOAuthSignIn(provider);
      } catch {
        setInternalError("OAuth sign-in failed. Please try again.");
      } finally {
        setInternalLoading(false);
      }
    };

    // Use provided Link component or fallback to anchor
    const Link = LinkComponent || (({ href, children, className: linkClassName }: { href: string; children: ReactNode; className?: string }) => (
      <a href={href} className={linkClassName}>{children}</a>
    ));

    return (
      <ScrollReveal animation="slide-up" duration={600}>
        <Card
          ref={ref}
          inverted={inverted}
          className={clsx(
            "border-2 p-6 shadow-md sm:p-8",
            inverted
              ? "border-white/20 bg-black"
              : "border-black/10 bg-white",
            className
          )}
          {...props}
        >
          <Stack gap={6} className="sm:gap-8">
            {/* Header */}
            <Stack gap={3} className="text-center sm:gap-4">
              {showIcon && (
                <div
                  className={clsx(
                    "mx-auto flex size-12 items-center justify-center border-2 sm:size-16",
                    inverted
                      ? "border-white/20 bg-white/5"
                      : "border-black/10 bg-grey-100"
                  )}
                >
                  <Lock
                    className={clsx(
                      "size-6 sm:size-8",
                      inverted ? "text-warning" : "text-black"
                    )}
                  />
                </div>
              )}
              <H2 className={inverted ? "text-white" : "text-black"}>
                {title}
              </H2>
              <Body
                size="sm"
                className={inverted ? "text-on-dark-muted" : "text-muted"}
              >
                {description || defaultDescription}
              </Body>
            </Stack>

            {/* Error Alert */}
            {error && <Alert variant="error">{error}</Alert>}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Stack gap={4} className="sm:gap-6">
                <Field label="Email Address" inverted={inverted}>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    inverted={inverted}
                  />
                </Field>

                <Field label="Password" inverted={inverted}>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    inverted={inverted}
                  />
                </Field>

                {/* Remember Me & Forgot Password */}
                <Stack
                  direction="horizontal"
                  className="flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      inverted={inverted}
                    />
                    <Label
                      size="xs"
                      className={inverted ? "text-on-dark-muted" : "text-muted"}
                    >
                      Remember me
                    </Label>
                  </Stack>
                  <Link href={forgotPasswordHref}>
                    <Button
                      variant="ghost"
                      size="sm"
                      inverted={inverted}
                      type="button"
                    >
                      Forgot password?
                    </Button>
                  </Link>
                </Stack>

                <Button
                  type="submit"
                  variant={inverted ? "pop" : "solid"}
                  size="lg"
                  fullWidth
                  disabled={loading}
                  icon={<ArrowRight className="size-4" />}
                  iconPosition="right"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </Stack>
            </form>

            {/* OAuth Section */}
            {showOAuth && onOAuthSignIn && oauthProviders.length > 0 && (
              <>
                {/* Divider */}
                <Stack direction="horizontal" className="items-center gap-4">
                  <Divider inverted={inverted} className="flex-1" />
                  <Label
                    size="xs"
                    className={clsx(
                      "whitespace-nowrap",
                      inverted ? "text-on-dark-muted" : "text-muted"
                    )}
                  >
                    Or continue with
                  </Label>
                  <Divider inverted={inverted} className="flex-1" />
                </Stack>

                {/* OAuth Buttons */}
                <Stack gap={3}>
                  {oauthProviders.includes("google") && (
                    <Button
                      variant={inverted ? "outlineInk" : "outline"}
                      size="lg"
                      fullWidth
                      onClick={() => handleOAuthSignIn("google")}
                      disabled={loading}
                      type="button"
                    >
                      Continue with Google
                    </Button>
                  )}
                  {oauthProviders.includes("apple") && (
                    <Button
                      variant={inverted ? "outlineInk" : "outline"}
                      size="lg"
                      fullWidth
                      onClick={() => handleOAuthSignIn("apple")}
                      disabled={loading}
                      type="button"
                    >
                      Continue with Apple
                    </Button>
                  )}
                </Stack>
              </>
            )}

            {/* Sign Up Link */}
            {signUpHref && (
              <Stack
                gap={3}
                className={clsx(
                  "border-t pt-6 text-center sm:gap-4",
                  inverted ? "border-white/10" : "border-black/10"
                )}
              >
                <Body
                  size="sm"
                  className={inverted ? "text-on-dark-muted" : "text-muted"}
                >
                  {signUpPrompt}
                </Body>
                <Link href={signUpHref}>
                  <Button
                    variant={inverted ? "outline" : "ghost"}
                    size="sm"
                    type="button"
                    className={
                      inverted
                        ? "border-warning text-warning hover:bg-warning hover:text-black"
                        : undefined
                    }
                  >
                    {signUpText}
                  </Button>
                </Link>
              </Stack>
            )}
          </Stack>
        </Card>
      </ScrollReveal>
    );
  }
);

export default SignInForm;
