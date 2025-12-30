"use client";

import { Section, Container, ErrorContent, Box } from "@ghxstship/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-ink-950 text-white antialiased">
        <Section className="relative min-h-screen overflow-hidden bg-ink-950" noPadding>
          <Box className="pointer-events-none absolute inset-0 bg-grid opacity-10" />
          <Container className="py-16">
            <ErrorContent
              error={error}
              reset={reset}
              appName="ATLVS"
              showDashboard={true}
              dashboardPath="/dashboard"
              supportEmail="support@atlvs.com"
            />
          </Container>
        </Section>
      </body>
    </html>
  );
}
