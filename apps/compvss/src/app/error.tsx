"use client";

import { useEffect } from "react";
import { Navigation } from "../components/navigation";
import { Button, H2, Body, Alert, Container, Stack, Section, Card } from "@ghxstship/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("COMPVSS Error:", error);
  }, [error]);

  return (
    <Section className="relative min-h-screen overflow-hidden bg-black text-white">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8} className="mx-auto max-w-2xl">
          <Stack gap={4} className="text-center">
            <H2 className="text-white">Something Went Wrong</H2>
            <Body className="text-grey-400">
              We encountered an unexpected error. Please try again or contact support if the issue persists.
            </Body>
          </Stack>

          <Alert variant="error">
            {error.message || "An unexpected error occurred"}
          </Alert>

          {error.digest && (
            <Body className="text-center font-mono text-xs text-grey-500">
              Error ID: {error.digest}
            </Body>
          )}

          <Stack gap={4} direction="horizontal" className="justify-center">
            <Button variant="solid" onClick={reset}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              Go Home
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
