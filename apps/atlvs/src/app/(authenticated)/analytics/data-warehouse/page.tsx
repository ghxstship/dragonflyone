"use client";

import {
  Stack,
  H2,
  Body,
  Card,
  EnterprisePageHeader,
} from "@ghxstship/ui";

export default function DataWarehousePage() {
  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="Data Warehouse"
        subtitle="Access and query the data warehouse"
        showFavorite
        showSettings
      />

      <Card inverted className="border-2 border-ink-800 p-8">
        <Stack gap={4} className="items-center justify-center py-12">
          <H2 className="text-white">Data Warehouse</H2>
          <Body className="text-grey-300 text-center max-w-md">
            Access and query the data warehouse. This page is under development.
          </Body>
        </Stack>
      </Card>
    </Stack>
  );
}
