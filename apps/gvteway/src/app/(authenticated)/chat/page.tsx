"use client";

import {
  Stack,
  H2,
  Body,
  Card,
  EnterprisePageHeader,
} from "@ghxstship/ui";

export default function ChatPage() {
  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="Chat"
        subtitle="Live event chat and messaging"
        showFavorite
        showSettings
      />

      <Card inverted className="border-2 border-ink-800 p-8">
        <Stack gap={4} className="items-center justify-center py-12">
          <H2 className="text-white">Chat</H2>
          <Body className="text-grey-300 text-center max-w-md">
            Live event chat and messaging
          </Body>
        </Stack>
      </Card>
    </Stack>
  );
}
