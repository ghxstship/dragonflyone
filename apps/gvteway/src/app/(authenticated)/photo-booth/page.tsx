"use client";

import {
  Stack,
  H2,
  Body,
  Card,
  EnterprisePageHeader,
} from "@ghxstship/ui";

export default function PhotoBoothPage() {
  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="Photo Booth"
        subtitle="Virtual photo booth experience"
        showFavorite
        showSettings
      />

      <Card inverted className="border-2 border-ink-800 p-8">
        <Stack gap={4} className="items-center justify-center py-12">
          <H2 className="text-white">Photo Booth</H2>
          <Body className="text-grey-300 text-center max-w-md">
            Virtual photo booth experience
          </Body>
        </Stack>
      </Card>
    </Stack>
  );
}
