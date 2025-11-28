'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';
import { Stack } from '../foundations/layout.js';
import { Container, Section } from '../foundations/layout.js';
import { H2, Body } from '../atoms/typography.js';
import { Button } from '../atoms/button.js';

export interface NotFoundPageProps {
  /** Navigation component to render at top */
  navigation?: ReactNode;
  /** Background color class */
  background?: 'ink' | 'black';
  /** Show dashboard button */
  showDashboard?: boolean;
  /** Dashboard path */
  dashboardPath?: string;
  /** Custom message */
  message?: string;
}

/**
 * NotFoundPage template - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Giant bold 404 display
 * - Comic-style presentation
 * - Clear navigation options
 */
export function NotFoundPage({
  navigation,
  background = 'ink',
  showDashboard = true,
  dashboardPath = '/dashboard',
  message = "The page you are looking for doesn't exist or has been moved.",
}: NotFoundPageProps) {
  const bgClass = background === 'ink' ? 'bg-ink-950' : 'bg-black';

  return (
    <Section className={clsx("relative min-h-screen overflow-hidden text-white", bgClass)} noPadding>
      {/* Grid pattern background */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-10" />
      {navigation}
      <Container className="py-16">
        <Stack gap={8} className="flex min-h-[70vh] flex-col items-center justify-center text-center">
          {/* Giant 404 with comic style */}
          <div className={clsx(
            "relative inline-block",
            "text-[12rem] md:text-[16rem] font-display font-black leading-none",
            "text-transparent bg-clip-text",
            "bg-gradient-to-br from-white via-grey-200 to-grey-400",
            "drop-shadow-[8px_8px_0_rgba(0,0,0,0.3)]"
          )}>
            404
            {/* Comic-style accent */}
            <div className="absolute -top-4 -right-4 rotate-12 text-4xl">💥</div>
          </div>
          
          <H2 className="text-white uppercase tracking-wider">Page Not Found</H2>
          <Body className="max-w-md text-grey-400">
            {message}
          </Body>
          
          <Stack gap={4} direction="horizontal" className="flex-wrap justify-center">
            <Button variant="solid" onClick={() => window.location.href = '/'}>
              Go Home
            </Button>
            <Button variant="outline" inverted onClick={() => window.history.back()}>
              Go Back
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
