"use client";

import {
  Stack,
  Container,
  Display,
  Body,
  Label,
  Box,
  Text,
  FullBleedSection,
  Button,
  Input,
} from "@ghxstship/ui";
import { Sparkles } from "lucide-react";

// =============================================================================
// GENERATOR HERO COMPONENT
// Hero section with creative seed input
// =============================================================================

interface GeneratorHeroProps {
  creativeSeed: string;
  onCreativeSeedChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const EXAMPLE_SEEDS = [
  "METAMORPHOSIS",
  "NEON",
  "SANCTUARY",
  "PULSE",
  "ODYSSEY",
  "BLOOM",
];

export function GeneratorHero({
  creativeSeed,
  onCreativeSeedChange,
  onGenerate,
  isGenerating,
}: GeneratorHeroProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  return (
    <FullBleedSection
      background="white"
      pattern="grid"
      patternOpacity={0.03}
      className="relative min-h-screen"
    >
      <Container className="relative mx-auto flex min-h-screen max-w-container-4xl flex-col items-center justify-center px-6 py-16 lg:px-8 lg:py-24">
        <Stack gap={8} className="w-full max-w-2xl text-center">
          {/* Kicker */}
          <Label className="font-mono text-mono-sm uppercase tracking-kicker text-grey-500">
            AI-Powered Experience Design
          </Label>

          {/* Headline */}
          <Display className="font-display text-display-md uppercase leading-none tracking-display text-ink-950 md:text-display-lg">
            Transform Any Idea Into a Production Blueprint
          </Display>

          {/* Description */}
          <Body className="mx-auto max-w-xl text-body-lg text-grey-600">
            Enter a single creative concept and watch as AI generates a complete
            immersive experience blueprint, ready to launch in ATLVS.
          </Body>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="w-full">
            <Stack gap={4}>
              <Box className="relative">
                <Input
                  type="text"
                  value={creativeSeed}
                  onChange={(e) => onCreativeSeedChange(e.target.value)}
                  placeholder="Enter your creative concept..."
                  className="w-full border-2 border-ink-950 bg-white px-6 py-5 text-center font-display text-h4-md uppercase tracking-label shadow-md placeholder:text-grey-400 focus:shadow-lg focus:outline-none"
                  disabled={isGenerating}
                />
              </Box>
              <Button
                type="submit"
                disabled={isGenerating || !creativeSeed.trim()}
                className="flex w-full items-center justify-center gap-3 border-2 border-ink-950 bg-brand-pink px-8 py-5 font-display text-body-md uppercase tracking-label text-white shadow-md transition-all duration-150 hover:-translate-y-1 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="size-5" />
                Generate Blueprint
              </Button>
            </Stack>
          </form>

          {/* Example Seeds */}
          <Box className="pt-4">
            <Text className="mb-3 font-mono text-mono-xs uppercase tracking-kicker text-grey-400">
              Try one of these
            </Text>
            <Stack direction="horizontal" gap={2} className="flex-wrap justify-center">
              {EXAMPLE_SEEDS.map((seed) => (
                <Button
                  key={seed}
                  type="button"
                  onClick={() => onCreativeSeedChange(seed)}
                  className="border-2 border-grey-300 bg-white px-4 py-2 font-mono text-mono-xs uppercase tracking-label text-grey-600 transition-colors hover:border-ink-950 hover:text-ink-950"
                >
                  {seed}
                </Button>
              ))}
            </Stack>
          </Box>
        </Stack>

        {/* Scroll Indicator */}
        <Box className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <Text className="font-mono text-mono-xs uppercase tracking-kicker text-grey-400">
            Powered by ATLVS
          </Text>
        </Box>
      </Container>
    </FullBleedSection>
  );
}
