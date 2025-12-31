"use client";

import {
  Stack,
  Container,
  Body,
  Box,
  Text,
  FullBleedSection,
} from "@ghxstship/ui";
import { Check, Circle, Loader2 } from "lucide-react";
import type { GenerationProgress } from "../types";

// =============================================================================
// GENERATOR PROGRESS COMPONENT
// Real-time generation progress display with AI chat-like streaming feel
// =============================================================================

interface GeneratorProgressProps {
  progress: GenerationProgress | null;
  creativeSeed: string;
}

export function GeneratorProgress({
  progress,
  creativeSeed,
}: GeneratorProgressProps) {
  if (!progress) return null;

  return (
    <FullBleedSection
      background="white"
      pattern="grid"
      patternOpacity={0.03}
      className="relative min-h-screen"
    >
      <Container className="relative mx-auto flex min-h-screen max-w-container-4xl flex-col items-center justify-center px-6 py-16 lg:px-8 lg:py-24">
        <Stack gap={8} className="w-full max-w-xl text-center">
          {/* Creative Seed Display */}
          <Box className="border-2 border-ink-950 bg-grey-50 px-6 py-4 shadow-md">
            <Text className="font-display text-h3-md uppercase tracking-label text-ink-950">
              {creativeSeed}
            </Text>
          </Box>

          {/* Progress Bar */}
          <Box className="w-full">
            <Box className="h-4 w-full border-2 border-ink-950 bg-grey-100">
              <Box
                className="h-full bg-primary transition-all duration-slow"
                style={{ width: `${progress.percentage}%` }}
              />
            </Box>
            <Text className="mt-2 font-mono text-mono-sm text-grey-500">
              {progress.percentage}% complete
            </Text>
          </Box>

          {/* Current Step */}
          <Stack direction="horizontal" gap={3} className="items-center justify-center">
            <Loader2 className="size-5 animate-spin text-primary" />
            <Body className="text-body-md text-grey-600">
              {progress.currentStep}...
            </Body>
          </Stack>

          {/* Step List */}
          <Stack gap={3} className="text-left">
            {progress.completedSteps.map((step, index) => (
              <Stack key={index} direction="horizontal" gap={3} className="items-center">
                <Box className="flex size-6 items-center justify-center border-2 border-success bg-success/10">
                  <Check className="size-4 text-success" />
                </Box>
                <Text className="font-mono text-mono-sm text-grey-500 line-through">
                  {step}
                </Text>
              </Stack>
            ))}
            <Stack direction="horizontal" gap={3} className="items-center">
              <Box className="flex size-6 items-center justify-center border-2 border-primary bg-primary/10">
                <Loader2 className="size-4 animate-spin text-primary" />
              </Box>
              <Text className="font-mono text-mono-sm text-ink-950">
                {progress.currentStep}
              </Text>
            </Stack>
            {Array.from({ length: progress.totalSteps - progress.step }).map((_, index) => (
              <Stack key={`pending-${index}`} direction="horizontal" gap={3} className="items-center">
                <Box className="flex size-6 items-center justify-center border-2 border-grey-300 bg-grey-50">
                  <Circle className="size-4 text-grey-300" />
                </Box>
                <Text className="font-mono text-mono-sm text-grey-400">
                  Pending...
                </Text>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Container>
    </FullBleedSection>
  );
}

export default GeneratorProgress;
