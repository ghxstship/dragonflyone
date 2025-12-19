"use client";

import {
  Stack,
  Card,
  H2,
  Body,
  Button,
  Label,
  List,
  ListItem,
  IconBox,
  Container,
} from "@ghxstship/ui";
import { WifiOff, Check, AlertTriangle } from "lucide-react";

/**
 * Offline Page
 * Displayed when user is offline and page is not cached
 */

export default function OfflinePage() {
  return (
    <Container className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md border-2 border-ink-950 bg-white p-8 shadow-brand-lg">
        <Stack gap={6} className="text-center">
          <IconBox size="lg" className="mx-auto">
            <WifiOff className="size-8 text-ink-950" />
          </IconBox>

          <Stack gap={2}>
            <H2 className="text-ink-950">You&apos;re Offline</H2>
            <Body className="text-grey-600">
              It looks like you&apos;ve lost your internet connection. Some features may be unavailable.
            </Body>
          </Stack>

          <Card className="border-2 border-grey-200 bg-grey-50 p-4 text-left">
            <Label size="sm" className="mb-3 block text-ink-950">
              What you can do:
            </Label>
            <List className="space-y-2">
              <ListItem className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                <Body size="sm" className="text-grey-700">View previously cached pages</Body>
              </ListItem>
              <ListItem className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                <Body size="sm" className="text-grey-700">Draft changes that will sync when online</Body>
              </ListItem>
              <ListItem className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                <Body size="sm" className="text-grey-700">Check your network connection</Body>
              </ListItem>
            </List>
          </Card>

          <Stack gap={3}>
            <Button
              variant="solid"
              size="lg"
              fullWidth
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </Stack>

          <Body size="xs" className="text-grey-500">
            Your changes will be saved locally and synced when you&apos;re back online.
          </Body>
        </Stack>
      </Card>
    </Container>
  );
}
