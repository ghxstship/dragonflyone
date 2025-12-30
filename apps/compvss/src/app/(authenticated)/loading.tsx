'use client';

import {
  Container, Section, Stack, Grid, Card, Box} from '@ghxstship/ui';

export default function AuthenticatedLoading() {
  return (
    <Section className="min-h-screen bg-grey-100 py-8">
      <Container>
        <Stack gap={6}>
          {/* Header skeleton */}
          <Stack gap={2}>
            <Box className="h-8 w-64 animate-pulse rounded-card bg-grey-200" />
            <Box className="h-4 w-96 animate-pulse rounded-card bg-grey-200" />
          </Stack>

          {/* Stats row skeleton */}
          <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-2 border-grey-200 p-6">
                <Stack gap={3}>
                  <Box className="size-10 animate-pulse rounded-card bg-grey-200" />
                  <Box className="h-6 w-20 animate-pulse rounded-card bg-grey-200" />
                  <Box className="h-4 w-32 animate-pulse rounded-card bg-grey-200" />
                </Stack>
              </Card>
            ))}
          </Grid>

          {/* Main content skeleton */}
          <Card className="border-2 border-grey-200 p-6">
            <Stack gap={4}>
              <Box className="h-6 w-48 animate-pulse rounded-card bg-grey-200" />
              <Grid cols={3} gap={4} className="sm:grid-cols-1 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="border-2 border-grey-200 p-4">
                    <Stack gap={3}>
                      <Box className="h-4 w-24 animate-pulse rounded-card bg-grey-200" />
                      <Box className="h-6 w-32 animate-pulse rounded-card bg-grey-200" />
                      <Box className="h-2 w-full animate-pulse rounded-card bg-grey-200" />
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>
          </Card>

          {/* Table skeleton */}
          <Card className="border-2 border-grey-200 p-6">
            <Stack gap={4}>
              <Stack direction="horizontal" gap={4} className="items-center justify-between">
                <Box className="h-6 w-32 animate-pulse rounded-card bg-grey-200" />
                <Box className="h-10 w-32 animate-pulse rounded-card bg-grey-200" />
              </Stack>
              <Stack gap={2}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Box key={i} className="h-16 w-full animate-pulse rounded-card bg-grey-200" />
                ))}
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Section>
  );
}
