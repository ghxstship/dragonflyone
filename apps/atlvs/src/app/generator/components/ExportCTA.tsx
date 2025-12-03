"use client";

import {
  Stack,
  Container,
  Body,
  Box,
  Text,
  FullBleedSection,
  Button,
  H2,
  Card,
  Grid,
} from "@ghxstship/ui";
import { ArrowRight, Download, Share2, RotateCcw, Check } from "lucide-react";
import type { GeneratedBlueprint } from "../types";

// =============================================================================
// EXPORT CTA COMPONENT
// Conversion call-to-action for exporting blueprint to ATLVS
// =============================================================================

interface ExportCTAProps {
  blueprint: GeneratedBlueprint;
  onReset: () => void;
}

const BENEFITS = [
  "Full production project with all details",
  "12 pre-populated document templates",
  "Org chart with 26 department structure",
  "Compliance checklists ready to execute",
  "Invite unlimited team members",
];

export function ExportCTA({ blueprint, onReset }: ExportCTAProps) {
  const handleExport = async () => {
    // TODO: Implement export to ATLVS
    // This will redirect to auth if not logged in, then create the production
    window.location.href = `/auth/signup?blueprint=${blueprint.id}&redirect=/dashboard`;
  };

  const handleDownloadPDF = async () => {
    // TODO: Implement PDF download
    window.open(`/api/generator/pdf/${blueprint.id}`, "_blank");
  };

  const handleShare = async () => {
    // TODO: Implement share functionality
    const shareUrl = `${window.location.origin}/generator/share/${blueprint.id}`;
    await navigator.clipboard.writeText(shareUrl);
    alert("Share link copied to clipboard!");
  };

  return (
    <FullBleedSection className="bg-ink-950 py-24">
      <Container className="mx-auto max-w-container-4xl px-6 lg:px-8">
        <Grid cols={2} gap={12} className="items-center lg:grid-cols-2">
          {/* Left: CTA Content */}
          <Stack gap={6}>
            <H2 className="font-display text-display-sm uppercase tracking-display text-white">
              Ready to bring{" "}
              <Text className="text-[#FF006E]">{blueprint.concept.name}</Text>{" "}
              to life?
            </H2>
            <Body className="text-body-lg text-grey-400">
              Launch your production in ATLVS and get instant access to all the
              tools you need to execute this experience.
            </Body>

            {/* Primary CTA */}
            <Button
              onClick={handleExport}
              className="flex w-full items-center justify-center gap-3 border-2 border-white bg-[#FF006E] px-8 py-5 font-display text-body-md uppercase tracking-label text-white shadow-lg transition-all duration-150 hover:-translate-y-1 hover:shadow-xl"
            >
              Launch in ATLVS
              <ArrowRight className="size-5" />
            </Button>

            {/* Secondary Actions */}
            <Stack direction="horizontal" gap={4} className="flex-wrap">
              <Button
                onClick={handleDownloadPDF}
                className="flex flex-1 items-center justify-center gap-2 border-2 border-grey-600 bg-transparent px-6 py-3 font-mono text-mono-sm uppercase tracking-label text-grey-400 transition-colors hover:border-white hover:text-white"
              >
                <Download className="size-4" />
                Download PDF
              </Button>
              <Button
                onClick={handleShare}
                className="flex flex-1 items-center justify-center gap-2 border-2 border-grey-600 bg-transparent px-6 py-3 font-mono text-mono-sm uppercase tracking-label text-grey-400 transition-colors hover:border-white hover:text-white"
              >
                <Share2 className="size-4" />
                Share Blueprint
              </Button>
              <Button
                onClick={onReset}
                className="flex flex-1 items-center justify-center gap-2 border-2 border-grey-600 bg-transparent px-6 py-3 font-mono text-mono-sm uppercase tracking-label text-grey-400 transition-colors hover:border-white hover:text-white"
              >
                <RotateCcw className="size-4" />
                Start Over
              </Button>
            </Stack>
          </Stack>

          {/* Right: Benefits Card */}
          <Card className="border-2 border-grey-700 bg-grey-900 p-8">
            <Text className="mb-6 font-mono text-mono-sm uppercase tracking-kicker text-grey-500">
              What you will get
            </Text>
            <Stack gap={4}>
              {BENEFITS.map((benefit, index) => (
                <Box key={index} className="flex items-start gap-3">
                  <Box className="flex size-6 shrink-0 items-center justify-center border-2 border-success bg-success/20">
                    <Check className="size-4 text-success" />
                  </Box>
                  <Text className="text-body-md text-grey-300">{benefit}</Text>
                </Box>
              ))}
            </Stack>

            {/* Social Proof */}
            <Box className="mt-8 border-t border-grey-700 pt-6">
              <Text className="font-mono text-mono-xs text-grey-500">
                Join 500+ producers who started with the Experience Generator
              </Text>
            </Box>
          </Card>
        </Grid>
      </Container>
    </FullBleedSection>
  );
}
