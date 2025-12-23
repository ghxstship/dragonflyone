"use client";

import {
  Stack,
  H2,
  Body,
  Card,
  EnterprisePageHeader,
} from "@ghxstship/ui";

export default function LandingBuilderPage() {
  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="Landing Builder"
        subtitle="Build custom event landing pages"
        showFavorite
        showSettings
      />

      <Card inverted className="border-2 border-ink-800 p-8">
        <Stack gap={4} className="items-center justify-center py-12">
          <H2 className="text-white">Landing Builder</H2>
          <Body className="text-grey-300 text-center max-w-md">
            Build custom event landing pages
          </Body>
        </Stack>
      </Card>
    </Stack>
  );
}
