'use client';

import {
  Container, Section, Stack, Card, Box} from '@ghxstship/ui';

/**
 * Shared loading component for authenticated route groups.
 * Provides consistent skeleton loading states across all ATLVS routes.
 */
export default function AuthenticatedLoading() {
  return (
    <Section className="min-h-screen bg-muted py-8">
      <Container>
        <Stack gap={6}>
          {/* Header skeleton */}
          <Stack gap={2}>
            <Box className="h-8 w-64 animate-pulse rounded-card bg-muted" />
            <Box className="h-4 w-96 animate-pulse rounded-card bg-muted" />
          </Stack>

          {/* Content skeleton */}
          <Card className="border-2 border-border p-6">
            <Stack gap={4}>
              <Box className="h-6 w-48 animate-pulse rounded-card bg-muted" />
              <Stack gap={3}>
                {[1, 2, 3].map((i) => (
                  <Box key={i} className="h-16 w-full animate-pulse rounded-card bg-muted" />
                ))}
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Section>
  );
}
