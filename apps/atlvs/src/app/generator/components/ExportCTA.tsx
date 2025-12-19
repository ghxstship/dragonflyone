"use client";

import { useState } from "react";
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
import { ArrowRight, Download, Share2, RotateCcw, Check, Loader2 } from "lucide-react";
import type { GeneratedBlueprint } from "../types";
import { EmailCaptureModal } from "./EmailCaptureModal";
import { useGeneratorAnalytics } from "../hooks/useGeneratorAnalytics";
import { log } from '@ghxstship/config';

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
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  const { trackExport, trackPdfDownload, trackShare, trackReset } = useGeneratorAnalytics({
    blueprintId: blueprint.id,
    creativeSeed: blueprint.creativeSeed,
  });

  const handleExport = async () => {
    trackExport(false);
    // Store blueprint in sessionStorage for retrieval after auth
    sessionStorage.setItem("pendingBlueprint", JSON.stringify(blueprint));
    window.location.href = `/auth/signup?blueprint=${blueprint.id}&redirect=/onboarding/import-blueprint`;
  };

  const handleDownloadPDF = () => {
    trackPdfDownload(true);
    setShowEmailModal(true);
  };

  const handleEmailCaptureSuccess = async () => {
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
        trackPdfDownload(false);
      }
    } catch (error) {
      log.error('PDF download failed:', error instanceof Error ? error : undefined);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleShare = async () => {
    trackShare(false);
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
        trackShare(true);
        setTimeout(() => setShareStatus("idle"), 3000);
      }
    } catch (error) {
      log.error('Share failed:', error instanceof Error ? error : undefined);
      // Fallback to simple URL
      const shareUrl = `${window.location.origin}/generator/share/${blueprint.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 3000);
    }
  };

  const handleReset = () => {
    trackReset();
    onReset();
  };

  return (
    <FullBleedSection className="bg-ink-950 py-24">
      <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8">
        <Grid cols={2} gap={12} className="items-center lg:grid-cols-2">
          {/* Left: CTA Content */}
          <Stack gap={6}>
            <H2 className="text-display-sm font-display uppercase tracking-display text-white">
              Ready to bring{" "}
              <Text className="text-accent">{blueprint.concept.name}</Text>{" "}
              to life?
            </H2>
            <Body className="text-body-lg text-grey-400">
              Launch your production in ATLVS and get instant access to all the
              tools you need to execute this experience.
            </Body>

            {/* Primary CTA */}
            <Button
              onClick={handleExport}
              variant="pop"
              size="lg"
              fullWidth
              icon={<ArrowRight className="size-5" />}
            >
              Launch in ATLVS
            </Button>

            {/* Secondary Actions */}
            <Stack direction="horizontal" gap={4} className="flex-wrap">
              <Button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                variant="outlineWhite"
                size="md"
                icon={pdfLoading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                iconPosition="left"
                className="flex-1"
              >
                {pdfLoading ? "Generating..." : "Download PDF"}
              </Button>
              <Button
                onClick={handleShare}
                disabled={shareStatus === "loading"}
                variant="outlineWhite"
                size="md"
                icon={shareStatus === "loading" ? <Loader2 className="size-4 animate-spin" /> : shareStatus === "copied" ? <Check className="size-4" /> : <Share2 className="size-4" />}
                iconPosition="left"
                className="flex-1"
              >
                {shareStatus === "copied" ? "Link Copied!" : shareStatus === "loading" ? "Sharing..." : "Share Blueprint"}
              </Button>
              <Button
                onClick={handleReset}
                variant="outlineWhite"
                size="md"
                icon={<RotateCcw className="size-4" />}
                iconPosition="left"
                className="flex-1"
              >
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

      {/* Email Capture Modal */}
      <EmailCaptureModal
        blueprint={blueprint}
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSuccess={handleEmailCaptureSuccess}
      />
    </FullBleedSection>
  );
}
