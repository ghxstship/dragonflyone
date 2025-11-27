'use client';

import {
  Container,
  Section,
  Display,
  H2,
  Body,
  Button,
  Card,
  Stack,
} from '@ghxstship/ui';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <Section className="min-h-screen bg-white flex items-center justify-center">
      <Container className="max-w-lg">
        <Card className="p-8 text-center">
          <Stack gap={6} className="items-center">
            <Stack gap={2} className="items-center">
              <Display className="text-h1-sm">📡</Display>
              <H2>YOU&apos;RE OFFLINE</H2>
            </Stack>
            
            <Body variant="muted" className="text-center">
              It looks like you&apos;ve lost your internet connection. 
              Some features may be limited while offline.
            </Body>

            <Stack gap={4} className="w-full">
              <Card className="p-4 bg-ink-100">
                <Stack gap={2}>
                  <Body className="font-bold">Available Offline:</Body>
                  <Stack gap={1}>
                    <Body className="text-body-sm">• View cached crew data</Body>
                    <Body className="text-body-sm">• Access saved schedules</Body>
                    <Body className="text-body-sm">• Log time entries (syncs when online)</Body>
                    <Body className="text-body-sm">• View knowledge base articles</Body>
                  </Stack>
                </Stack>
              </Card>

              <Card className="p-4 bg-ink-100">
                <Stack gap={2}>
                  <Body className="font-bold">Unavailable Offline:</Body>
                  <Stack gap={1}>
                    <Body className="text-body-sm text-ink-600">• Real-time updates</Body>
                    <Body className="text-body-sm text-ink-600">• New data fetching</Body>
                    <Body className="text-body-sm text-ink-600">• File uploads</Body>
                    <Body className="text-body-sm text-ink-600">• Live communications</Body>
                  </Stack>
                </Stack>
              </Card>
            </Stack>

            <Stack direction="horizontal" gap={4}>
              <Button variant="solid" onClick={handleRetry}>
                TRY AGAIN
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                GO BACK
              </Button>
            </Stack>

            <Body className="text-mono-xs text-ink-500">
              Your data will automatically sync when you&apos;re back online.
            </Body>
          </Stack>
        </Card>
      </Container>
    </Section>
  );
}
