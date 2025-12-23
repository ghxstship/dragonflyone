"use client";

import {
  Stack,
  H2,
  Body,
  Card,
  EnterprisePageHeader,
} from "@ghxstship/ui";

export default function RFIDPage() {
  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="RFID"
        subtitle="RFID wristband management"
        showFavorite
        showSettings
      />

      <Card inverted className="border-2 border-ink-800 p-8">
        <Stack gap={4} className="items-center justify-center py-12">
          <H2 className="text-white">RFID</H2>
          <Body className="text-grey-300 text-center max-w-md">
            RFID wristband management
          </Body>
        </Stack>
      </Card>
    </Stack>
  );
}
