"use client";

import {
  Stack,
  H2,
  Body,
  Card,
  EnterprisePageHeader,
} from "@ghxstship/ui";

export default function SeatingPage() {
  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="Seating"
        subtitle="Seating chart and selection"
        showFavorite
        showSettings
      />

      <Card inverted className="border-2 border-ink-800 p-8">
        <Stack gap={4} className="items-center justify-center py-12">
          <H2 className="text-white">Seating</H2>
          <Body className="text-grey-300 text-center max-w-md">
            Seating chart and selection
          </Body>
        </Stack>
      </Card>
    </Stack>
  );
}
