"use client";

import { Section, Container, ErrorContent } from "@ghxstship/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <Section className="relative min-h-screen overflow-hidden bg-black" noPadding>
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-10" />
          <Container className="py-16">
            <ErrorContent
              error={error}
              reset={reset}
              appName="GVTEWAY"
              showDashboard={false}
              homePath="/events"
              homeLabel="Browse Events"
            />
          </Container>
        </Section>
      </body>
    </html>
  );
}
