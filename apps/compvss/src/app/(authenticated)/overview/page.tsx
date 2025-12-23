"use client";

import {
  Stack,
  H2,
  Body,
  Card,
  EnterprisePageHeader,
} from "@ghxstship/ui";

export default function OverviewPage() {
  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="Overview"
        subtitle="Production overview dashboard"
        showFavorite
        showSettings
      />

      <Card inverted className="border-2 border-ink-800 p-8">
        <Stack gap={4} className="items-center justify-center py-12">
          <H2 className="text-white">Overview</H2>
          <Body className="text-grey-300 text-center max-w-md">
            Production overview dashboard
          </Body>
        </Stack>
      </Card>
    </Stack>
  );
}
