"use client";

import { Section, Container, Box } from "@ghxstship/ui";
import { AppErrorContent } from "@/components/error-pages";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-surface-inverse text-white antialiased">
        <Section className="relative min-h-screen overflow-hidden bg-surface-inverse" noPadding>
          <Box className="pointer-events-none absolute inset-0 bg-grid opacity-10" />
          <Container className="py-16">
            <AppErrorContent error={error} reset={reset} />
          </Container>
        </Section>
      </body>
    </html>
  );
}
