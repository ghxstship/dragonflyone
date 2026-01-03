"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
  Badge,
  AIChatLayout,
  AIChatHeader,
  AIChatSidebar,
  AIChatMain,
  AIChatArtifact,
  AIChatMessage,
  AIChatTypingIndicator,
  AIChatInput,
  AIChatSuggestionChips,
  AIChatSuggestionChip,
  AIChatConversationGroup,
  AIChatConversationItem,
} from "@ghxstship/ui";
import { useAuthContext } from "@ghxstship/config";
import {
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  MessageSquare,
  User,
  Bot,
  Copy,
  RefreshCw,
  Send,
  Loader2,
  Lightbulb,
  Palette,
  DollarSign,
  Map,
} from "lucide-react";
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
// Layout: AI Chat Layout with sidebar, main chat, and artifact panel
// Authentication: Only required when saving/exporting the generated blueprint
// =============================================================================

// Suggestion prompts for the chat
const SUGGESTION_PROMPTS = [
  { label: "Adjust Budget", icon: DollarSign, prompt: "Can you adjust the budget breakdown?" },
  { label: "Sensory Design", icon: Palette, prompt: "Tell me more about the sensory activations" },
  { label: "Zone Details", icon: Map, prompt: "Explain the zone layout in more detail" },
  { label: "Creative Ideas", icon: Lightbulb, prompt: "Suggest more creative elements" },
];

export default function GeneratorPage() {
  const { user } = useAuthContext();
  const isAuthenticated = !!user;
  
  // Layout state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [artifactCollapsed, setArtifactCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
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
  } = useExperienceGenerator();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = useCallback((message: string) => {
    if (message.trim()) {
      sendFollowUp(message.trim());
      setInputValue("");
    }
  }, [sendFollowUp]);

  // Handle suggestion chip click
  const handleSuggestionClick = useCallback((prompt: string) => {
    handleSendMessage(prompt);
  }, [handleSendMessage]);

  // Copy message to clipboard
  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
  }, []);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // Toggle artifact panel
  const toggleArtifact = useCallback(() => {
    setArtifactCollapsed(prev => !prev);
  }, []);

  // Initial state - show hero with input
  if (!blueprint && !isGenerating && messages.length === 0) {
    return (
      <AtlvsAppLayout variant="public" background="white" rawContent>
        <GeneratorHero
          creativeSeed={creativeSeed}
          onCreativeSeedChange={setCreativeSeed}
          onGenerate={generate}
          isGenerating={isGenerating}
        />
      </AtlvsAppLayout>
    );
  }

  // Generating state - show progress
  if (isGenerating && !blueprint) {
    return (
      <AtlvsAppLayout variant="public" background="white" rawContent>
        <GeneratorProgress
          progress={progress}
          creativeSeed={creativeSeed}
        />
      </AtlvsAppLayout>
    );
  }

  // Error state
  if (error && !blueprint) {
    return (
      <AtlvsAppLayout variant="public" background="white" rawContent>
        <FullBleedSection background="white" className="min-h-screen py-24">
          <Container className="mx-auto max-w-container-4xl px-6 text-center">
            <Stack gap={6} className="items-center">
              <Box className="flex size-16 items-center justify-center border-2 border-error bg-error/10">
                <Text className="text-h3-md text-error">!</Text>
              </Box>
              <H2 className="text-text-primary">Something went wrong</H2>
              <Body className="text-text-secondary">{error}</Body>
              <Button
                onClick={reset}
                className="border-2 border-border bg-white px-8 py-4 font-display uppercase tracking-label shadow-sm"
              >
                Try Again
              </Button>
            </Stack>
          </Container>
        </FullBleedSection>
      </AtlvsAppLayout>
    );
  }

  // Blueprint generated - show AI Chat Layout
  if (blueprint) {
    return (
      <AIChatLayout
        sidebarCollapsed={sidebarCollapsed}
        artifactCollapsed={artifactCollapsed}
        showArtifact={true}
        header={
          <AIChatHeader
            left={
              <Stack direction="horizontal" gap={3} className="items-center">
                <Button
                  onClick={toggleSidebar}
                  className="flex size-9 items-center justify-center border-2 border-border bg-white p-0 transition-all duration-100 hover:-translate-y-0.5 hover:shadow-sm"
                  aria-label={sidebarCollapsed ? "Show history" : "Hide history"}
                >
                  {sidebarCollapsed ? (
                    <PanelLeftOpen className="size-4 text-text-primary" />
                  ) : (
                    <PanelLeftClose className="size-4 text-text-primary" />
                  )}
                </Button>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Box className="flex size-8 items-center justify-center border-2 border-border bg-primary">
                    <Sparkles className="size-4 text-white" />
                  </Box>
                  <Text className="font-display text-h6-md uppercase tracking-label text-text-primary">
                    Experience Generator
                  </Text>
                  <Badge className="border-2 border-primary bg-primary/10 px-2 py-0.5 font-mono text-mono-xs uppercase text-primary">
                    AI
                  </Badge>
                </Stack>
              </Stack>
            }
            right={
              <Stack direction="horizontal" gap={2} className="items-center">
                <Button
                  onClick={reset}
                  className="flex items-center gap-sm border-2 border-border bg-white px-3 py-2 font-display text-mono-xs uppercase tracking-label text-text-primary transition-all duration-100 hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <Plus className="size-4" />
                  <Text className="hidden sm:inline">New</Text>
                </Button>
                <Button
                  onClick={toggleArtifact}
                  className="flex size-9 items-center justify-center border-2 border-border bg-white p-0 transition-all duration-100 hover:-translate-y-0.5 hover:shadow-sm"
                  aria-label={artifactCollapsed ? "Show blueprint" : "Hide blueprint"}
                >
                  {artifactCollapsed ? (
                    <PanelRightOpen className="size-4 text-text-primary" />
                  ) : (
                    <PanelRightClose className="size-4 text-text-primary" />
                  )}
                </Button>
              </Stack>
            }
          />
        }
        sidebar={
          <AIChatSidebar
            header={
              <Text className="font-heading text-h6-sm uppercase tracking-label text-text-primary">
                Conversation History
              </Text>
            }
          >
            <AIChatConversationGroup label="Today">
              <AIChatConversationItem
                title={blueprint.concept?.name || "Current Blueprint"}
                preview={creativeSeed}
                timestamp={new Date()}
                isActive={true}
                icon={<MessageSquare className="size-4" />}
                onSelect={() => {}}
              />
            </AIChatConversationGroup>
          </AIChatSidebar>
        }
        main={
          <AIChatMain
            messages={
              <Box className="flex flex-col gap-lg p-6">
                {messages.map((msg, index) => (
                  <AIChatMessage
                    key={index}
                    role={msg.role as "user" | "assistant"}
                    avatar={
                      msg.role === "user" ? (
                        <User className="size-5" />
                      ) : (
                        <Bot className="size-5" />
                      )
                    }
                    timestamp={msg.timestamp}
                    actions={
                      msg.role === "assistant" && (
                        <Stack direction="horizontal" gap={1}>
                          <Button
                            onClick={() => handleCopyMessage(msg.content)}
                            className="flex size-7 items-center justify-center bg-transparent p-0 text-text-disabled hover:text-text-primary"
                            aria-label="Copy message"
                          >
                            <Copy className="size-3.5" />
                          </Button>
                          <Button
                            onClick={() => handleSendMessage("Regenerate the last response")}
                            className="flex size-7 items-center justify-center bg-transparent p-0 text-text-disabled hover:text-text-primary"
                            aria-label="Regenerate"
                          >
                            <RefreshCw className="size-3.5" />
                          </Button>
                        </Stack>
                      )
                    }
                  >
                    {msg.content}
                  </AIChatMessage>
                ))}
                {isGenerating && (
                  <AIChatTypingIndicator
                    avatar={<Bot className="size-5" />}
                    label="Generating response..."
                  />
                )}
                <Box ref={messagesEndRef} />
              </Box>
            }
            input={
              <Stack gap={4}>
                <AIChatInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSubmit={handleSendMessage}
                  placeholder="Ask about budget, sensory design, zones..."
                  disabled={isGenerating}
                  isLoading={isGenerating}
                  rightActions={
                    <Button
                      type="submit"
                      disabled={!inputValue.trim() || isGenerating}
                      className="flex size-9 items-center justify-center border-2 border-border bg-primary p-0 text-white transition-all duration-100 hover:-translate-y-0.5 hover:shadow-sm disabled:opacity-50"
                      aria-label="Send message"
                    >
                      {isGenerating ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                    </Button>
                  }
                  suggestions={
                    <AIChatSuggestionChips>
                      {SUGGESTION_PROMPTS.map((suggestion) => (
                        <AIChatSuggestionChip
                          key={suggestion.label}
                          label={suggestion.label}
                          icon={<suggestion.icon className="size-3.5" />}
                          onSelect={() => handleSuggestionClick(suggestion.prompt)}
                        />
                      ))}
                    </AIChatSuggestionChips>
                  }
                />
              </Stack>
            }
          />
        }
        artifact={
          <AIChatArtifact
            header={
              <Stack direction="horizontal" gap={2} className="items-center justify-between">
                <Text className="font-heading text-h6-sm uppercase tracking-label text-text-primary">
                  Blueprint Preview
                </Text>
                <Badge className="border-2 border-success/30 bg-success/10 px-2 py-0.5 font-mono text-mono-xs text-success">
                  Generated
                </Badge>
              </Stack>
            }
            footer={
              <ExportCTA blueprint={blueprint} onReset={reset} isAuthenticated={isAuthenticated} />
            }
          >
            <BlueprintPreview blueprint={blueprint} />
          </AIChatArtifact>
        }
      />
    );
  }

  // Fallback - should not reach here
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      <GeneratorHero
        creativeSeed={creativeSeed}
        onCreativeSeedChange={setCreativeSeed}
        onGenerate={generate}
        isGenerating={isGenerating}
      />
    </AtlvsAppLayout>
  );
}
