'use client';

import { useEffect, ReactNode } from 'react';
import clsx from 'clsx';
import { Stack } from '../foundations/layout.js';
import { Container, Section } from '../foundations/layout.js';
import { H2, Body } from '../atoms/typography.js';
import { Button } from '../atoms/button.js';
import { Alert } from '../molecules/alert.js';

export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** Navigation component to render at top */
  navigation?: ReactNode;
  /** App name for console logging */
  appName?: string;
  /** Background color class */
  background?: 'ink' | 'black';
  /** Show dashboard button */
  showDashboard?: boolean;
  /** Dashboard path */
  dashboardPath?: string;
}

/**
 * ErrorPage template - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold error display
 * - Clear action buttons
 * - Comic-style error panel
 */
export function ErrorPage({
  error,
  reset,
  navigation,
  appName = 'GHXSTSHIP',
  background = 'ink',
  showDashboard = true,
  dashboardPath = '/dashboard',
}: ErrorPageProps) {
  useEffect(() => {
    console.error(`${appName} Error:`, error);
  }, [error, appName]);

  const bgClass = background === 'ink' ? 'bg-ink-950' : 'bg-black';

  return (
    <Section className={clsx("relative min-h-screen overflow-hidden text-white", bgClass)} noPadding>
      {/* Grid pattern background */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-10" />
      {navigation}
      <Container className="py-16">
        <Stack gap={8} className="mx-auto max-w-2xl">
          {/* Error Icon */}
          <div className="text-center">
            <span className="inline-block text-8xl animate-shake">⚠️</span>
          </div>

          <Stack gap={4} className="text-center">
            <H2 className="text-white uppercase tracking-wider">Something Went Wrong</H2>
            <Body className="text-grey-400">
              We encountered an unexpected error. Please try again or contact support if the issue persists.
            </Body>
          </Stack>

          <Alert variant="error">
            {error.message || 'An unexpected error occurred'}
          </Alert>

          {error.digest && (
            <Body className="text-center font-mono text-xs text-grey-500">
              Error ID: {error.digest}
            </Body>
          )}

          <Stack gap={4} direction="horizontal" className="justify-center flex-wrap">
            <Button variant="solid" onClick={reset}>
              Try Again
            </Button>
            <Button variant="outline" inverted onClick={() => window.location.href = '/'}>
              Go Home
            </Button>
            {showDashboard && (
              <Button variant="ghost" inverted onClick={() => window.location.href = dashboardPath}>
                Dashboard
              </Button>
            )}
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
