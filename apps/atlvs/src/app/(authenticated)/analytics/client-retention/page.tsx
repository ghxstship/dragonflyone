"use client";

import {
  Stack,
  H2,
  Body,
  Card,
  EnterprisePageHeader,
} from "@ghxstship/ui";

export default function ClientRetentionPage() {
  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="Client Retention"
        subtitle="Analyze client retention metrics and trends"
        showFavorite
        showSettings
      />

      <Card inverted className="border-2 border-ink-800 p-8">
        <Stack gap={4} className="items-center justify-center py-12">
          <H2 className="text-white">Client Retention</H2>
          <Body className="text-grey-300 text-center max-w-md">
            Analyze client retention metrics and trends. This page is under development.
          </Body>
        </Stack>
      </Card>
    </Stack>
  );
}
