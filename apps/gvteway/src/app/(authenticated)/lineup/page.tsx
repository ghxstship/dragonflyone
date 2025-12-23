"use client";

import {
  Stack,
  H2,
  Body,
  Card,
  EnterprisePageHeader,
} from "@ghxstship/ui";

export default function LineupPage() {
  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="Lineup"
        subtitle="Event lineup and schedule"
        showFavorite
        showSettings
      />

      <Card inverted className="border-2 border-ink-800 p-8">
        <Stack gap={4} className="items-center justify-center py-12">
          <H2 className="text-white">Lineup</H2>
          <Body className="text-grey-300 text-center max-w-md">
            Event lineup and schedule
          </Body>
        </Stack>
      </Card>
    </Stack>
  );
}
