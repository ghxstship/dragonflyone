"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  Stack,
  Container,
  H1,
  Body,
  Box,
  Text,
  FullBleedSection,
  Button,
} from "@ghxstship/ui";
import { ArrowUp, Sparkles, Music, Palette, Zap, Globe, Heart, Star } from "lucide-react";

// =============================================================================
// GENERATOR HERO COMPONENT
// AI Chat-style hero with expandable input - inspired by Claude/ChatGPT UX
// =============================================================================

interface GeneratorHeroProps {
  creativeSeed: string;
  onCreativeSeedChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const QUICK_PROMPTS = [
  { label: "Festival", icon: Music, seed: "An immersive music festival celebrating electronic and world music fusion" },
  { label: "Gallery", icon: Palette, seed: "A contemporary art exhibition exploring the intersection of technology and nature" },
  { label: "Launch", icon: Zap, seed: "A high-energy product launch event with interactive demos and live performances" },
  { label: "Summit", icon: Globe, seed: "A global innovation summit bringing together thought leaders and changemakers" },
  { label: "Gala", icon: Heart, seed: "An elegant charity gala with immersive storytelling and live entertainment" },
  { label: "Premiere", icon: Star, seed: "A cinematic premiere experience with red carpet moments and exclusive screenings" },
];

export function GeneratorHero({
  creativeSeed,
  onCreativeSeedChange,
  onGenerate,
  isGenerating,
}: GeneratorHeroProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as content grows
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [creativeSeed, adjustTextareaHeight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (creativeSeed.trim()) {
      onGenerate();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (creativeSeed.trim()) {
        onGenerate();
      }
    }
  };

  const handleQuickPrompt = (seed: string) => {
    onCreativeSeedChange(seed);
    // Focus the textarea after selecting a prompt
    textareaRef.current?.focus();
  };

  const canSubmit = creativeSeed.trim().length > 0 && !isGenerating;

  return (
    <FullBleedSection
      background="white"
      className="relative min-h-screen"
    >
      <Container className="relative mx-auto flex min-h-screen max-w-container-3xl flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        {/* Main Content - Vertically Centered */}
        <Stack gap={10} className="w-full max-w-2xl">
          {/* Hero Text */}
          <Stack gap={4} className="text-center">
            <Box className="mx-auto mb-2 flex size-12 items-center justify-center rounded-avatar border-2 border-ink-950 bg-primary/10">
              <Sparkles className="size-6 text-primary" />
            </Box>
            <H1 className="font-display text-h1-lg uppercase leading-none tracking-display text-ink-950 md:text-display-sm">
              What experience will you create?
            </H1>
            <Body className="mx-auto max-w-md text-body-md text-grey-500">
              Describe your vision and watch AI transform it into a complete production blueprint.
            </Body>
          </Stack>

          {/* Chat-style Input Container */}
          <form onSubmit={handleSubmit} className="w-full">
            <Box className="relative overflow-hidden rounded-modal border-2 border-ink-950 bg-white shadow-md transition-shadow focus-within:shadow-primary">
              {/* Textarea - using native element to avoid design system border conflicts */}
              <textarea
                ref={textareaRef}
                value={creativeSeed}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onCreativeSeedChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your experience concept..."
                disabled={isGenerating}
                className="w-full resize-none border-0 bg-transparent px-4 pb-14 pt-4 font-body text-body-md text-ink-950 shadow-none outline-none placeholder:text-grey-400 focus:outline-none focus:ring-0"
                style={{ minHeight: "56px", maxHeight: "200px" }}
                rows={1}
              />
              
              {/* Bottom Action Bar */}
              <Box className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-grey-200 bg-grey-50/50 px-3 py-2">
                <Text className="text-mono-xs text-grey-400">
                  Press Enter to generate
                </Text>
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  variant={canSubmit ? "solid" : "ghost"}
                  size="sm"
                  className={canSubmit 
                    ? "rounded-button bg-primary text-white hover:bg-primary/90" 
                    : "rounded-button text-grey-400"
                  }
                  icon={<ArrowUp className="size-4" />}
                  iconPosition="left"
                >
                  Generate
                </Button>
              </Box>
            </Box>
          </form>

          {/* Quick Prompt Chips */}
          <Stack gap={3} className="text-center">
            <Text className="text-mono-xs uppercase tracking-kicker text-grey-400">
              Quick start
            </Text>
            <Box className="flex flex-wrap justify-center gap-2">
              {QUICK_PROMPTS.map((prompt) => {
                const IconComponent = prompt.icon;
                return (
                  <button
                    key={prompt.label}
                    type="button"
                    onClick={() => handleQuickPrompt(prompt.seed)}
                    disabled={isGenerating}
                    className="group inline-flex items-center gap-2 rounded-avatar border-2 border-grey-200 bg-white px-4 py-2 font-weight-medium text-grey-600 transition-all hover:-translate-y-0.5 hover:border-ink-950 hover:text-ink-950 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <IconComponent className="size-4 text-grey-400 transition-colors group-hover:text-primary" />
                    {prompt.label}
                  </button>
                );
              })}
            </Box>
          </Stack>
        </Stack>

        {/* Subtle Footer */}
        <Box className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <Text className="text-mono-xs text-grey-300">
            Powered by ATLVS AI
          </Text>
        </Box>
      </Container>
    </FullBleedSection>
  );
}
