"use client";

import { useState } from "react";
import {
  Stack,
  Body,
  Box,
  Text,
  Button,
  Input,
  H3,
  Label,
} from "@ghxstship/ui";
import { X, Download, Loader2, Check, Mail } from "lucide-react";
import type { GeneratedBlueprint } from "../types";

// =============================================================================
// EMAIL CAPTURE MODAL
// Captures email before allowing PDF download
// =============================================================================

interface EmailCaptureModalProps {
  blueprint: GeneratedBlueprint;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EmailCaptureModal({
  blueprint,
  isOpen,
  onClose,
  onSuccess,
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setErrorMessage("Email is required");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/generator/capture-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || undefined,
          company: company || undefined,
          marketingConsent,
          blueprintId: blueprint.id,
          creativeSeed: blueprint.creativeSeed,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit");
      }

      setStatus("success");
      
      // Trigger PDF download after short delay
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  return (
    <Box className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-4">
      <Box className="relative w-full max-w-md border-2 border-ink-950 bg-white p-8 shadow-xl">
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          aria-label="Close"
        >
          <X className="size-4" />
        </Button>

        {status === "success" ? (
          <Stack gap={6} className="items-center text-center">
            <Box className="flex size-16 items-center justify-center border-2 border-success bg-success/10">
              <Check className="size-8 text-success" />
            </Box>
            <H3 className="font-display text-h4-md uppercase text-ink-950">
              Thank You!
            </H3>
            <Body className="text-grey-600">
              Your PDF is being prepared. The download will start automatically.
            </Body>
          </Stack>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack gap={6}>
              {/* Header */}
              <Stack gap={2} className="text-center">
                <Box className="mx-auto flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                  <Mail className="size-6 text-ink-950" />
                </Box>
                <H3 className="font-display text-h4-md uppercase text-ink-950">
                  Get Your Blueprint PDF
                </H3>
                <Body className="text-body-sm text-grey-600">
                  Enter your email to download the complete blueprint for{" "}
                  <Text className="font-weight-semibold">{blueprint.concept.name}</Text>
                </Body>
              </Stack>

              {/* Form Fields */}
              <Stack gap={4}>
                <Box>
                  <Label className="mb-2 block font-mono text-mono-xs uppercase tracking-kicker text-grey-500">
                    Email Address *
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full border-2 border-grey-300 px-4 py-3 focus:border-ink-950 focus:outline-none"
                  />
                </Box>

                <Box>
                  <Label className="mb-2 block font-mono text-mono-xs uppercase tracking-kicker text-grey-500">
                    Your Name
                  </Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full border-2 border-grey-300 px-4 py-3 focus:border-ink-950 focus:outline-none"
                  />
                </Box>

                <Box>
                  <Label className="mb-2 block font-mono text-mono-xs uppercase tracking-kicker text-grey-500">
                    Company / Organization
                  </Label>
                  <Input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Productions"
                    className="w-full border-2 border-grey-300 px-4 py-3 focus:border-ink-950 focus:outline-none"
                  />
                </Box>

                {/* Marketing Consent */}
                <Box className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="marketing-consent"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-1 size-4 border-2 border-grey-300"
                  />
                  <label
                    htmlFor="marketing-consent"
                    className="text-body-sm text-grey-600"
                  >
                    Send me tips on immersive experience design and ATLVS updates
                  </label>
                </Box>
              </Stack>

              {/* Error Message */}
              {errorMessage && (
                <Text className="text-body-sm text-error">{errorMessage}</Text>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={status === "loading"}
                variant="solid"
                size="lg"
                fullWidth
                icon={status === "loading" ? <Loader2 className="size-5 animate-spin" /> : <Download className="size-5" />}
                iconPosition="left"
              >
                {status === "loading" ? "Processing..." : "Download PDF"}
              </Button>

              {/* Privacy Note */}
              <Text className="text-center text-mono-xs text-grey-400">
                We respect your privacy. Unsubscribe anytime.
              </Text>
            </Stack>
          </form>
        )}
      </Box>
    </Box>
  );
}
