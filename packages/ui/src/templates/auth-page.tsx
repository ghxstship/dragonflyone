"use client";

import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import { Display } from "../atoms/typography.js";
import { Container } from "../foundations/layout.js";
import { FullBleedSection } from "../foundations/page-regions.js";
import { Stack } from "../foundations/layout.js";
import { Label } from "../atoms/typography.js";

// =============================================================================
// AUTH PAGE TEMPLATE
// Bold Contemporary Pop Art Adventure Design System
// Standardized authentication page layout with header, content, and footer
// =============================================================================

export type AuthPageProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  /** App name displayed in header */
  appName: string;
  /** Link destination for app logo */
  appHref?: string;
  /** Header action (e.g., Sign Up button) */
  headerAction?: ReactNode;
  /** Main content */
  children: ReactNode;
  /** Footer links */
  footerLinks?: Array<{ label: string; href: string }>;
  /** Background theme */
  background?: "white" | "black";
  /** Copyright text */
  copyright?: string;
};

/**
 * AuthPage - Standardized authentication page template
 * 
 * Features:
 * - Consistent header with app branding
 * - Centered content area with grid pattern background
 * - Footer with legal links
 * - Responsive design
 * - Pop Art Adventure aesthetic
 */
export const AuthPage = forwardRef<HTMLDivElement, AuthPageProps>(
  function AuthPage(
    {
      appName,
      appHref = "/",
      headerAction,
      children,
      footerLinks = [
        { label: "Privacy", href: "/legal/privacy" },
        { label: "Terms", href: "/legal/terms" },
        { label: "Help", href: "/help" },
      ],
      background = "white",
      copyright = `© ${new Date().getFullYear()} GHXSTSHIP INDUSTRIES`,
      className,
      ...props
    },
    ref
  ) {
    const isDark = background === "black";

    return (
      <div
        ref={ref}
        className={clsx(
          "flex min-h-screen flex-col",
          isDark ? "bg-black text-white" : "bg-white text-black",
          className
        )}
        {...props}
      >
        {/* Header */}
        <header
          className={clsx(
            "sticky top-0 z-50 border-b-2",
            isDark ? "border-white/10 bg-black" : "border-black/10 bg-white"
          )}
        >
          <Container className="flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6">
            <a href={appHref} className="transition-transform hover:-translate-y-0.5">
              <Display size="md" className={isDark ? "text-white" : "text-black"}>
                {appName}
              </Display>
            </a>
            {headerAction}
          </Container>
        </header>

        {/* Main Content */}
        <FullBleedSection
          background={isDark ? "ink" : "grey"}
          pattern="grid"
          patternOpacity={isDark ? 0.03 : 0.04}
          className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12 md:py-16"
        >
          <Container className="w-full max-w-md">
            {children}
          </Container>
        </FullBleedSection>

        {/* Footer */}
        <footer
          className={clsx(
            "border-t-2 py-6",
            isDark ? "border-white/10 bg-black" : "border-black/10 bg-white"
          )}
        >
          <Container className="px-4 text-center sm:px-6">
            <Stack gap={4}>
              {footerLinks.length > 0 && (
                <Stack direction="horizontal" gap={4} className="flex-wrap justify-center">
                  {footerLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className={clsx(
                        "text-mono-xs uppercase transition-colors",
                        isDark
                          ? "text-grey-400 hover:text-white"
                          : "text-grey-500 hover:text-black"
                      )}
                    >
                      {link.label}
                    </a>
                  ))}
                </Stack>
              )}
              <Label size="xxs" className={isDark ? "text-grey-500" : "text-grey-400"}>
                {copyright}
              </Label>
            </Stack>
          </Container>
        </footer>
      </div>
    );
  }
);

export default AuthPage;
