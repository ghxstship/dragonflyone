'use client';

import { ReactNode } from 'react';
import { Stack } from '../foundations/layout.js';
import { Container, Section } from '../foundations/layout.js';
import { Card } from '../molecules/card.js';
import { Display, H2, Body } from '../atoms/typography.js';
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
 * Shared 404 page template for all GHXSTSHIP apps.
 * Displays not found message with navigation options.
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
    <Section className={`relative min-h-screen overflow-hidden ${bgClass} text-ink-50`}>
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      {navigation}
      <Container className="py-16">
        <Stack gap={8} className="flex min-h-screen flex-col items-center justify-center text-center">
          <Display size="xl" className="text-white">404</Display>
          <H2 className="text-white">Page Not Found</H2>
          <Body className="max-w-md text-grey-400">
            {message}
          </Body>
          <Stack gap={4} direction="horizontal">
            <Button variant="solid" onClick={() => window.location.href = '/'}>
              Go Home
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
            {showDashboard && (
              <Button variant="ghost" onClick={() => window.location.href = dashboardPath}>
                Dashboard
              </Button>
            )}
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
