"use client";

import { Navigation } from "../components/navigation";
import { Button, Display, H2, Body, Container, Stack, Section, Card } from "@ghxstship/ui";

export default function NotFound() {
  return (
    <Section className="relative min-h-screen overflow-hidden bg-black text-white">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8} className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <Display size="xl" className="text-white">404</Display>
          <H2 className="text-white">Page Not Found</H2>
          <Body className="max-w-md text-grey-400">
            The page you are looking for doesn&apos;t exist or has been moved.
          </Body>
          <Stack gap={4} direction="horizontal">
            <Button variant="solid" onClick={() => window.location.href = "/"}>
              Go Home
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
            <Button variant="ghost" onClick={() => window.location.href = "/dashboard"}>
              Dashboard
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
