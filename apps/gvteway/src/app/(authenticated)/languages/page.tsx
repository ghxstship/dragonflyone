"use client";

import {
  Stack,
  H2,
  Body,
  Card,
  EnterprisePageHeader,
} from "@ghxstship/ui";

export default function LanguagesPage() {
  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="Languages"
        subtitle="Language and localization settings"
        showFavorite
        showSettings
      />

      <Card inverted className="border-2 border-ink-800 p-8">
        <Stack gap={4} className="items-center justify-center py-12">
          <H2 className="text-white">Languages</H2>
          <Body className="text-grey-300 text-center max-w-md">
            Language and localization settings
          </Body>
        </Stack>
      </Card>
    </Stack>
  );
}
