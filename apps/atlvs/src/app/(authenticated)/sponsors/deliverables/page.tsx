"use client";

import {
  Stack,
  H2,
  Body,
  Card,
  EnterprisePageHeader,
} from "@ghxstship/ui";

export default function SponsorDeliverablesPage() {
  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="Sponsor Deliverables"
        subtitle="Track sponsor deliverables"
        showFavorite
        showSettings
      />

      <Card inverted className="border-2 border-ink-800 p-8">
        <Stack gap={4} className="items-center justify-center py-12">
          <H2 className="text-white">Sponsor Deliverables</H2>
          <Body className="text-grey-300 text-center max-w-md">
            Track sponsor deliverables. This page is under development.
          </Body>
        </Stack>
      </Card>
    </Stack>
  );
}
