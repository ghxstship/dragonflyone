"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AtlvsAppLayout } from "../../../../components/app-layout";
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
import { Loader2, AlertCircle } from "lucide-react";
import { BlueprintPreview } from "../../components/BlueprintPreview";
import { ExportCTA } from "../../components/ExportCTA";
import type { GeneratedBlueprint } from "../../types";

export const runtime = "edge";

// =============================================================================
// SHARED BLUEPRINT PAGE
// Displays a shared blueprint with option to export to ATLVS
// =============================================================================

export default function SharedBlueprintPage() {
  const params = useParams();
  const shareId = params.id as string;
  
  const [blueprint, setBlueprint] = useState<GeneratedBlueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlueprint() {
      try {
        const response = await fetch(`/api/generator/share?id=${shareId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load blueprint");
        }

        setBlueprint(data.blueprint);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load blueprint");
      } finally {
        setLoading(false);
      }
    }

    if (shareId) {
      fetchBlueprint();
    }
  }, [shareId]);

  const handleReset = () => {
    window.location.href = "/generator";
  };

  if (loading) {
    return (
      <AtlvsAppLayout variant="public" background="white" rawContent>
        <FullBleedSection background="white" className="min-h-screen py-24">
          <Container className="mx-auto max-w-container-4xl px-6 text-center">
            <Stack gap={6} className="items-center">
              <Loader2 className="size-12 animate-spin text-grey-400" />
              <Body className="text-grey-600">Loading shared blueprint...</Body>
            </Stack>
          </Container>
        </FullBleedSection>
      </AtlvsAppLayout>
    );
  }

  if (error) {
    return (
      <AtlvsAppLayout variant="public" background="white" rawContent>
        <FullBleedSection background="white" className="min-h-screen py-24">
          <Container className="mx-auto max-w-container-4xl px-6 text-center">
            <Stack gap={6} className="items-center">
              <Box className="flex size-16 items-center justify-center border-2 border-error bg-error/10">
                <AlertCircle className="size-8 text-error" />
              </Box>
              <H2 className="text-ink-950">Blueprint Not Found</H2>
              <Body className="text-grey-600">{error}</Body>
              <Button
                onClick={handleReset}
                className="border-2 border-ink-950 bg-white px-8 py-4 font-display uppercase tracking-label shadow-md"
              >
                Create Your Own
              </Button>
            </Stack>
          </Container>
        </FullBleedSection>
      </AtlvsAppLayout>
    );
  }

  if (!blueprint) {
    return null;
  }

  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Shared Badge */}
      <FullBleedSection background="white" className="border-b-2 border-grey-200 py-4">
        <Container className="mx-auto max-w-container-6xl px-6">
          <Stack direction="horizontal" gap={4} className="items-center justify-between">
            <Text className="font-mono text-mono-sm text-grey-500">
              Shared Experience Blueprint
            </Text>
            <Button
              onClick={handleReset}
              className="border-2 border-ink-950 bg-white px-4 py-2 font-mono text-mono-xs uppercase tracking-label"
            >
              Create Your Own
            </Button>
          </Stack>
        </Container>
      </FullBleedSection>

      <BlueprintPreview blueprint={blueprint} />
      <ExportCTA blueprint={blueprint} onReset={handleReset} />
    </AtlvsAppLayout>
  );
}
