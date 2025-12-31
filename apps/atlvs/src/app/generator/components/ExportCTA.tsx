"use client";

import { useState } from "react";
import {
  Stack,
  Container,
  Body,
  Box,
  Text,
  FullBleedSection,
  Card,
  Grid,
  H2,
  Button,
} from "@ghxstship/ui";
import { ArrowRight, Download, Share2, RotateCcw, Check, Loader2 } from "lucide-react";
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
  const [shareStatus, setShareStatus] = useState<"idle" | "loading" | "copied">("idle");
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleExport = async () => {
    // Store blueprint in sessionStorage for retrieval after auth
    sessionStorage.setItem("pendingBlueprint", JSON.stringify(blueprint));
    window.location.href = `/auth/signup?blueprint=${blueprint.id}&redirect=/onboarding/import-blueprint`;
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const response = await fetch("/api/generator/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blueprint, isAuthenticated: false }),
      });
      
      if (response.ok) {
        const html = await response.text();
        // Open in new window for printing
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          // Auto-trigger print dialog
          setTimeout(() => printWindow.print(), 500);
        }
      }
    } catch (error) {
      // Silent fail - user can retry
      void error;
    } finally {
      setPdfLoading(false);
    }
  };

  const handleShare = async () => {
    setShareStatus("loading");
    try {
      const response = await fetch("/api/generator/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blueprint }),
      });
      
      const data = await response.json();
      
      if (data.shareUrl) {
        await navigator.clipboard.writeText(data.shareUrl);
        setShareStatus("copied");
        setTimeout(() => setShareStatus("idle"), 3000);
      }
    } catch (error) {
      // Fallback to simple URL
      void error;
      const shareUrl = `${window.location.origin}/generator/share/${blueprint.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 3000);
    }
  };

  return (
    <FullBleedSection background="ink" className="py-24">
      <Container className="mx-auto max-w-container-4xl px-6 lg:px-8">
        <Grid cols={2} gap={12} className="items-center">
          {/* Left: CTA Content */}
          <Stack gap={6}>
            <H2 className="font-display text-display-sm uppercase tracking-display text-white">
              Ready to bring{" "}
              <Text as="span" className="text-accent">{blueprint.concept.name}</Text>{" "}
              to life?
            </H2>
            <Body className="text-body-lg text-grey-400">
              Launch your production in ATLVS and get instant access to all the
              tools you need to execute this experience.
            </Body>

            {/* Primary CTA */}
            <Button
              onClick={handleExport}
              className="flex w-full items-center justify-center gap-3 border-2 border-white bg-primary px-8 py-5 font-display text-body-md uppercase tracking-label text-white shadow-xl duration-150 hover:-translate-y-1"
            >
              Launch in ATLVS
              <ArrowRight className="size-5" />
            </Button>

            {/* Secondary Actions */}
            <Stack direction="horizontal" gap={4} className="flex-wrap">
              <Button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="flex flex-1 items-center justify-center gap-2 border-2 border-grey-600 bg-transparent px-6 py-3 font-mono text-mono-sm uppercase tracking-label text-grey-400 transition-colors hover:border-white hover:text-white disabled:opacity-50"
              >
                {pdfLoading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                {pdfLoading ? "Generating..." : "Download PDF"}
              </Button>
              <Button
                onClick={handleShare}
                disabled={shareStatus === "loading"}
                className="flex flex-1 items-center justify-center gap-2 border-2 border-grey-600 bg-transparent px-6 py-3 font-mono text-mono-sm uppercase tracking-label text-grey-400 transition-colors hover:border-white hover:text-white disabled:opacity-50"
              >
                {shareStatus === "loading" ? <Loader2 className="size-4 animate-spin" /> : shareStatus === "copied" ? <Check className="size-4" /> : <Share2 className="size-4" />}
                {shareStatus === "copied" ? "Link Copied!" : shareStatus === "loading" ? "Sharing..." : "Share Blueprint"}
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
                <Stack key={index} direction="horizontal" gap={3} className="items-start">
                  <Box className="flex size-6 shrink-0 items-center justify-center border-2 border-success bg-success/20">
                    <Check className="size-4 text-success" />
                  </Box>
                  <Text className="text-body-md text-grey-300">{benefit}</Text>
                </Stack>
              ))}
            </Stack>

            {/* Social Proof */}
            <Box className="mt-8 border-t-2 border-grey-700 pt-6">
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

export default ExportCTA;
