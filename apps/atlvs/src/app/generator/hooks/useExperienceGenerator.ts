"use client";

import { useState, useCallback } from "react";
import type { GeneratedBlueprint, GenerationProgress, ChatMessage } from "../types";

// =============================================================================
// USE EXPERIENCE GENERATOR HOOK
// Manages AI generation state, chat messages, and API calls
// =============================================================================

interface UseExperienceGeneratorReturn {
  creativeSeed: string;
  setCreativeSeed: (seed: string) => void;
  isGenerating: boolean;
  progress: GenerationProgress | null;
  blueprint: GeneratedBlueprint | null;
  error: string | null;
  messages: ChatMessage[];
  generate: () => Promise<void>;
  reset: () => void;
  sendFollowUp: (message: string) => Promise<void>;
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

function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function useExperienceGenerator(): UseExperienceGeneratorReturn {
  const [creativeSeed, setCreativeSeed] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [blueprint, setBlueprint] = useState<GeneratedBlueprint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addMessage = useCallback((role: ChatMessage["role"], content: string, metadata?: ChatMessage["metadata"]) => {
    const message: ChatMessage = {
      id: generateMessageId(),
      role,
      content,
      timestamp: new Date(),
      metadata,
    };
    setMessages((prev) => [...prev, message]);
    return message;
  }, []);

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

    // Add user message to chat
    addMessage("user", `Generate an experience blueprint for: ${creativeSeed.trim()}`);

    // Add assistant acknowledgment
    addMessage("assistant", `I'm creating a complete production blueprint based on "${creativeSeed.trim()}". This will include sensory design, spatial mapping, guest journey, and production documentation...`, {
      isStreaming: true,
    });

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

      // Add completion message with blueprint attachment
      addMessage(
        "assistant",
        `Your "${data.blueprint.concept.name}" blueprint is ready! I've designed a complete immersive experience with:\n\n• **Concept**: ${data.blueprint.concept.tagline}\n• **5 Senses**: Full sensory activation matrix\n• **Spatial Design**: ${data.blueprint.spatialTemporal.zones.length} distinct zones\n• **Guest Journey**: 5-phase URL→IRL experience\n• **Documentation**: Production-ready templates\n\nExplore the tabs below to see each section, or ask me to refine any aspect.`,
        {
          blueprintSection: "overview",
          attachments: [{ type: "blueprint", data: data.blueprint }],
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      addMessage("assistant", `I encountered an issue: ${errorMessage}. Please try again or adjust your concept.`);
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  }, [creativeSeed, simulateProgress, addMessage]);

  const sendFollowUp = useCallback(async (message: string) => {
    if (!message.trim() || !blueprint) return;

    addMessage("user", message);
    
    // Simulate AI response for follow-up questions
    setIsGenerating(true);
    
    try {
      // Add typing indicator
      const typingMessage = addMessage("assistant", "...", { isStreaming: true });
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Remove typing indicator and add real response
      setMessages((prev) => prev.filter((m) => m.id !== typingMessage.id));
      
      // Generate contextual response based on the question
      const lowerMessage = message.toLowerCase();
      let response = "";
      
      if (lowerMessage.includes("budget") || lowerMessage.includes("cost") || lowerMessage.includes("tier")) {
        response = `Based on the "${blueprint.concept.name}" blueprint, here are the execution tiers:\n\n• **Minimal**: ${blueprint.executionTiers.tier1_minimal.budget} - ${blueprint.executionTiers.tier1_minimal.description}\n• **Enhanced**: ${blueprint.executionTiers.tier2_enhanced.budget} - ${blueprint.executionTiers.tier2_enhanced.description}\n• **Premium**: ${blueprint.executionTiers.tier3_premium.budget} - ${blueprint.executionTiers.tier3_premium.description}\n• **Ultimate**: ${blueprint.executionTiers.tier4_ultimate.budget} - ${blueprint.executionTiers.tier4_ultimate.description}\n\nWould you like me to detail what's included in a specific tier?`;
      } else if (lowerMessage.includes("sense") || lowerMessage.includes("sensory")) {
        response = `The sensory design for "${blueprint.concept.name}" activates all five senses:\n\n• **Sight**: ${blueprint.sensoryDesign.sight.primary}\n• **Sound**: ${blueprint.sensoryDesign.sound.primary}\n• **Touch**: ${blueprint.sensoryDesign.touch.primary}\n• **Taste**: ${blueprint.sensoryDesign.taste.primary}\n• **Smell**: ${blueprint.sensoryDesign.smell.primary}\n\nEach sense has secondary activations and accessibility considerations built in.`;
      } else if (lowerMessage.includes("zone") || lowerMessage.includes("space") || lowerMessage.includes("spatial")) {
        const zoneList = blueprint.spatialTemporal.zones.slice(0, 4).map((z) => `• **${z.name}** (${z.code}): ${z.description}`).join("\n");
        response = `The spatial design includes ${blueprint.spatialTemporal.zones.length} distinct zones:\n\n${zoneList}\n\nThe XYZ foundation is set at X:${blueprint.spatialTemporal.x.level}/5 (scale), Y:${blueprint.spatialTemporal.y.level}/5 (footprint), Z:${blueprint.spatialTemporal.z.level}/5 (duration).`;
      } else if (lowerMessage.includes("journey") || lowerMessage.includes("guest") || lowerMessage.includes("experience")) {
        response = `The guest journey for "${blueprint.concept.name}" follows the URL→IRL framework:\n\n1. **Digital Pre**: ${blueprint.guestJourney.phase1_digital_pre.emotionalState}\n2. **Threshold In**: ${blueprint.guestJourney.phase2_threshold_in.emotionalState}\n3. **Physical**: ${blueprint.guestJourney.phase3_physical.emotionalState}\n4. **Threshold Out**: ${blueprint.guestJourney.phase4_threshold_out.emotionalState}\n5. **Digital Post**: ${blueprint.guestJourney.phase5_digital_post.emotionalState}\n\nEach phase has specific touchpoints and technology integrations.`;
      } else {
        response = `Great question about "${blueprint.concept.name}"! The blueprint includes comprehensive documentation for:\n\n• Creative concept and visual identity\n• 5-sense activation matrix\n• Spatial-temporal foundation with ${blueprint.spatialTemporal.zones.length} zones\n• Complete guest journey mapping\n• Production documentation and org structure\n• 4 execution tiers from minimal to ultimate\n\nWhat specific aspect would you like me to elaborate on?`;
      }
      
      addMessage("assistant", response);
    } catch (err) {
      addMessage("assistant", "I had trouble processing that request. Could you try rephrasing?");
    } finally {
      setIsGenerating(false);
    }
  }, [blueprint, addMessage]);

  const reset = useCallback(() => {
    setCreativeSeed("");
    setIsGenerating(false);
    setProgress(null);
    setBlueprint(null);
    setError(null);
    setMessages([]);
  }, []);

  return {
    creativeSeed,
    setCreativeSeed,
    isGenerating,
    progress,
    blueprint,
    error,
    messages,
    generate,
    reset,
    sendFollowUp,
  };
}
