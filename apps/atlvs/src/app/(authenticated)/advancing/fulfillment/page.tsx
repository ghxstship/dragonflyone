"use client";

import {
  Stack,
  H2,
  Body,
  Card,
  EnterprisePageHeader,
} from "@ghxstship/ui";

export default function AdvancingFulfillmentPage() {
  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="Advancing Fulfillment"
        subtitle="Track and manage fulfillment of advancing requests"
        showFavorite
        showSettings
      />

      <Card inverted className="border-2 border-ink-800 p-8">
        <Stack gap={4} className="items-center justify-center py-12">
          <H2 className="text-white">Advancing Fulfillment</H2>
          <Body className="text-grey-300 text-center max-w-md">
            Track and manage fulfillment of advancing requests. This page is under development.
          </Body>
        </Stack>
      </Card>
    </Stack>
  );
}
