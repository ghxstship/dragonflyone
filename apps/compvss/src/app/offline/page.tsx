'use client';

import {
  Container,
  Section,
  H2,
  Body,
  Button,
  Card,
  Stack,
  PageLayout,
  Navigation,
  Footer,
  FooterColumn,
  FooterLink,
} from '@ghxstship/ui';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <PageLayout
      background="white"
      header={
        <Navigation
          logo={<Body className="font-display">COMPVSS</Body>}
          cta={<></>}
        />
      }
      footer={
        <Footer
          logo={<Body className="font-display">COMPVSS</Body>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Support">
            <FooterLink href="/help">Help Center</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section className="flex min-h-screen items-center justify-center py-16">
        <Container className="max-w-lg">
          <Card className="p-8 text-center">
            <Stack gap={6} className="items-center">
              <Stack gap={2} className="items-center">
                <Body className="text-display-lg">📡</Body>
                <H2>YOU&apos;RE OFFLINE</H2>
              </Stack>
              
              <Body className="text-center">
                It looks like you&apos;ve lost your internet connection. 
                Some features may be limited while offline.
              </Body>

              <Stack gap={4} className="w-full">
                <Card className="p-4">
                  <Stack gap={2}>
                    <Body className="font-display">Available Offline:</Body>
                    <Stack gap={1}>
                      <Body size="sm" className="">• View cached crew data</Body>
                      <Body size="sm" className="">• Access saved schedules</Body>
                      <Body size="sm" className="">• Log time entries (syncs when online)</Body>
                      <Body size="sm" className="">• View knowledge base articles</Body>
                    </Stack>
                  </Stack>
                </Card>

                <Card className="p-4">
                  <Stack gap={2}>
                    <Body className="font-display">Unavailable Offline:</Body>
                    <Stack gap={1}>
                      <Body size="sm" className="">• Real-time updates</Body>
                      <Body size="sm" className="">• New data fetching</Body>
                      <Body size="sm" className="">• File uploads</Body>
                      <Body size="sm" className="">• Live communications</Body>
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

              <Body size="sm" className="">
                Your data will automatically sync when you&apos;re back online.
              </Body>
            </Stack>
          </Card>
        </Container>
      </Section>
    </PageLayout>
  );
}
