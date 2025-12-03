"use client";

import { useState, useCallback } from "react";
import type { GeneratedBlueprint, GenerationProgress } from "../types";

// =============================================================================
// USE EXPERIENCE GENERATOR HOOK
// Manages AI generation state and API calls
// =============================================================================

interface UseExperienceGeneratorReturn {
  creativeSeed: string;
  setCreativeSeed: (seed: string) => void;
  isGenerating: boolean;
  progress: GenerationProgress | null;
  blueprint: GeneratedBlueprint | null;
  error: string | null;
  generate: () => Promise<void>;
  reset: () => void;
}

const GENERATION_STEPS = [
  "Analyzing creative concept",
  "Generating experience name and narrative",
  "Designing 5 Senses activation matrix",
  "Mapping XYZ spatial-temporal foundation",
  "Creating guest journey phases",
  "Building production documentation",
  "Calculating execution tiers",
  "Finalizing blueprint",
];

export function useExperienceGenerator(): UseExperienceGeneratorReturn {
  const [creativeSeed, setCreativeSeed] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [blueprint, setBlueprint] = useState<GeneratedBlueprint | null>(null);
  const [error, setError] = useState<string | null>(null);

  const simulateProgress = useCallback(async () => {
    for (let i = 0; i < GENERATION_STEPS.length; i++) {
      setProgress({
        step: i + 1,
        totalSteps: GENERATION_STEPS.length,
        currentStep: GENERATION_STEPS[i],
        completedSteps: GENERATION_STEPS.slice(0, i),
        percentage: Math.round(((i + 1) / GENERATION_STEPS.length) * 100),
      });
      // Simulate varying step durations
      await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 2000));
    }
  }, []);

  const generate = useCallback(async () => {
    if (!creativeSeed.trim()) {
      setError("Please enter a creative concept");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setBlueprint(null);

    try {
      // Start progress simulation
      const progressPromise = simulateProgress();

      // Make API call
      const response = await fetch("/api/generator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creativeSeed: creativeSeed.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Generation failed");
      }

      const data = await response.json();
      
      // Wait for progress animation to complete
      await progressPromise;
      
      setBlueprint(data.blueprint);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  }, [creativeSeed, simulateProgress]);

  const reset = useCallback(() => {
    setCreativeSeed("");
    setIsGenerating(false);
    setProgress(null);
    setBlueprint(null);
    setError(null);
  }, []);

  return {
    creativeSeed,
    setCreativeSeed,
    isGenerating,
    progress,
    blueprint,
    error,
    generate,
    reset,
  };
}
