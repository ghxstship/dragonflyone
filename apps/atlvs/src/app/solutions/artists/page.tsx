"use client";

import {
  Stack,
  H1,
  Body,
  Card,
  Container,
  FullBleedSection,
} from "@ghxstship/ui";

export default function ArtistsPage() {
  return (
    <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03}>
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={4}>
            <H1 className="text-white">Artists</H1>
            <Body size="lg" className="text-grey-300 max-w-2xl">
              Solutions for artists and performers
            </Body>
          </Stack>

          <Card inverted className="border-2 border-ink-800 p-8">
            <Stack gap={4} className="items-center justify-center py-12">
              <Body className="text-grey-300 text-center max-w-md">
                Content coming soon.
              </Body>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </FullBleedSection>
  );
}
