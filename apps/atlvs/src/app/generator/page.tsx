"use client";

import { AtlvsAppLayout } from "../../components/app-layout";
import {
  Stack,
  Container,
  Body,
  Box,
  Text,
  FullBleedSection,
  Button,
  H2,
} from "@ghxstship/ui";
import { GeneratorHero } from "./components/GeneratorHero";
import { GeneratorProgress } from "./components/GeneratorProgress";
import { BlueprintPreview } from "./components/BlueprintPreview";
import { ExportCTA } from "./components/ExportCTA";
import { useExperienceGenerator } from "./hooks/useExperienceGenerator";

export const runtime = "edge";

// =============================================================================
// EXPERIENCE GENERATOR PAGE
// Public page for AI-powered experience blueprint generation
// Design: Bold Contemporary Pop Art Adventure with ATLVS Miami Pink accent
// =============================================================================

export default function GeneratorPage() {
  const {
    creativeSeed,
    setCreativeSeed,
    isGenerating,
    progress,
    blueprint,
    error,
    generate,
    reset,
  } = useExperienceGenerator();

  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section with Input */}
      {!blueprint && !isGenerating && (
        <GeneratorHero
          creativeSeed={creativeSeed}
          onCreativeSeedChange={setCreativeSeed}
          onGenerate={generate}
          isGenerating={isGenerating}
        />
      )}

      {/* Generation Progress */}
      {isGenerating && (
        <GeneratorProgress
          progress={progress}
          creativeSeed={creativeSeed}
        />
      )}

      {/* Blueprint Preview */}
      {blueprint && (
        <>
          <BlueprintPreview blueprint={blueprint} />
          <ExportCTA
            blueprint={blueprint}
            onReset={reset}
          />
        </>
      )}

      {/* Error State */}
      {error && (
        <FullBleedSection background="white" className="min-h-screen py-24">
          <Container className="mx-auto max-w-container-4xl px-6 text-center">
            <Stack gap={6} className="items-center">
              <Box className="flex size-16 items-center justify-center border-2 border-error bg-error/10">
                <Text className="text-h3-md text-error">!</Text>
              </Box>
              <H2 className="text-ink-950">Something went wrong</H2>
              <Body className="text-grey-600">{error}</Body>
              <Button
                onClick={reset}
                className="border-2 border-ink-950 bg-white px-8 py-4 font-display uppercase tracking-label shadow-sm"
              >
                Try Again
              </Button>
            </Stack>
          </Container>
        </FullBleedSection>
      )}
    </AtlvsAppLayout>
  );
}
