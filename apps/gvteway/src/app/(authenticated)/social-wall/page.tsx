"use client";

import {
  Stack,
  H2,
  Body,
  Card,
  EnterprisePageHeader,
} from "@ghxstship/ui";

export default function SocialWallPage() {
  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="Social Wall"
        subtitle="Live social media wall"
        showFavorite
        showSettings
      />

      <Card inverted className="border-2 border-ink-800 p-8">
        <Stack gap={4} className="items-center justify-center py-12">
          <H2 className="text-white">Social Wall</H2>
          <Body className="text-grey-300 text-center max-w-md">
            Live social media wall
          </Body>
        </Stack>
      </Card>
    </Stack>
  );
}
