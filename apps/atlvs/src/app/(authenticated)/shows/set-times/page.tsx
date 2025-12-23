"use client";

import {
  Stack,
  H2,
  Body,
  Card,
  EnterprisePageHeader,
} from "@ghxstship/ui";

export default function SetTimesPage() {
  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="Set Times"
        subtitle="Manage set times"
        showFavorite
        showSettings
      />

      <Card inverted className="border-2 border-ink-800 p-8">
        <Stack gap={4} className="items-center justify-center py-12">
          <H2 className="text-white">Set Times</H2>
          <Body className="text-grey-300 text-center max-w-md">
            Manage set times. This page is under development.
          </Body>
        </Stack>
      </Card>
    </Stack>
  );
}
